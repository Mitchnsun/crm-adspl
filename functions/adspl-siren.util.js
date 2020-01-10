const { get, sortBy, set, cloneDeep } = require('lodash');

const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
function getFromFirebaseID(firebaseId) {
  const id = firebaseId.substring(0, 8);
  let timestamp = 0;
  for (let i = 0; i < id.length; i++) {
    const c = id.charAt(i);
    timestamp = timestamp * 64 + PUSH_CHARS.indexOf(c);
  }
  return timestamp;
}

function reducer(state, h) {
  const newState = cloneDeep(state);

  if (!newState.cotisations) {
    newState.cotisations = {};
  }

  switch (h.task) {
    case 'init':
      if (h._version === 0) {
        newState.insee = h.input.insee;
        newState.siren = h.input.insee.SIREN;
        newState.siret = h.input.insee.SIRET;
        newState.name = h.input.insee.NOMEN_LONG;
      } else if (h._version === 1) {
        newState.insee = h.input.insee;
        newState.siren = h.input.insee.siren;
        newState.siret = h.input.insee.siret;
        newState.name = '';
      }
      break;
    case 'registration': {
      if (!newState.cotisations[h.input.cotisation]) {
        newState.cotisations[h.input.cotisation] = {};
      }
      const o = newState.cotisations[h.input.cotisation];

      o.accountant = h.input.accountant;
      o.registredAmount = h.input.amount;
      o.registredPayroll = h.input.payroll;
      o.registredNumberOfEmployes = h.input.numberOfEmployes;

      newState.email = newState.email ? newState.email : h.input.email;
      break;
    }
    case 'payment-credit-card': {
      if (!newState.cotisations[h.input.cotisation]) {
        newState.cotisations[h.input.cotisation] = {};
      }
      const o = newState.cotisations[h.input.cotisation];
      if (h.input.type === 'init') {
        set(o, `payments.credit-card.${h.input.ref}`, {
          amount: h.input.amount / 100,
          paymentStatus: 'PENDING',
          date: h.date,
        });
      }

      if (h.input.type === 'end') {
        const ref = get(h.input, 'response.order.ref');
        const amount = get(h.input, 'response.order.amount', 0) / 100;
        const status = get(h.input, 'response.result.shortMessage');
        if (status && ref) {
          set(o, `payments.credit-card.${ref}.paymentStatus`, status);
          set(o, `payments.credit-card.${ref}.amount`, amount);
          set(o, `payments.credit-card.${ref}.date`, h.date);
        }
      }

      break;
    }
    case 'payment-sepa': {
      if (!newState.cotisations[h.input.cotisation]) {
        newState.cotisations[h.input.cotisation] = {};
      }
      const o = newState.cotisations[h.input.cotisation];
      if (h.input.type === 'PAY') {
        if (get(h.input, 'response.error')) {
          break;
        }
        const ref = get(h.input, 'response.payments.id');
        const amount = get(h.input, 'response.payments.amount');
        set(o, `payments.sepa.${ref}`, {
          amount: amount / 100,
          paymentStatus: 'PENDING',
        });
      }
      if (h.input.type === 'COMPLETE') {
        if (get(h.input, 'response.error')) break;
        newState.sepaMandate = get(h.input, 'response.redirect_flows.links.mandate', '');
      }
      if (h.input.type === 'NOTIFY') {
        const ref = get(h.input, 'response.payment.payments.id');
        const status = get(h.input, 'response.payment.payments.status');
        const date = get(h.input, 'response.payment.payments.created_at');
        if (status) {
          set(o, `payments.sepa.${ref}.paymentStatus`, status);
          set(o, `payments.sepa.${ref}.date`, date);
        }
      }
      break;
    }
    case 'payment-check': {
      if (!newState.cotisations[h.input.cotisation]) {
        newState.cotisations[h.input.cotisation] = {};
      }
      const o = newState.cotisations[h.input.cotisation];
      set(o, `payments.check`, {
        date: h.date,
      });
      break;
    }
    default:
      console.log('WARN - ignored event', JSON.stringify(h));
      break;
  }

  Object.keys(newState.cotisations).forEach(c => {
    const cotisation = newState.cotisations[c];
    cotisation.status = 'PENDING';

    cotisation.paymentMethods = [];

    let lastPaymentState = null;

    if (cotisation.payments) {
      Object.keys(cotisation.payments).forEach(p => {
        switch (p) {
          case 'check': {
            cotisation.paymentMethods.push('check');
            break;
          }
          case 'sepa': {
            Object.keys(cotisation.payments[p]).forEach(ref => {
              if (cotisation.payments[p][ref].paymentStatus === 'paid_out') {
                cotisation.paymentMethods.push('sepa');
              } else if (!lastPaymentState || lastPaymentState.date < cotisation.payments[p][ref].date) {
                lastPaymentState = cotisation.payments[p][ref];
              }
            });

            break;
          }
          case 'credit-card': {
            Object.keys(cotisation.payments[p]).forEach(ref => {
              if (cotisation.payments[p][ref].paymentStatus === 'ACCEPTED') {
                cotisation.paymentMethods.push('credit-card');
              } else if (!lastPaymentState || lastPaymentState.date < cotisation.payments[p][ref].date) {
                lastPaymentState = cotisation.payments[p][ref];
              }
            });
            break;
          }
          default: {
            console.log('WARN - UNKWNON type of payments');
            break;
          }
        }
      });
    }

    cotisation.status = cotisation.paymentMethods.length > 0 ? 'PAID' : cotisation.status;
    if (lastPaymentState && cotisation.status !== 'PAID') {
      cotisation.status = ['REFUSED', 'failed'].includes(lastPaymentState.paymentStatus) ? 'FAILED' : 'PENDING';
    }
  });
  return newState;
}

function createHistoryFromCotisation(raw) {
  const history = [];
  if (!raw.cotisations) return history;
  Object.keys(raw.cotisations).forEach(c => {
    const cotisation = raw.cotisations[c];
    history.push({
      task: 'registration',
      input: { ...get(cotisation, 'REGISTRATION', {}), cotisation: c },
      date: get(cotisation, 'REGISTRATION', {}).date,
      generate: true,
    });
    const creditCard = get(cotisation, 'PAYMENT.CREDIT_CARD');
    if (creditCard) {
      const init = get(creditCard, 'INIT');
      if (init) {
        history.push({
          task: 'payment-credit-card',
          input: { type: 'init', ...init, cotisation: c },
          date: init.date,
          generate: true,
        });
      }

      const end = get(creditCard, 'END');
      if (end) {
        history.push({
          task: 'payment-credit-card',
          input: { type: 'end', ...end, cotisation: c },
          date: end.date,
          generate: true,
        });
      }

      const last = get(creditCard, 'LAST');
      if (last) {
        // Ce champs vaut soit END soit NOTIFY
        // history.push({ type: 'payment-credit-card-last', ...last })
      }

      const notify = get(creditCard, 'NOTIFY');
      if (notify) {
        Object.keys(notify).forEach(n => {
          const notification = notify[n];
          history.push({
            task: 'payment-credit-card',
            input: { type: 'notify', ...notification, cotisation: c },
            date: notification.date,
            generate: true,
          });
        });
      }
    }
    const check = get(cotisation, 'PAYMENT.CHECK');
    if (check) {
      history.push({ task: 'payment-check', input: { ...check, cotisation: c }, date: check.date, generate: true });
    }

    const sepa = get(cotisation, 'PAYMENT.SEPA');
    if (sepa) {
      Object.keys(sepa.events).forEach(e => {
        const event = sepa.events[e];
        const date =
          get(event, 'response.redirect_flows.created_at') ||
          get(event, 'response.payments.created_at') ||
          get(event, 'response.event.created_at') ||
          new Date(getFromFirebaseID(e)).toISOString();
        history.push({ task: 'payment-sepa', date, input: { ...event, cotisation: c }, generate: true });
      });
    }
  });
  return history;
}

function createHistoryFromSiren(raw) {
  const history = [];

  history.push({
    task: 'init',
    input: { insee: get(raw, 'details', {}) },
    date: get(raw, 'creationDate'),
    _version: 0,
    generate: true,
  });

  history.push(...createHistoryFromCotisation(raw));
  return sortBy(history, o => o.date);
}
function createHistoryFromSiret(raw) {
  const history = raw._history ? Object.values(raw._history) : [];

  history.push({
    task: 'init',
    input: { insee: get(raw, 'insee', {}) },
    date: get(raw, 'creationDate'),
    _version: 1,
    generate: true,
  });

  history.push(...createHistoryFromCotisation(raw));
  return sortBy(history, o => o.date);
}
function createStateFromHistory(history) {
  return history.reduce(reducer, {});
}

// 824569263
function mapSiren(raw) {
  if (!raw) return null;
  const history = createHistoryFromSiren(raw);
  return {
    ...createStateFromHistory(history),
    _history: history,
  };
}

// 82788226700020
function mapSiret(raw) {
  if (!raw) return null;
  const history = createHistoryFromSiret(raw);
  return {
    ...createStateFromHistory(history),
    infos: raw.infos,
    _history: history,
  };
}

module.exports = {
  mapSiren,
  mapSiret,
};

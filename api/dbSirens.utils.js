const { get } = require('lodash');

// Cotisation Status
const STATUS = {
  TODO: 'TODO', // Unregistered
  DATA_VALIDATED: 'DATA_VALIDATED', // Registered but not paid
  PAID: 'PAID', // Paid
  PENDING_PAYMENT: 'PENDING_PAYMENT', // Waiting for the bank response payment
  CANCELLED: 'CANCELLED', // Payment cancelled by the user
  FAILED: 'FAILED', // Payment attempted but failed
  PAID_MULTI: 'PAID_MULTI', // Multiple payments due to bugs
};
exports.STATUS = STATUS;

// Payment status
const PSTATUS = {
  OK: 'OK', // Paid
  PENDING: 'PENDING', // Pending
  CANCELLED: 'CANCELLED', // Payment cancelled by the user
  KO: 'KO', // Payment attempted but failed
  UNKNOWN: 'UNKNOWN', // Payment attempted but failed
  MULTI: 'MULTI', // Multiple payments due to bugs
};
exports.PSTATUS = PSTATUS;

const isCreditCardPaymentCompleted = creditCardPayment =>
  get(creditCardPayment, 'LAST') &&
  get(creditCardPayment, 'END') &&
  get(creditCardPayment, 'LAST.response.result.code') !== '02324';

function getPaymentCreditCardStatus(creditCardPayment) {
  if (!creditCardPayment) return PSTATUS.UNKNOWN;

  const statusShortMessage =
    get(creditCardPayment, 'LAST.response.result.shortMessage') ||
    get(creditCardPayment, 'END.response.result.shortMessage');

  if (statusShortMessage === 'ACCEPTED') return PSTATUS.OK;
  if (statusShortMessage === 'CANCELLED') return PSTATUS.CANCELLED;
  if (get(creditCardPayment, 'INIT') && isCreditCardPaymentCompleted(creditCardPayment)) return PSTATUS.PENDING;

  return PSTATUS.KO;
}

function getCreditCardPaymentDate(creditCardPayment) {
  if (get(creditCardPayment, 'LAST.response.result.shortMessage') === 'ACCEPTED') {
    return get(creditCardPayment, 'LAST.response.transaction.date');
  }
  if (get(creditCardPayment, 'END.response.result.shortMessage') === 'ACCEPTED') {
    return get(creditCardPayment, 'END.response.transaction.date');
  }
  return '';
}

const getPaymentCheckStatus = checkPayment => {
  if (checkPayment.PAID) return 'PAID';
  if (checkPayment.PRINTED) return 'PRINTED';
  if (checkPayment.PRINT) return 'TO_PRINT';
  if (checkPayment.uriFirebaseStorage !== undefined && checkPayment.uriFirebaseStorage !== null) return 'PAID'; // Was for cotisation 2018
  return PSTATUS.UNKNOWN;
};

function getPaymentStatus(payment) {
  const paymentCreditCardStatus = getPaymentCreditCardStatus(get(payment, 'CREDIT_CARD'));
  const paymentCheckStatus = getPaymentCheckStatus(get(payment, 'CHECK'));
  const paymentSepaStatus = get(payment, 'SEPA.state.status');
  const knownStatus = [PSTATUS.OK, PSTATUS.PENDING, PSTATUS.CANCELLED, PSTATUS.KO];
  const foundStatus = knownStatus.find(status =>
    [paymentCreditCardStatus, paymentCheckStatus, paymentSepaStatus].includes(status),
  );

  const multiStatus =
    [paymentCreditCardStatus, paymentCheckStatus, paymentSepaStatus].filter(s => s === PSTATUS.OK).length > 1
      ? PSTATUS.MULTI
      : false;

  return multiStatus || foundStatus || PSTATUS.UNKNOWN;
}

function getCotisationStatus(cotisation, options) {
  const paymentStatus = getPaymentStatus(get(cotisation, 'PAYMENT'));

  if (paymentStatus === PSTATUS.UNKNOWN && get(cotisation, 'REGISTRATION')) {
    return STATUS.DATA_VALIDATED;
  }

  switch (paymentStatus) {
    case PSTATUS.OK:
      return STATUS.PAID;
    case PSTATUS.MULTI:
      return get(options, 'multi') ? STATUS.PAID_MULTI : STATUS.PAID;
    case PSTATUS.PENDING:
      return STATUS.PENDING_PAYMENT;
    case PSTATUS.CANCELLED:
      return STATUS.CANCELLED;
    case PSTATUS.KO:
      return STATUS.FAILED;
    default:
      return STATUS.TODO;
  }
}

function getPayments(cotisation) {
  const res = [];

  if (get(cotisation, 'PAYMENT.CREDIT_CARD')) {
    res.push({
      type: 'CREDIT_CARD',
      date: get(cotisation, 'PAYMENT.CREDIT_CARD.END.date'),
      status: getPaymentCreditCardStatus(get(cotisation, 'PAYMENT.CREDIT_CARD')),
    });
  }

  if (get(cotisation, 'PAYMENT.CHECK')) {
    res.push({
      type: 'CHECK',
      date: get(cotisation, 'PAYMENT.CHECK.date'),
      status: getPaymentCheckStatus(get(cotisation, 'PAYMENT.CHECK')),
    });
  }

  if (get(cotisation, 'PAYMENT.SEPA')) {
    res.push({
      type: 'SEPA',
      date: getSepaPaymentDate(get(cotisation, 'PAYMENT.SEPA.events')),
      status: get(cotisation, 'PAYMENT.SEPA.state.status'),
    });
  }

  return res;
}

function getSepaPaymentDate(sepaEvents) {
  const eventName = Object.keys(sepaEvents).find(n => {
    const evt = sepaEvents[n];
    return get(evt, 'response.payment.payments.status') === 'paid_out';
  });

  return get(sepaEvents[eventName], 'response.payment.payments.metadata.date');
}

function getPaymentMethod(cotisation) {
  return getPayments(cotisation)
    .filter(p => p.status === PSTATUS.OK || p.status === PSTATUS.MULTI)
    .map(p => p.type)
    .join(',');
}

function getPaymentDate(cotisation) {
  return getPayments(cotisation)
    .filter(p => p.status === PSTATUS.OK || p.status === PSTATUS.MULTI)
    .map(p => p.date)[0];
}

exports.extractCotisations = dbSiren => {
  if (!dbSiren) {
    return null;
  }

  return {
    cotisations: Object.entries(dbSiren.cotisations || {}).map(([year, cotisation]) => ({
      year,
      status: getCotisationStatus(cotisation),
      amount: get(cotisation, 'REGISTRATION.amount'),
      numberOfEmployees: get(cotisation, 'REGISTRATION.numberOfEmployees'),
      email: get(cotisation, 'REGISTRATION.email'),
      payMethod: getPaymentMethod(cotisation),
    })),
  };
};

function getPayment(cotisation) {
  return {
    status: getPaymentStatus(get(cotisation, 'PAYMENT')),
    type: getPaymentMethod(cotisation),
    date: getPaymentDate(cotisation),
    details: getPayments(cotisation),
  };
}

function mergeCotisationsStatus(s1, s2) {
  if (s1 === STATUS.PAID_MULTI || s2 === STATUS.PAID_MULTI) return STATUS.PAID_MULTI;
  if (s1 === STATUS.PAID && s2 === STATUS.PAID) return STATUS.PAID_MULTI;
  if (s1 === STATUS.PAID || s2 === STATUS.PAID) return STATUS.PAID;
  if (s1 === STATUS.PENDING_PAYMENT || s2 === STATUS.PENDING_PAYMENT) return STATUS.PENDING_PAYMENT;
  if (s1 === STATUS.CANCELLED || s2 === STATUS.CANCELLED) return STATUS.CANCELLED;
  if (s1 === STATUS.FAILED || s2 === STATUS.FAILED) return STATUS.FAILED;
  return STATUS.TODO;
}

function mergePaymentStatus(s1, s2) {
  if (s1 === PSTATUS.MULTI || s2 === PSTATUS.MULTI) return PSTATUS.MULTI;
  if (s1 === PSTATUS.OK && s2 === PSTATUS.OK) return PSTATUS.MULTI;
  if (s1 === PSTATUS.OK || s2 === PSTATUS.OK) return PSTATUS.OK;
  if (s1 === PSTATUS.PENDING || s2 === PSTATUS.PENDING) return PSTATUS.PENDING;
  if (s1 === PSTATUS.CANCELLED || s2 === PSTATUS.CANCELLED) return PSTATUS.CANCELLED;
  if (s1 === PSTATUS.KO || s2 === PSTATUS.KO) return PSTATUS.KO;
  return PSTATUS.UNKNOWN;
}

function mergePayments(p1, p2) {
  return {
    status: mergePaymentStatus(p1.status, p2.status),
    type: [p1.type, p2.type].filter(Boolean).join(','),
    date: p1.date,
    details: p1.details.concat(p2.details),
  };
}

function mergeCotisations(c1, c2, personalData) {
  const statusC1 = getCotisationStatus(c1, { multi: true });
  const statusC2 = getCotisationStatus(c2, { multi: true });

  const payment1 = getPayment(c1);
  const payment2 = getPayment(c2);

  return {
    status: mergeCotisationsStatus(statusC1, statusC2),
    amount: get(c1, 'REGISTRATION.amount') || get(c2, 'REGISTRATION.amount'),
    registrationDate: get(c1, 'REGISTRATION.date') || get(c2, 'REGISTRATION.date'),
    payroll: get(c1, 'REGISTRATION.payroll') || get(c2, 'REGISTRATION.payroll'),
    numberOfEmployees: get(c1, 'REGISTRATION.numberOfEmployees') || get(c2, 'REGISTRATION.numberOfEmployees'),
    email: personalData.email ? get(c1, 'REGISTRATION.email') || get(c2, 'REGISTRATION.email') : undefined,
    accountant: get(c1, 'REGISTRATION.accountant') || get(c2, 'REGISTRATION.accountant'),
    payment: mergePayments(payment1, payment2),
  };
}

function getCotisations(year, cotisations, personalData) {
  if (year === '2018') {
    const cotisation2018 = get(cotisations, '2018', {});
    const cotisation20182 = get(cotisations, '20182', {});
    const cotisation2019 = get(cotisations, 'REPRISE__WAS_2019_BUT_SHOULD_BE_2018', {});
    const cotisation20192 = get(cotisations, 'REPRISE__WAS_20192_BUT_SHOULD_BE_20182', {});

    return {
      '2018': mergeCotisations(cotisation2018, cotisation2019, personalData),
      '20182': mergeCotisations(cotisation20182, cotisation20192, personalData),
    };
  }
  const cotisation = get(cotisations, year, {});
  return {
    [year]: {
      status: getCotisationStatus(cotisation, { multi: true }),
      amount: get(cotisation, 'REGISTRATION.amount'),
      registrationDate: get(cotisation, 'REGISTRATION.date'),
      payroll: get(cotisation, 'REGISTRATION.payroll'),
      numberOfEmployees: get(cotisation, 'REGISTRATION.numberOfEmployees'),
      email: personalData.email ? get(cotisation, 'REGISTRATION.email') : undefined,
      accountant: get(cotisation, 'REGISTRATION.accountant'),
      payment: getPayment(cotisation),
    },
  };
}

/**
 *
 * @param dbSiren the db result of siren request
 * @param personalData {{ email: boolean }} list of personal field required
 * @returns {{ siren: string, enterprise: { name: string }, cotisation: { status: string, amount: string, numberOfEmployees: string } }}
 */
exports.createMapSiren = ({ getCurrentCotisation, getPreviousCotisation }) =>
  function mapSiren(dbSiren, personalData = {}, users) {
    if (!dbSiren) {
      return null;
    }
    const year = getCurrentCotisation();
    const yearSecond = getPreviousCotisation();
    const cotisation = get(dbSiren, `cotisations.${year}`, {});
    const previousCotisation = get(dbSiren, `cotisations.${yearSecond}`, {});

    return {
      siren: get(dbSiren, 'details.SIREN'),
      enterprise: {
        name: get(dbSiren, 'details.NOMEN_LONG'),
        APECOD2008: get(dbSiren, 'details.APECOD2008'),
        APEM: get(dbSiren, 'details.APEM'),
        APET700: get(dbSiren, 'details.APET700'),
      },
      cotisation: {
        year,
        status: getCotisationStatus(cotisation),
        amount: get(cotisation, 'REGISTRATION.amount'),
        payroll: get(cotisation, 'REGISTRATION.payroll'),
        numberOfEmployees: get(cotisation, 'REGISTRATION.numberOfEmployees'),
        email: personalData.email ? get(cotisation, 'REGISTRATION.email') : undefined,
        accountant: get(cotisation, 'REGISTRATION.accountant'),
        accountantSiren: get(cotisation, 'REGISTRATION.accountant')
          ? get(users, `${get(cotisation, 'REGISTRATION.accountant')}.siren`)
          : '',
        payment: getPayment(cotisation),
      },
      cotisation2: {
        year: yearSecond,
        status: getCotisationStatus(previousCotisation),
        amount: get(previousCotisation, 'REGISTRATION.amount'),
        payroll: get(previousCotisation, 'REGISTRATION.payroll'),
        numberOfEmployees: get(previousCotisation, 'REGISTRATION.numberOfEmployees'),
        email: personalData.email ? get(previousCotisation, 'REGISTRATION.email') : undefined,
        accountant: get(previousCotisation, 'REGISTRATION.accountant'),
        accountantSiren: get(previousCotisation, 'REGISTRATION.accountant')
          ? get(users, `${get(previousCotisation, 'REGISTRATION.accountant')}.siren`)
          : '',
        payment: getPayment(previousCotisation),
      },
      previousCotisation: {
        amount: get(previousCotisation, 'REGISTRATION.amount', 0),
        status: getCotisationStatus(previousCotisation),
      },
      sepa: {
        mandateId: get(cotisation, 'PAYMENT.SEPA.state.mandateId', ''),
      },
      cotisations: getCotisations(year, get(dbSiren, `cotisations`, {}), personalData),
    };
  };

/**
 *
 * @param dbSiren the db result of siren request
 * @param personalData {{ email: boolean }} list of personal field required
 * @returns {{ siren: string, enterprise: { name: string }, cotisation: { status: string, amount: string, numberOfEmployees: string } }}
 */
exports.mapSiret = (siret, year, dbSiret, personalData = {}, users) => {
  if (!dbSiret) {
    return null;
  }

  const cotisation = get(dbSiret, `cotisations.${year}`, {});

  return {
    siret: get(dbSiret, 'siret') || siret,
    siren: get(dbSiret, 'siren'),
    enterprise: {
      name: get(dbSiret, 'infos.name'),
    },
    cotisation: {
      year,
      status: getCotisationStatus(cotisation),
      amount: get(cotisation, 'REGISTRATION.amount'),
      payroll: get(cotisation, 'REGISTRATION.payroll'),
      numberOfEmployees: get(cotisation, 'REGISTRATION.numberOfEmployees'),
      email: personalData.email ? get(cotisation, 'REGISTRATION.email') : undefined,
      accountant: get(cotisation, 'REGISTRATION.accountant'),
      accountantSiren: get(cotisation, 'REGISTRATION.accountant')
        ? get(users, `${get(cotisation, 'REGISTRATION.accountant')}.siren`)
        : '',
      payment: getPayment(cotisation),
    },
  };
};

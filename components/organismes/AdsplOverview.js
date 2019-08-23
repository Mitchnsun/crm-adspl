import { useState } from 'react';
import { get } from 'lodash';
import moment from 'moment';

function Line({ item, date, name, renderSummary = () => null, renderDetails = () => null }) {
  const [openDetails, setOpenDetails] = useState(false);
  const [openRaw, setOpenRaw] = useState(false);
  return (
    <div
      style={{
        marginBottom: '0.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          border: '1px solid black',
          borderRadius: openDetails || openRaw ? 0 : '5px',
          alignItems: 'center',
        }}
      >
        <div style={{ marginRight: '1rem', backgroundColor: 'black', color: 'white', padding: '0.5rem 1rem' }}>
          {moment(date).format('DD/MM/YYYY HH:mm:ss')}
        </div>
        <div style={{ marginRight: '1rem', fontWeight: 'bold' }}>{name}</div>
        <div style={{ flex: 1, marginRight: '1rem' }}>{renderSummary()}</div>
        <div>
          <button className={openDetails ? 'open' : ''} onClick={() => setOpenDetails(!openDetails)}>
            Détails
          </button>
          <button className={openRaw ? 'open' : ''} onClick={() => setOpenRaw(!openRaw)}>
            JSON
          </button>
          <style jsx>{`
            button {
              border: 1px solid black;
              border-radius: 5px;
              cursor: pointer;
              margin-right 5px;
            }
            button.open {
              color: white;
              background-color: black;
            }
          `}</style>
        </div>
      </div>
      {(openDetails || openRaw) && (
        <div
          style={{
            borderBottom: '1px solid black',
            borderLeft: '1px solid black',
            borderRight: '1px solid black',

            //borderRadius: openDetails || openRaw ? '5px' : 0,
            padding: '1rem',
          }}
        >
          {openDetails ? renderDetails() : null}
          {openRaw ? <pre style={{ margin: 0 }}>{JSON.stringify(item, null, 2)}</pre> : null}
        </div>
      )}
    </div>
  );
}

function toJSX(item) {
  if (!item) return null;
  switch (item.task) {
    case 'init': {
      return (
        <Line
          item={item}
          date={item.date}
          name={'Création'}
          renderSummary={() => <p />}
          renderDetails={() => (
            <table>
              <tbody>
                {Object.keys(item.input.insee).map(key => (
                  <tr>
                    <td>{key}</td>
                    <td>{item.input.insee[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        />
      );
    }
    case 'registration': {
      const {
        date,
        input: { cotisation, ...params },
      } = item;
      return (
        <Line
          item={item}
          date={date}
          name={`Enregistrement de la cotisation ${cotisation}`}
          renderSummary={() => <p />}
          renderDetails={() => (
            <table>
              <tbody>
                {Object.keys(params).map(key => (
                  <tr>
                    <td>{key}</td>
                    <td>{params[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        />
      );
    }

    case 'payment-credit-card': {
      const {
        date,
        input: { cotisation, type },
      } = item;
      switch (type) {
        case 'init':
          return (
            <Line
              item={item}
              date={date}
              name={`Paiment pour la cotisation ${cotisation}`}
              renderSummary={() => <div>Carte de crédit [Initialisation]</div>}
              renderDetails={() => <div>Référence: {item.input.ref}</div>}
            />
          );
        case 'end':
          return (
            <Line
              item={item}
              date={date}
              name={`Paiment pour la cotisation ${cotisation}`}
              renderSummary={() => <div>Carte de crédit [Retour du prestataire de paiement]</div>}
              renderDetails={() => (
                <div>
                  <div>Référence: {get(item.input, 'response.order.ref')}</div>
                  <div>Status: {get(item.input, 'response.result.shortMessage')}</div>
                </div>
              )}
            />
          );
        case 'notify':
          return (
            <Line
              item={item}
              date={date}
              name={`Paiment pour la cotisation ${cotisation}`}
              renderSummary={() => <div>Carte de crédit [Notification]</div>}
              renderDetails={() => (
                <div>
                  <div>Référence: {get(item.input, 'response.order.ref')}</div>
                  <div>Status: {get(item.input, 'response.result.shortMessage')}</div>
                </div>
              )}
            />
          );
        default:
          return <div>{JSON.stringify(item)}</div>;
      }
    }
    case 'payment-sepa': {
      const {
        date,
        input: {
          cotisation,
          type,
          response: { error },
        },
      } = item;
      switch (type) {
        case 'ADD': {
          return (
            <Line
              item={item}
              date={date}
              name={`Paiment pour la cotisation ${cotisation}`}
              renderSummary={() => <div>SEPA [Initialisation du mandat de paiement]</div>}
              renderDetails={() => (error ? 'Error' : <div></div>)}
            />
          );
        }
        case 'COMPLETE': {
          return (
            <Line
              item={item}
              date={date}
              name={`Paiment pour la cotisation ${cotisation}`}
              renderSummary={() => <div>SEPA [Mandat de paiement crée]</div>}
              renderDetails={() => (error ? 'Error' : <div></div>)}
            />
          );
        }
        case 'PAY': {
          return (
            <Line
              item={item}
              date={date}
              name={`Paiment pour la cotisation ${cotisation}`}
              renderSummary={() => <div>SEPA [Initialisation du paiement]</div>}
              renderDetails={() =>
                error ? 'Error' : <div>Référence: {get(item.input, 'response.payments.reference')}</div>
              }
            />
          );
        }
        case 'NOTIFY': {
          return (
            <Line
              item={item}
              date={date}
              name={`Paiment pour la cotisation ${cotisation}`}
              renderSummary={() => <div>SEPA [Notification]</div>}
              renderDetails={() =>
                error ? (
                  'Error'
                ) : (
                  <div>
                    <div>Référence: {get(item.input, 'response.payment.payments.reference')}</div>
                    <div>Status: {get(item.input, 'response.payment.payments.status')}</div>
                  </div>
                )
              }
            />
          );
        }
        default:
          return <div>{JSON.stringify(item)}</div>;
      }
    }
    case 'payment-check': {
      const {
        date,
        input: { cotisation },
      } = item;
      return (
        <Line
          item={item}
          date={date}
          name={`Paiment pour la cotisation ${cotisation}: `}
          renderSummary={() => <div>Par Chèque [Reçu]</div>}
        />
      );
    }
    default:
      return <div>{JSON.stringify(item)}</div>;
  }
}

export function AdsplOverview({ data }) {
  return (
    <div>
      <div className="container">
        <div className="details">
          <h2>Détails</h2>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              {data.insee.NOMEN_LONG}
              <div>Siret: {data.insee.SIRET || 'Non renseigné'}</div>
              <div>Siren: {data.insee.SIREN}</div>
              <div>Email: {data.email || 'Non renseigné'} </div>
            </div>
            <div style={{ flex: 1 }}>
              <div>Cotisations:</div>
              {Object.keys(data.cotisations).map(cotisation => {
                return (
                  <div key={cotisation} className={'cotisation-line'}>
                    {cotisation}:{' '}
                    <span className={'cotisation-status ' + data.cotisations[cotisation].status.toLowerCase()}>
                      {data.cotisations[cotisation].status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="history">
          <h2>Historique</h2>
          <div>{data.history.map(toJSX)}</div>
        </div>
      </div>
      <style jsx>{`
        .cotisation-line {
          margin: 0.8rem;
        }
        .cotisation-status {
          padding: 0.2rem;
          border-radius: 5px;
        }
        .paid {
          color: white;
          background-color: green;
        }
        .failed {
          color: white;
          background-color: red;
        }
        .pending {
          color: white;
          background-color: purple;
        }
        button {
          border: 1px solid black;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
}

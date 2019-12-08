import { useState, createRef, useContext } from 'react';
import { get } from 'lodash';
import moment from 'moment';
import colors from '../../styles/colors';
import UserContext from '../../utils/UserContext';
import DomainsContext from '../../utils/DomainsContext';

function AdspInfos({ infos, onSubmit }) {
  const [isEditing, setIsEditing] = useState(false);

  const refs = {
    name: createRef(),
    email: createRef(),
    address: {
      name: createRef(),
      street: createRef(),
      cedex: createRef(),
      zipcode: createRef(),
      city: createRef(),
      country: createRef(),
    },
  };

  return (
    <div>
      <div>
        {isEditing ? (
          <div>
            <button onClick={() => setIsEditing(false)}>Retour</button>
            <button
              onClick={() => {
                const datas = {
                  name: refs.name.current.value,
                  email: refs.email.current.value,
                  address: {
                    name: refs.address.name.current.value,
                    street: refs.address.street.current.value,
                    cedex: refs.address.cedex.current.value,
                    zipcode: refs.address.zipcode.current.value,
                    city: refs.address.city.current.value,
                    country: refs.address.country.current.value,
                  },
                };
                setIsEditing(false);
                onSubmit(datas);
              }}
            >
              Enregistrer
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)}>Modifier</button>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ flex: 1, padding: '5px' }}>
          <table>
            <tbody>
              <tr>
                <td>Nom</td>
                <td>
                  <input ref={refs.name} type="text" defaultValue={infos.name} disabled={!isEditing} />
                </td>
              </tr>
              <tr>
                <td>Email</td>
                <td>
                  <input ref={refs.email} type="text" defaultValue={infos.email} disabled={!isEditing} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1, padding: '5px' }}>
          <table>
            <tbody>
              <tr>
                <td>Nom</td>
                <td>
                  <input ref={refs.address.name} type="text" defaultValue={infos.address.name} disabled={!isEditing} />
                </td>
              </tr>
              <tr>
                <td>Rue</td>
                <td>
                  <input
                    ref={refs.address.street}
                    type="text"
                    defaultValue={infos.address.street}
                    disabled={!isEditing}
                  />
                </td>
              </tr>
              <tr>
                <td>Cedex</td>
                <td>
                  <input
                    ref={refs.address.cedex}
                    type="text"
                    defaultValue={infos.address.cedex}
                    disabled={!isEditing}
                  />
                </td>
              </tr>
              <tr>
                <td>Code postal</td>
                <td>
                  <input
                    ref={refs.address.zipcode}
                    type="text"
                    defaultValue={infos.address.zipcode}
                    disabled={!isEditing}
                  />
                </td>
              </tr>
              <tr>
                <td>Ville</td>
                <td>
                  <input ref={refs.address.city} type="text" defaultValue={infos.address.city} disabled={!isEditing} />
                </td>
              </tr>
              <tr>
                <td>Pays</td>
                <td>
                  <input
                    ref={refs.address.country}
                    type="text"
                    defaultValue={infos.address.country}
                    disabled={!isEditing}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <style jsx>{`
        table {
          width: 100%;
        }
        input {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
function Line({ item, date, name, renderSummary = () => null, renderDetails }) {
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
          border: `1px solid ${colors.SKY_DARK}`,
          borderRadius: openDetails || openRaw ? 0 : '5px',
          alignItems: 'center',
        }}
      >
        <div style={{ marginRight: '1rem', backgroundColor: colors.SKY_DARK, color: 'white', padding: '0.5rem 1rem' }}>
          {moment(date).format('DD/MM/YYYY HH:mm:ss')}
        </div>
        <div style={{ marginRight: '1rem', fontWeight: 'bold', color: colors.SKY_DARK }}>{name}</div>
        <div style={{ flex: 1, marginRight: '1rem' }}>{renderSummary()}</div>
        <div>
          {item.generate && <span className="generated">Généré</span>}
          {renderDetails && (
            <button className={openDetails ? 'open' : ''} onClick={() => setOpenDetails(!openDetails)}>
              Détails
            </button>
          )}

          <button className={openRaw ? 'open' : ''} onClick={() => setOpenRaw(!openRaw)}>
            JSON
          </button>
          <style jsx>{`
            .generated {
                border: 1px solid ${colors.SKY_DARK};
                background-color: ${colors.SKY_DARK};
                color: white;
                border-radius: 5px;
                cursor: pointer;
                margin-right 5px;
                padding: 0 5px;
            }
            button {
              border: 1px solid ${colors.SKY_DARK};
              border-radius: 5px;
              cursor: pointer;
              margin-right 5px;
            }
            button.open {
              color: white;
              background-color: ${colors.SKY_DARK};
            }
          `}</style>
        </div>
      </div>
      {(openDetails || openRaw) && (
        <div
          style={{
            borderBottom: `1px solid ${colors.SKY_DARK}`,
            borderLeft: `1px solid ${colors.SKY_DARK}`,
            borderRight: `1px solid ${colors.SKY_DARK}`,

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
      if (item._version === 0) {
        return (
          <Line
            item={item}
            date={item.date}
            name="Ajout de l'entreprise"
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
      return <Line item={item} date={item.date} name="Ajout de l'entreprise" renderSummary={() => <p />} />;
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
              renderDetails={error ? () => 'Error' : undefined}
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
              renderDetails={error ? () => 'Error' : undefined}
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
      if (item.date && item.task) {
        return <Line item={item} date={item.date} name={item.task} />;
      }
      return <div>{JSON.stringify(item)}</div>;
  }
}

export function AdsplOverview({ data }) {
  const user = useContext(UserContext);
  const { Adspl } = useContext(DomainsContext);
  return (
    <div>
      <div className="container">
        <div className="details">
          <h2>Détails</h2>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              {data.insee.NOMEN_LONG}
              <div>Siret: {data.siret || 'Non renseigné'}</div>
              <div>Siren: {data.siren}</div>
              <div>Email: {data.email || 'Non renseigné'} </div>
            </div>
            <div style={{ flex: 1 }}>
              <div>Cotisations:</div>
              {Object.keys(data.cotisations).length === 0 && 'Pas de cotisations'}
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
        {data.infos && (
          <div className="infos">
            <h2>Informations</h2>
            <AdspInfos infos={data.infos} onSubmit={infos => Adspl.updateInfos(data.siret, infos, user)} />
          </div>
        )}
        <div className="history">
          <h2>Historique</h2>
          <div>{data._history.map(toJSX)}</div>
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
          border: 1px solid ${colors.SKY_DARK};
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
}

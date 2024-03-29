const { mapSiren, mapSiret } = require('./adspl-siren.util');

describe('mapSiren utils', () => {
  it('mapSiren', () => {
    const raw = {
      cotisations: {
        '2018': {
          PAYMENT: {
            CREDIT_CARD: {
              END: {
                date: '2018-12-16T20:56:26.658Z',
                response: {
                  authentication3DSecure: {
                    cavv: 'AAABBCmDMQAAAABUWYMxAAAAAAA=',
                    cavvAlgorithm: '2',
                    eci: '05',
                    md: '2WyW2BKa3xcCpfzUihPp',
                    xid: 'Mld5VzJCS2EzeGNDcGZ6VWloUHA=',
                  },
                  authorization: {
                    date: '16/12/2018 21:56:20',
                    number: 'A55A',
                  },
                  card: {
                    expirationDate: '1220',
                    number: '497010XXXXXX5150',
                    type: 'CB',
                  },
                  contractNumber: '1234567',
                  extendedCard: {
                    bank: '',
                    country: 'FRA',
                    isCvd: '',
                    network: 'VISA',
                    product: 'Visa Infinite',
                    type: 'VISA',
                  },
                  media: 'Computer',
                  order: {
                    amount: '400',
                    country: 'FR',
                    currency: '978',
                    date: '16/12/2018 20:55:00',
                    deliveryExpectedDelay: '0',
                    ref: 'b881f35a-c9c9-415b-a23f-59215c8922ea-824569263',
                  },
                  payment: {
                    action: '101',
                    amount: '400',
                    contractNumber: '1234567',
                    currency: '978',
                    differedActionDate: '',
                    method: 'CB',
                    mode: 'CPT',
                  },
                  result: {
                    code: '00000',
                    longMessage: 'Transaction approved',
                    shortMessage: 'ACCEPTED',
                  },
                  transaction: {
                    avs: {
                      result: '4',
                      resultFromAcquirer: '',
                    },
                    date: '16/12/2018 21:56:20',
                    explanation: '',
                    fraudResult: '',
                    id: '28350215620309',
                    isDuplicated: '0',
                    isPossibleFraud: '0',
                    score: '0',
                    threeDSecure: 'Y',
                  },
                },
              },
              INIT: {
                amount: 4,
                date: '2018-12-16T20:55:10.455Z',
                ref: 'b881f35a-c9c9-415b-a23f-59215c8922ea-824569263',
              },
              LAST: {
                date: '2018-12-16T20:56:26.658Z',
                response: {
                  authentication3DSecure: {
                    cavv: 'AAABBCmDMQAAAABUWYMxAAAAAAA=',
                    cavvAlgorithm: '2',
                    eci: '05',
                    md: '2WyW2BKa3xcCpfzUihPp',
                    xid: 'Mld5VzJCS2EzeGNDcGZ6VWloUHA=',
                  },
                  authorization: {
                    date: '16/12/2018 21:56:20',
                    number: 'A55A',
                  },
                  card: {
                    expirationDate: '1220',
                    number: '497010XXXXXX5150',
                    type: 'CB',
                  },
                  contractNumber: '1234567',
                  extendedCard: {
                    bank: '',
                    country: 'FRA',
                    isCvd: '',
                    network: 'VISA',
                    product: 'Visa Infinite',
                    type: 'VISA',
                  },
                  media: 'Computer',
                  order: {
                    amount: '400',
                    country: 'FR',
                    currency: '978',
                    date: '16/12/2018 20:55:00',
                    deliveryExpectedDelay: '0',
                    ref: 'b881f35a-c9c9-415b-a23f-59215c8922ea-824569263',
                  },
                  payment: {
                    action: '101',
                    amount: '400',
                    contractNumber: '1234567',
                    currency: '978',
                    differedActionDate: '',
                    method: 'CB',
                    mode: 'CPT',
                  },
                  result: {
                    code: '00000',
                    longMessage: 'Transaction approved',
                    shortMessage: 'ACCEPTED',
                  },
                  transaction: {
                    avs: {
                      result: '4',
                      resultFromAcquirer: '',
                    },
                    date: '16/12/2018 21:56:20',
                    explanation: '',
                    fraudResult: '',
                    id: '28350215620309',
                    isDuplicated: '0',
                    isPossibleFraud: '0',
                    score: '0',
                    threeDSecure: 'Y',
                  },
                },
              },
            },
          },
          REGISTRATION: {
            accountant: 'KLXadBPJVLf0SQlH1iSE6TCRzEQ2',
            amount: 4,
            date: '2018-12-16T20:24:37.136Z',
            payroll: '10000',
          },
        },
      },
      creationDate: '2018-07-06T04:36:19.217Z',
      details: {
        ACTIVNAT: '99',
        ADR_MAIL: '',
        APECOD2008: '',
        APET700: '6201Z',
        BDD_ACT: '',
        CATEGORIE: '',
        DEFEN: '2017',
        EFENCENT: 'NN',
        EFETCENT: 'NN',
        EFFECTIF: '',
        L1_NORMALISEE: 'MEDYLINK',
        L2_NORMALISEE: 'MYMEDEYBOX',
        L3_NORMALISEE: 'ZONE INDUSTRIELLE EUROCENTRE',
        L4_NORMALISEE: '2 RUE DE L OURMEDE',
        L6_NORMALISEE: '31620 CASTELNAU D ESTRETEFONDS',
        L7_NORMALISEE: 'FRANCE',
        LIBAPEN: 'Programmation informatique',
        LIBNJ: 'SAS, société par actions simplifiée',
        LIBTEFEN: '10 à 19 salariés',
        LIBTEFET: '10 à 19 salariés',
        NATETAB: '',
        NIC: '00018',
        NOMEN_LONG: 'MEDYLINK',
        SIEGE: '0',
        SIREN: '824569263',
        SIRET: '',
        TEFEN: '11',
        TEFET: '11',
      },
    };
    const expected = {
      _history: [
        {
          _version: 0,
          date: '2018-07-06T04:36:19.217Z',
          input: {
            insee: {
              ACTIVNAT: '99',
              ADR_MAIL: '',
              APECOD2008: '',
              APET700: '6201Z',
              BDD_ACT: '',
              CATEGORIE: '',
              DEFEN: '2017',
              EFENCENT: 'NN',
              EFETCENT: 'NN',
              EFFECTIF: '',
              L1_NORMALISEE: 'MEDYLINK',
              L2_NORMALISEE: 'MYMEDEYBOX',
              L3_NORMALISEE: 'ZONE INDUSTRIELLE EUROCENTRE',
              L4_NORMALISEE: '2 RUE DE L OURMEDE',
              L6_NORMALISEE: '31620 CASTELNAU D ESTRETEFONDS',
              L7_NORMALISEE: 'FRANCE',
              LIBAPEN: 'Programmation informatique',
              LIBNJ: 'SAS, société par actions simplifiée',
              LIBTEFEN: '10 à 19 salariés',
              LIBTEFET: '10 à 19 salariés',
              NATETAB: '',
              NIC: '00018',
              NOMEN_LONG: 'MEDYLINK',
              SIEGE: '0',
              SIREN: '824569263',
              SIRET: '',
              TEFEN: '11',
              TEFET: '11',
            },
          },
          task: 'init',
          generate: true,
        },
        {
          date: '2018-12-16T20:24:37.136Z',
          input: {
            accountant: 'KLXadBPJVLf0SQlH1iSE6TCRzEQ2',
            amount: 4,
            cotisation: '2018',
            date: '2018-12-16T20:24:37.136Z',
            payroll: '10000',
          },
          task: 'registration',
          generate: true,
        },
        {
          date: '2018-12-16T20:55:10.455Z',
          input: {
            amount: 4,
            cotisation: '2018',
            date: '2018-12-16T20:55:10.455Z',
            ref: 'b881f35a-c9c9-415b-a23f-59215c8922ea-824569263',
            type: 'init',
          },
          task: 'payment-credit-card',
          generate: true,
        },
        {
          date: '2018-12-16T20:56:26.658Z',
          input: {
            cotisation: '2018',
            date: '2018-12-16T20:56:26.658Z',
            response: {
              authentication3DSecure: {
                cavv: 'AAABBCmDMQAAAABUWYMxAAAAAAA=',
                cavvAlgorithm: '2',
                eci: '05',
                md: '2WyW2BKa3xcCpfzUihPp',
                xid: 'Mld5VzJCS2EzeGNDcGZ6VWloUHA=',
              },
              authorization: {
                date: '16/12/2018 21:56:20',
                number: 'A55A',
              },
              card: {
                expirationDate: '1220',
                number: '497010XXXXXX5150',
                type: 'CB',
              },
              contractNumber: '1234567',
              extendedCard: {
                bank: '',
                country: 'FRA',
                isCvd: '',
                network: 'VISA',
                product: 'Visa Infinite',
                type: 'VISA',
              },
              media: 'Computer',
              order: {
                amount: '400',
                country: 'FR',
                currency: '978',
                date: '16/12/2018 20:55:00',
                deliveryExpectedDelay: '0',
                ref: 'b881f35a-c9c9-415b-a23f-59215c8922ea-824569263',
              },
              payment: {
                action: '101',
                amount: '400',
                contractNumber: '1234567',
                currency: '978',
                differedActionDate: '',
                method: 'CB',
                mode: 'CPT',
              },
              result: {
                code: '00000',
                longMessage: 'Transaction approved',
                shortMessage: 'ACCEPTED',
              },
              transaction: {
                avs: {
                  result: '4',
                  resultFromAcquirer: '',
                },
                date: '16/12/2018 21:56:20',
                explanation: '',
                fraudResult: '',
                id: '28350215620309',
                isDuplicated: '0',
                isPossibleFraud: '0',
                score: '0',
                threeDSecure: 'Y',
              },
            },
            type: 'end',
          },
          task: 'payment-credit-card',
          generate: true,
        },
      ],
      cotisations: {
        '2018': {
          accountant: 'KLXadBPJVLf0SQlH1iSE6TCRzEQ2',
          paymentMethods: ['credit-card'],
          payments: {
            'credit-card': {
              'b881f35a-c9c9-415b-a23f-59215c8922ea-824569263': {
                amount: 4,
                date: '2018-12-16T20:56:26.658Z',
                paymentStatus: 'ACCEPTED',
              },
            },
          },
          registredAmount: 4,
          registredPayroll: '10000',
          status: 'PAID',
        },
      },
      insee: {
        ACTIVNAT: '99',
        ADR_MAIL: '',
        APECOD2008: '',
        APET700: '6201Z',
        BDD_ACT: '',
        CATEGORIE: '',
        DEFEN: '2017',
        EFENCENT: 'NN',
        EFETCENT: 'NN',
        EFFECTIF: '',
        L1_NORMALISEE: 'MEDYLINK',
        L2_NORMALISEE: 'MYMEDEYBOX',
        L3_NORMALISEE: 'ZONE INDUSTRIELLE EUROCENTRE',
        L4_NORMALISEE: '2 RUE DE L OURMEDE',
        L6_NORMALISEE: '31620 CASTELNAU D ESTRETEFONDS',
        L7_NORMALISEE: 'FRANCE',
        LIBAPEN: 'Programmation informatique',
        LIBNJ: 'SAS, société par actions simplifiée',
        LIBTEFEN: '10 à 19 salariés',
        LIBTEFET: '10 à 19 salariés',
        NATETAB: '',
        NIC: '00018',
        NOMEN_LONG: 'MEDYLINK',
        SIEGE: '0',
        SIREN: '824569263',
        SIRET: '',
        TEFEN: '11',
        TEFET: '11',
      },
      name: 'MEDYLINK',
      siren: '824569263',
      siret: '',
    };
    const result = mapSiren(raw);

    expect(result).toEqual(expected);
  });
  it('mapSiret', () => {
    const raw = {
      _history: {
        '1574532184082': {
          date: '2019-11-23T18:03:04.082Z',
          input: {
            email: 'test-infos@yopmail.com',
            id: '82788226700020',
            role: 'enterprise',
            uid: 'SxoKB3XWGuf3lp7WEl2w83zWrXy1',
          },
          message: 'ok',
          task: 'Création de compte',
        },
      },
      creationDate: '2019-11-23T18:03:04.077Z',
      email: 'test-infos@yopmail.com',
      id: '82788226700020',
      infos: {
        address: {
          cedex: '',
          city: 'PARIS 11',
          country: '',
          name: '(CHEZ MARIAMA DIANE)',
          street: '8  IMP TRUILLOT',
          zipcode: '75011',
        },
        apen: '90.01Z',
        apet: '',
        createdAt: '2018-02-15',
        headquarters: {
          isHeadquarters: true,
          nic: '00020',
        },
        nafa: '',
        name: 'LE TATOU THEATRE',
        nic: '00020',
        siren: '827882267',
        siret: '82788226700020',
        type: 'PME',
        updatedAt: '2018-03-08T14:38:10',
        workforce: {
          range: '',
          year: '',
        },
      },
      insee: {
        adresseEtablissement: {
          codeCommuneEtablissement: '75111',
          codePostalEtablissement: '75011',
          complementAdresseEtablissement: '(CHEZ MARIAMA DIANE)',
          libelleCommuneEtablissement: 'PARIS 11',
          libelleVoieEtablissement: 'TRUILLOT',
          numeroVoieEtablissement: '8',
          typeVoieEtablissement: 'IMP',
        },
        dateCreationEtablissement: '2018-02-15',
        dateDernierTraitementEtablissement: '2018-03-08T14:38:10',
        etablissementSiege: true,
        nic: '00020',
        nombrePeriodesEtablissement: 1,
        periodesEtablissement: [
          {
            activitePrincipaleEtablissement: '90.01Z',
            caractereEmployeurEtablissement: 'O',
            changementActivitePrincipaleEtablissement: false,
            changementCaractereEmployeurEtablissement: false,
            changementDenominationUsuelleEtablissement: false,
            changementEnseigneEtablissement: false,
            changementEtatAdministratifEtablissement: false,
            dateDebut: '2018-02-15',
            etatAdministratifEtablissement: 'A',
            nomenclatureActivitePrincipaleEtablissement: 'NAFRev2',
          },
        ],
        siren: '827882267',
        siret: '82788226700020',
        statutDiffusionEtablissement: 'O',
        uniteLegale: {
          activitePrincipaleUniteLegale: '90.01Z',
          anneeCategorieEntreprise: '2017',
          caractereEmployeurUniteLegale: 'O',
          categorieEntreprise: 'PME',
          categorieJuridiqueUniteLegale: '9220',
          dateCreationUniteLegale: '2017-03-10',
          dateDernierTraitementUniteLegale: '2018-03-08T14:38:10',
          denominationUniteLegale: 'LE TATOU THEATRE',
          economieSocialeSolidaireUniteLegale: 'O',
          etatAdministratifUniteLegale: 'A',
          nicSiegeUniteLegale: '00020',
          nomenclatureActivitePrincipaleUniteLegale: 'NAFRev2',
          statutDiffusionUniteLegale: 'O',
        },
        updatedAt: '2019-11-23T18:03:04.078Z',
      },
      role: 'enterprise',
      siren: '827882267',
      siret: '82788226700020',
      uid: 'SxoKB3XWGuf3lp7WEl2w83zWrXy1',
    };
    const expected = {
      _history: [
        {
          _version: 1,
          date: '2019-11-23T18:03:04.077Z',
          input: {
            insee: {
              adresseEtablissement: {
                codeCommuneEtablissement: '75111',
                codePostalEtablissement: '75011',
                complementAdresseEtablissement: '(CHEZ MARIAMA DIANE)',
                libelleCommuneEtablissement: 'PARIS 11',
                libelleVoieEtablissement: 'TRUILLOT',
                numeroVoieEtablissement: '8',
                typeVoieEtablissement: 'IMP',
              },
              dateCreationEtablissement: '2018-02-15',
              dateDernierTraitementEtablissement: '2018-03-08T14:38:10',
              etablissementSiege: true,
              nic: '00020',
              nombrePeriodesEtablissement: 1,
              periodesEtablissement: [
                {
                  activitePrincipaleEtablissement: '90.01Z',
                  caractereEmployeurEtablissement: 'O',
                  changementActivitePrincipaleEtablissement: false,
                  changementCaractereEmployeurEtablissement: false,
                  changementDenominationUsuelleEtablissement: false,
                  changementEnseigneEtablissement: false,
                  changementEtatAdministratifEtablissement: false,
                  dateDebut: '2018-02-15',
                  etatAdministratifEtablissement: 'A',
                  nomenclatureActivitePrincipaleEtablissement: 'NAFRev2',
                },
              ],
              siren: '827882267',
              siret: '82788226700020',
              statutDiffusionEtablissement: 'O',
              uniteLegale: {
                activitePrincipaleUniteLegale: '90.01Z',
                anneeCategorieEntreprise: '2017',
                caractereEmployeurUniteLegale: 'O',
                categorieEntreprise: 'PME',
                categorieJuridiqueUniteLegale: '9220',
                dateCreationUniteLegale: '2017-03-10',
                dateDernierTraitementUniteLegale: '2018-03-08T14:38:10',
                denominationUniteLegale: 'LE TATOU THEATRE',
                economieSocialeSolidaireUniteLegale: 'O',
                etatAdministratifUniteLegale: 'A',
                nicSiegeUniteLegale: '00020',
                nomenclatureActivitePrincipaleUniteLegale: 'NAFRev2',
                statutDiffusionUniteLegale: 'O',
              },
              updatedAt: '2019-11-23T18:03:04.078Z',
            },
          },
          task: 'init',
          generate: true,
        },
        {
          date: '2019-11-23T18:03:04.082Z',
          input: {
            email: 'test-infos@yopmail.com',
            id: '82788226700020',
            role: 'enterprise',
            uid: 'SxoKB3XWGuf3lp7WEl2w83zWrXy1',
          },
          message: 'ok',
          task: 'Création de compte',
        },
      ],
      cotisations: {},
      insee: {
        adresseEtablissement: {
          codeCommuneEtablissement: '75111',
          codePostalEtablissement: '75011',
          complementAdresseEtablissement: '(CHEZ MARIAMA DIANE)',
          libelleCommuneEtablissement: 'PARIS 11',
          libelleVoieEtablissement: 'TRUILLOT',
          numeroVoieEtablissement: '8',
          typeVoieEtablissement: 'IMP',
        },
        dateCreationEtablissement: '2018-02-15',
        dateDernierTraitementEtablissement: '2018-03-08T14:38:10',
        etablissementSiege: true,
        nic: '00020',
        nombrePeriodesEtablissement: 1,
        periodesEtablissement: [
          {
            activitePrincipaleEtablissement: '90.01Z',
            caractereEmployeurEtablissement: 'O',
            changementActivitePrincipaleEtablissement: false,
            changementCaractereEmployeurEtablissement: false,
            changementDenominationUsuelleEtablissement: false,
            changementEnseigneEtablissement: false,
            changementEtatAdministratifEtablissement: false,
            dateDebut: '2018-02-15',
            etatAdministratifEtablissement: 'A',
            nomenclatureActivitePrincipaleEtablissement: 'NAFRev2',
          },
        ],
        siren: '827882267',
        siret: '82788226700020',
        statutDiffusionEtablissement: 'O',
        uniteLegale: {
          activitePrincipaleUniteLegale: '90.01Z',
          anneeCategorieEntreprise: '2017',
          caractereEmployeurUniteLegale: 'O',
          categorieEntreprise: 'PME',
          categorieJuridiqueUniteLegale: '9220',
          dateCreationUniteLegale: '2017-03-10',
          dateDernierTraitementUniteLegale: '2018-03-08T14:38:10',
          denominationUniteLegale: 'LE TATOU THEATRE',
          economieSocialeSolidaireUniteLegale: 'O',
          etatAdministratifUniteLegale: 'A',
          nicSiegeUniteLegale: '00020',
          nomenclatureActivitePrincipaleUniteLegale: 'NAFRev2',
          statutDiffusionUniteLegale: 'O',
        },
        updatedAt: '2019-11-23T18:03:04.078Z',
      },
      name: '',
      siren: '827882267',
      siret: '82788226700020',
    };
    const result = mapSiret(raw);

    expect(result).toEqual(expected);
  });
});

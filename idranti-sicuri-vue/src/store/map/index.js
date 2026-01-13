
export default {
    namespaced: true,
    state: {
        // Riferimento alla mappa Leaflet se necessario (non sempre usato), mantenuto per compatibilità
        map: null,
        // Array dei pin (idranti) caricati nell'app. Qui è presente un dataset di esempio.
        pins: [
            {
                "id": "0001",
                "location_lat": 45.427637,
                "location_lon": 10.972936,
                "imgs": [
                    "jD1NpRq5vX.jpeg",
                    "B3vNp7zK1Y.jpeg"
                ],
                "operative": false,
                "fields": {
                    "campo1": "colonnina",
                    "campo2": "2010",
                    "campo3": "2023-09-15"
                }
            },
            {
                "id": "0002",
                "location_lat": 45.435229,
                "location_lon": 10.979726,
                "imgs": [
                    "KzL8mTqY7W.jpeg",
                    "a9X2mLq7Zt.jpeg",
                    "Xy7Bz9WlQe.jpeg"
                ],
                "operative": true,
                "fields": {
                    "campo1": "sottosuolo",
                    "campo2": "2005",
                    "campo3": "2023-07-10"
                }
            },
            {
                "id": "0003",
                "location_lat": 45.439177,
                "location_lon": 10.993194,
                "imgs": [
                    "wP4zXyMv1J.jpeg"
                ],
                "operative": true,
                "fields": {
                    "campo1": "colonnina",
                    "campo2": "2015",
                    "campo3": "2023-08-22"
                }
            },
            {
                "id": "0004",
                "location_lat": 45.44354,
                "location_lon": 10.996738,
                "imgs": [],
                "operative": false,
                "fields": {
                    "campo1": "a muro",
                    "campo2": "2000",
                    "campo3": "2022-12-05"
                }
            },
            {
                "id": "0005",
                "location_lat": 45.442943,
                "location_lon": 10.999343,
                "imgs": [
                    "mZ3kV1pRcD.jpeg",
                    "Qw8rLxTz9A.jpeg"
                ],
                "operative": false,
                "fields": {
                    "campo1": "colonnina",
                    "campo2": "2012",
                    "campo3": "2023-06-18"
                }
            },
            {
                "id": "0006",
                "location_lat": 45.444923,
                "location_lon": 10.999319,
                "imgs": [
                    "wP4zXyMv1J.jpeg"
                ],
                "operative": true,
                "fields": {
                    "campo1": "sottosuolo",
                    "campo2": "2018",
                    "campo3": "2023-10-01"
                }
            },
            {
                "id": "0007",
                "location_lat": 45.446924,
                "location_lon": 10.996381,
                "imgs": [
                    "Xy7Bz9WlQe.jpeg",
                    "mZ3kV1pRcD.jpeg",
                    "Qw8rLxTz9A.jpeg"
                ],
                "operative": false,
                "fields": {
                    "campo1": "colonnina",
                    "campo2": "2008",
                    "campo3": "2023-05-12"
                }
            },
            {
                "id": "0008",
                "location_lat": 45.44577,
                "location_lon": 10.957165,
                "imgs": [],
                "operative": true,
                "fields": {
                    "campo1": "a muro",
                    "campo2": "2011",
                    "campo3": "2023-03-30"
                }
            },
            {
                "id": "0009",
                "location_lat": 45.432887,
                "location_lon": 10.996063,
                "imgs": [
                    "KzL8mTqY7W.jpeg",
                    "wP4zXyMv1J.jpeg"
                ],
                "operative": true,
                "fields": {
                    "campo1": "colonnina",
                    "campo2": "2014",
                    "campo3": "2023-08-05"
                }
            },
            {
                "id": "0010",
                "location_lat": 45.416322,
                "location_lon": 10.969517,
                "imgs": [
                    "wP4zXyMv1J.jpeg"
                ],
                "operative": false,
                "fields": {
                    "campo1": "sottosuolo",
                    "campo2": "2003",
                    "campo3": "2022-11-20"
                }
            }
        ],
        // Stato relativo alla geolocalizzazione: permesso richiesto e coordinate (se disponibili)
        geolocPerm: null,
        geoloc: [],
        // Id dell'ultimo pin visualizzato (usato per ripristinare la vista quando si torna alla mappa)
        lastViewedPin: null
    },
    mutations: {
       // Aggiunge un nuovo idrante alla lista (mutazione idempotente)
       // - Prima di aggiungere verifica che non esista già un idrante con le stesse coordinate
       // - Se trova un duplicato la chiamata è silenziosamente ignorata (evita record duplicati)
       addIdr(state, idr) {
        const exists = state.pins.some(p => p.location_lat === idr.location_lat && p.location_lon === idr.location_lon);
        if (exists) {
          console.warn('addIdr: idrante già esistente per queste coordinate, skip', idr.location_lat, idr.location_lon);
          return;
        }
        state.pins.push(idr);
       },
       // Imposta o resetta l'id dell'ultimo pin visualizzato
       setLastViewedPin(state, id) {
        state.lastViewedPin = id;
       }
    }
}

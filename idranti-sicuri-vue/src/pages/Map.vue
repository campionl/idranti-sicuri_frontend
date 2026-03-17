<template>
  <div id="mappa"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapState } from 'vuex';

// Componente Map (pagina principale della mappa)
// - Mostra i pin (idranti) presi dallo store `map.pins`
// - Supporta diverse modalità tramite la prop `type` (es. 'add-idr' per selezionare coordinate)
// - Gestisce la geolocalizzazione dell'utente (permessi, marker utente) e la creazione dei popups
// - Espone metodi utilizzati da altri componenti (es. addPin, setPreviewMarker)
export default {

  name: 'Map',
  props: {
    type: {
      type: String,
      required: false,
    },
    coords: {
      type: Array,
      required: false,
    }
  },
  computed: {
    ...mapState('map', ['pins'])
  },
  data() {
    return {
      map: null,
      geolocPerm: null,
      geoloc: [],
      previewMarker: null,
      justFlewToPin: false,
      // Layer che raggruppa tutti i marker dei pin: lo usiamo per aggiungere e togliere i pin tutti insieme
      markersLayer: null,
      // Marker che rappresenta la posizione dell'utente (creato o aggiornato quando arrivano le coordinate).
      userMarker: null,
      // Handler nominato per l'evento 'locationfound' così possiamo rimuoverlo correttamente in beforeUnmount.
      _onLocationFound: null,
      // Indica se abbiamo già avviato il watcher della posizione (evita chiamate ripetute a map.locate)
      isLocationWatching: false
    }
  },
  mounted() {
    console.log('Mappa: montata');
    // Avviamo la mappa
    // (il caricamento dei pin avviene subito dentro `initMap` dopo aver creato il `markersLayer`).
    this.initMap();
  },
  beforeUnmount() {
    console.log('Mappa: beforeUnmount - rimuovo mappa');
    if (this.map) {
      // Rimuoviamo l'handler di geolocalizzazione se presente e fermiamo il watch
      if (this._onLocationFound) {
        this.map.off('locationfound', this._onLocationFound);
        this._onLocationFound = null;
        if (this.map.stopLocate) this.map.stopLocate();
      }
      // Puliamo i layer e i marker creati per evitare memory leak quando il componente viene distrutto
      if (this.markersLayer) {
        this.markersLayer.clearLayers();
        this.markersLayer = null;
      }
      if (this.userMarker) {
        this.map.removeLayer(this.userMarker);
        this.userMarker = null;
      }
      this.map.remove();
      this.map = null;
    }
  },
  methods: {
    // Inizializza la mappa Leaflet e avvia il caricamento iniziale dei pin e la geolocalizzazione.
    // - Imposta `this.map` con la vista iniziale
    // - Aggiunge il tile layer OpenStreetMap
    // - Crea `this.markersLayer` per gestire i marker in modo invariante
    // - Chiama `this.loadPins()` per popolare i marker immediatamente (migliora UX durante l'attesa dei permessi)
    // - Richiede il permesso di geolocalizzazione e, se consentito, ottiene una posizione iniziale e carica il marker utente
    async initMap() {
      this.map = L.map('mappa', { minZoom: 1, maxZoom: 20 }).setView([45.438913, 10.994400], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 20
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);
      this.loadPins();

      const lastId = this.$store.state.map.lastViewedPin;
      if (lastId) {
        const pin = this.$store.state.map.pins.find(p => p.id === lastId);
        if (pin) {
          this.flyTo([pin.location_lat, pin.location_lon]);
          this.justFlewToPin = true;
        }
        this.$store.commit('map/setLastViewedPin', null);
      }
      if (this.type === 'add-idr') {
        this.map.on('click', (e) => {
          this.$emit('coords-selected', [e.latlng.lat, e.latlng.lng]);
        });
      }

      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 500);

      this.geolocPerm = await this.askGeolocationPermission();
      if (this.geolocPerm) {
        try {
          this.geoloc = await this.getLocalCoordinates();
          this.loadUserMarker();
          this.loadPins();
        } catch (e) {
          console.error("Errore nel recuperare la posizione:", e);
        }
      }
    },
    // Richiede il permesso di geolocalizzazione al browser.
    // - Usa `navigator.geolocation.getCurrentPosition` per capire se l'utente ha dato il consenso
    // - Non restituisce le coordinate (solo true/false): per ottenere la posizione vera e propria usare `getLocalCoordinates()`
    async askGeolocationPermission() {
      return new Promise((resolve) => {
        //      Verifichiamo che l'API Geolocation sia disponibile nel browser
        if (!("geolocation" in navigator)) {
          this.geolocPerm = false;
          console.log('askGeolocationPermission: geolocalizzazione non supportata');
          resolve(false);
        } else {
          //    Chiediamo una posizione di prova: se l'utente acconsente la callback success viene chiamata
          navigator.geolocation.getCurrentPosition(
            () => {
              //Callback success: il permesso è stato concesso
              this.geolocPerm = true;
              console.log('askGeolocationPermission: permesso concesso');
              resolve(true);
            },
            () => {
              //Callback error: il permesso è stato negato o c'è stato un errore
              this.geolocPerm = false;
              console.log('askGeolocationPermission: permesso negato');
              resolve(false);
            }
          );
        }
      });
    },
    
    async getLocalCoordinates() {
      return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Localizzazione non supportata"));
          return;
        }

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            navigator.geolocation.clearWatch(watchId);
            resolve([position.coords.latitude, position.coords.longitude]);
          },
          (error) => {
            navigator.geolocation.clearWatch(watchId);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 60000
          }
        );
      });
    },
    // Centra la vista della mappa sulle coordinate fornite (lat, lon).
    // - `coords` è [lat, lon]
    // - Usa zoom fisso 15 per mostrare il contesto
    flyTo(coords) {
      console.log('flyTo: spostamento a', coords);
      this.map.flyTo(coords, 15);
    },

    // Aggiunge un nuovo pin (idrante) allo store e ricarica i marker sulla mappa.
    // - `coords` deve essere [lat, lon] (numerici)
    // - Mutazione diretta dello store: aggiunge l'oggetto al `this.$store.state.map.pins`
    // - Dopo aver aggiunto il pin chiama `this.loadPins()` per aggiornare la mappa
    addPin(coords, imgs, operative, fields) {
      //    Controllo duplicati per coordinate identiche
      const exists = this.$store.state.map.pins.some(p => p.location_lat === coords[0] && p.location_lon === coords[1]);
      if (exists) {
        console.log('addPin: pin già esistente per queste coordinate, skip', coords);
        return;
      }
      const newId = (this.pins.length + 1).toString().padStart(4, '0');
      this.$store.state.map.pins.push({
        id: newId,
        location_lat: coords[0],
        location_lon: coords[1],
        imgs: imgs,
        operative: operative,
        fields: fields
      });
      console.log('addPin: aggiunto', newId, coords);
      this.loadPins();
    },

    // Aggiorna i marker sulla mappa leggendo i pin dallo store.
    // - pulisce `this.markersLayer` prima di ripopolarlo per evitare duplicazioni
    // - Costruisce popup con informazioni e, se disponibile, un link "Apri in Maps" con `saddr`
    // - Si basa su `this.$store.state.map.pins` per ottenere i dati dei pin
    loadPins() {
      console.log('loadPins: inizio — numero pin', this.$store.state.map.pins.length);
      // Puliamo il layer dei marker: questo evita duplicazioni visive
      // e mantiene la mappa sincronizzata con lo stato `this.$store.state.map.pins`.
      if (this.markersLayer) {
        this.markersLayer.clearLayers();
      } else {
        this.markersLayer = L.layerGroup().addTo(this.map);
      }
      const redPin = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      const greyPin = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      this.$store.state.map.pins.forEach((item) => {
        console.log('loadPins: aggiungo pin', item.id);
        // Costruiamo il popup. Se abbiamo il permesso di geolocalizzazione, inseriamo anche
        // il link "Apri in Maps" con l'indirizzo di partenza impostato sulle coordinate locali.
        let popup = `
          <div class="custom-leaflet-popup" onclick="this.map.flyTo([${item.location_lat}, ${item.location_lon}], 15)">
            <div class="popup-bar"></div>
            <h1 id=\"id_pin\">${item.id}</h1>
            <p>Coordinate: ${item.location_lat}, ${item.location_lon}</p>
            <p class="${item.operative ? 'operativo-si' : 'operativo-no'}">${item.operative ? 'Operativo' : 'Non operativo'}</p>
        `;
        if (this.geolocPerm) {
          popup += `<a href=\"https://www.google.com/maps?saddr=${this.geoloc[0]},${this.geoloc[1]}&daddr=${item.location_lat},${item.location_lon}\"><button class=\"btn-primary\" id=\"button_info_pin\">Apri in Maps</button></a>`;
        } else {
          popup += `<a href=\"#\" style="text-decoration: none;"><button disabled class=\"btn-primary\" id=\"button_info_pin\">Apri in Maps</button></a>`;
        }
        popup += `<a href=\"/details/${item.id}\" style="text-decoration: none;"><button class=\"btn-primary\" id=\"button_info_pin\">Vedi dettagli</button></a>`;
        popup += `</div>`;
        let icon = item.operative ? redPin : greyPin;
        const marker = L.marker([item.location_lat, item.location_lon], { icon }).addTo(this.markersLayer);
        if (this.type !== 'add-idr') { marker.bindPopup(popup) }
        marker.on('click', () => {
          console.log('marker cliccato:', item.id);
          this.map.flyTo([item.location_lat, item.location_lon], 15);
        });
      });
      console.log('loadPins: completato');
    },
    // Gestisce la creazione/aggiornamento del marker che rappresenta l'utente.
    // Comportamento:
    // - Se `this.geoloc` è già disponibile, crea subito il marker per evitare ritardi
    // - Registra un handler nominato `_onLocationFound` per aggiornare il marker quando arrivano eventi
    // - Avvia `this.map.locate({ watch: true })` per ottenere aggiornamenti in tempo reale
    loadUserMarker() {
      console.log('loadUserMarker: avvio');
      if (!this.map) {
        console.warn('loadUserMarker: mappa non disponibile, skip');
        return;
      }
      //    Definizione dell'icona usata per il marker utente
      const userPin = new L.Icon({
        iconUrl: '../assets/userMarker.png',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      try {
        //    Se disponiamo già di coordinate (snapshot) creiamo subito il marker per migliorare UX
        if (this.geoloc && this.geoloc.length === 2) {
          this.userMarker = L.marker(this.geoloc, { icon: userPin }).addTo(this.map);
          console.log('loadUserMarker: marker creato da geoloc', this.geoloc);
          //    Centriamo la mappa sulla posizione utente solo se non siamo appena volati su un pin
          if (this.type !== 'add-idr' && !this.justFlewToPin) {
            this.map.flyTo(this.geoloc, 15);
          }
          this.justFlewToPin = false;
        }
        //    Registriamo un handler nominato per aggiornamenti in tempo reale (locationfound)
        if (!this._onLocationFound) {
          this._onLocationFound = (e) => {
            if (!this.map) return;
            console.log('loadUserMarker: posizione trovata', e.latlng);
            //     Se non abbiamo ancora un marker creiamolo, altrimenti aggiorniamo la posizione
            if (!this.userMarker) {
              this.userMarker = L.marker(e.latlng, { icon: userPin }).addTo(this.map);
              console.log('loadUserMarker: marker creato da evento', e.latlng);
              if (this.type !== 'add-idr' && !this.justFlewToPin) {
                this.map.flyTo(e.latlng, 15);
              }
              this.justFlewToPin = false;
            } else {
              this.userMarker.setLatLng(e.latlng);
              console.log('loadUserMarker: marker aggiornato', e.latlng);
            }
          };
          //    Attacchiamo il listener e avviamo il watch della posizione
          this.map.on('locationfound', this._onLocationFound);
          this.map.locate({ watch: true, setView: false });
        }
      } catch (e) {
        //   Gestione degli errori: log per il debug
        console.error("Errore nel recuperare la posizione:", e);
      }
    },
    // Posiziona o aggiorna il marker di anteprima usato nella pagina 'AddIdr' quando l'utente
    // inserisce manualmente coordinate o clicca sulla mappa. Il marker è solo di preview (opacità ridotta)
    // e non influisce sui pin salvati nello store.
    // NOTE: accetta anche stringhe con virgola; il metodo effettua una normalizzazione di base
    setPreviewMarker(coords) {
      //  Normalizziamo e convertiamo in float (accetta anche stringhe con virgola)
      const lat = parseFloat(String(coords[0]).replace(',', '.'));
      const lon = parseFloat(String(coords[1]).replace(',', '.'));
      console.log('setPreviewMarker: posiziono anteprima', [lat, lon]);
      //    Validazione minima: usciamo se la mappa non è pronta o le coord non sono numeriche
      if (!this.map || isNaN(lat) || isNaN(lon)) return;
      //  Se esiste già un preview marker lo spostiamo, altrimenti lo creiamo
      if (this.previewMarker) {
        this.previewMarker.setLatLng([lat, lon]);
      } else {
        this.previewMarker = L.marker([lat, lon], { opacity: 0.7 }).addTo(this.map);
      }
      //  Centriamo la mappa sulla posizione di preview con uno zoom ravvicinato
      this.map.flyTo([lat, lon], 19);
    },

    // Rimuove il marker di anteprima se presente. Separato dalla logica dei marker utente/pin.
    // Usato da `AddIdr` per pulire la preview quando l'utente annulla o salva.
    removePreviewMarker() {
      console.log('removePreviewMarker: rimosso');
      if (this.previewMarker) {
        //  Rimuoviamo fisicamente il layer dalla mappa
        this.map.removeLayer(this.previewMarker);
        //  Puliamo il riferimento per permettere la ricreazione successiva
        this.previewMarker = null;
      }
    }
  }
}
</script>

<style>
/* Stili per la pagina Mappa
   - `#mappa` è il contenitore della mappa Leaflet
   - Manteniamo box-sizing e dimensioni responsive per evitare overflow o dimensioni errate
*/
html,
body,
#app {
  height: 100%;
  margin: 10;
  padding: 0;
}

#mappa {
  height: 95vh;
  width: 100%;
  position: relative;
}

.operativo-si {
  color: #0a0;
  font-weight: bold;
  font-size: 17px;
}

.operativo-no {
  color: #d00;
  font-weight: bold;
  font-size: 17px;
}
</style>
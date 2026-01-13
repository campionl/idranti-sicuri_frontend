<!-- Componente Map: vista della mappa con marker e geolocalizzazione -->
<template>
  <div id="mappa"></div>
</template>

<script>
/* Import di Leaflet e del suo file CSS per la visualizzazione della mappa. */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapState } from 'vuex';

/* Componente 'Map' - gestisce la mappa Leaflet, i marker (pin),
   la geolocalizzazione dell'utente e le interazioni dell'utente. */
export default {
  name: 'Map',
  props: {
    // 'type': determina la modalità del componente (es. 'add-idr' per aggiunta di un idrante)
    type: {
      type: String,
      required: false,
    },
    // 'coords': coordinate opzionali fornite da un componente genitore
    coords: {
      type: Array,
      required: false,
    }
  },
  computed: {
    // Mappa lo stato 'pins' dal modulo Vuex 'map' per poterlo usare come 'this.pins'
    ...mapState('map', ['pins'])
  },
  data() {
    return {
      // Riferimento all'istanza Leaflet
      map: null,
      // Flag che indica se l'utente ha autorizzato la geolocalizzazione
      geolocPerm: null,
      // Coordinate locali dell'utente [lat, lon]
      geoloc: [],
      // Marker utilizzato come anteprima quando si selezionano coordinate
      previewMarker: null,
      // Flag per evitare di riposizionare la vista subito dopo un flyTo forzato
      justFlewToPin: false
    }
  },
  mounted() {
    // All'avvio del componente inizializza la mappa e carica i pin
    this.initMap();
    this.loadPins();
    this.$nextTick(() => {
      // Legge l'ultimo pin visualizzato dallo store e, se esiste, vola su di esso
      const lastId = this.$store.state.map.lastViewedPin;
      if (lastId) {
        const pin = this.$store.state.map.pins.find(p => p.id === lastId);
        if (pin) {
          this.flyTo([pin.location_lat, pin.location_lon]);
          this.justFlewToPin = true; // evita flyTo successivi automatici
        }
        // Resetta lo stato nello store
        this.$store.commit('map/setLastViewedPin', null);
      }
      // Se siamo in modalità 'add-idr', abilita la selezione di coordinate tramite click sulla mappa
      if (this.type === 'add-idr') {
        this.map.on('click', (e) => {
          // Emissione delle coordinate selezionate al genitore
          this.$emit('coords-selected', [e.latlng.lat, e.latlng.lng]);
        });
      }
    });
  },
  beforeUnmount() {
    // Rimuove listener di resize e pulisce la mappa
    window.removeEventListener('resize', this.onResize);
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
  methods: {
    // Handler per ridimensionamento: forza invalidateSize sulla mappa
    onResize() {
      if (this.map) this.map.invalidateSize();
    },

    // Inizializza la mappa Leaflet con tiles OpenStreetMap e gestisce la geolocalizzazione
    async initMap() {
      this.map = L.map('mappa', { minZoom: 1, maxZoom: 30 }).setView([45.438913, 10.994400], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 30
      }).addTo(this.map);
      // Forza un invalidateSize dopo un breve delay per correggere problemi di layout iniziali
      setTimeout(() => {
        this.map.invalidateSize();
      }, 300);
      // Richiede permesso di geolocalizzazione
      this.geolocPerm = await this.askGeolocationPermission();
      if (this.geolocPerm) {
        try {
          this.geoloc = await this.getLocalCoordinates();
        } catch (e) {
          console.error("Errore nel recuperare la posizione:", e);
        }
      }
      // Carica i pin e il marker utente se la geolocalizzazione è disponibile
      this.loadPins();
      if (this.geolocPerm) {
        this.loadUserMarker();
      }
      // Assicura il corretto ridisegno quando la finestra o il layout cambiano
      window.addEventListener('resize', this.onResize);
    },

    // Chiede il permesso di usare la geolocalizzazione al browser
    async askGeolocationPermission() {
      return new Promise((resolve) => {
        if (!("geolocation" in navigator)) {
          // Geolocalizzazione non supportata
          this.geolocPerm = false;
          resolve(false);
        } else {
          navigator.geolocation.getCurrentPosition(
            () => {
              // Permesso concesso
              this.geolocPerm = true;
              resolve(true);
            },
            () => {
              // Permesso negato o errore
              this.geolocPerm = false;
              resolve(false);
            }
          );
        }
      });
    },

    // Recupera le coordinate correnti dell'utente tramite l'API Geolocation
    async getLocalCoordinates() {
      return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coord = [
                position.coords.latitude,
                position.coords.longitude
              ];
              resolve(coord);
            },
            (error) => {
              console.error("Errore posizione:", error);
              reject(error);
            }
          );
        } else {
          const errorMsg = "Localizzazione non supportata";
          console.error(errorMsg);
          reject(new Error(errorMsg));
        }
      });
    },

    // Sposta la vista della mappa verso le coordinate fornite
    flyTo(coords) {
      this.map.flyTo(coords, 15);
    },

    // Aggiunge un nuovo pin nello store e ricarica i pin sulla mappa
    addPin(coords, imgs, operative, fields) {
      this.$store.state.map.pins.push({
        id: (this.pins.length + 1).toString().padStart(4, '0'),
        location_lat: coords[0],
        location_lon: coords[1],
        imgs: imgs,
        operative: operative,
        fields: fields
      });
      this.loadPins();
    },

    // Crea e aggiunge marker alla mappa per ogni pin presente nello store
    loadPins() {
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

      // Itera su tutti i pin e costruisce il popup HTML per ciascuno
      this.$store.state.map.pins.forEach((item) => {
        let popup = `
          <div class="custom-leaflet-popup" onclick="this.map.flyTo([${item.location_lat}, ${item.location_lon}], 15)">
            <div class="popup-bar"></div>
            <h1 id=\"id_pin\">${item.id}</h1>
            <p>Coordinate: ${item.location_lat}, ${item.location_lon}</p>
            <p class="${item.operative ? 'operativo-si' : 'operativo-no'}">${item.operative ? 'Operativo' : 'Non operativo'}</p>
        `;
        if (this.geolocPerm) {
          // Se disponibile, aggiunge il pulsante per aprire Google Maps indicando il percorso dall'utente al pin
          popup += `<a href=\"https://www.google.com/maps?saddr=${this.geoloc[0]},${this.geoloc[1]}&daddr=${item.location_lat},${item.location_lon}\"><button class=\"btn-primary\" id=\"button_info_pin\">Apri in Maps</button></a>`;
        } else {
          // Mostra il pulsante disabilitato se non ci sono coordinate utente
          popup += `<a href=\"#\" style="text-decoration: none;"><button disabled class=\"btn-primary\" id=\"button_info_pin\">Apri in Maps</button></a>`;
        }
        popup += `<a href=\"/details/${item.id}\" style="text-decoration: none;"><button class=\"btn-primary\" id=\"button_info_pin\">Vedi dettagli</button></a>`;
        popup += `</div>`;
        let icon = item.operative ? redPin : greyPin;
        const marker = L.marker([item.location_lat, item.location_lon], { icon }).addTo(this.map);
        if (this.type !== 'add-idr') { marker.bindPopup(popup) }
        marker.on('click', () => {
          // Al click centra la mappa sul marker
          this.map.flyTo([item.location_lat, item.location_lon], 15);
        });
      });
  },

  // Aggiunge o aggiorna il marker che rappresenta la posizione dell'utente
  loadUserMarker() {
    const userPin = new L.Icon({
      iconUrl: '../assets/userMarker.png',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    try {
      let userMarker = null;
      this.map.locate({ watch: true, setView: false });
      this.map.on('locationfound', function (e) {
        if (!userMarker) {
          // Crea il marker la prima volta che viene trovata una posizione
          userMarker = L.marker(e.latlng, { icon: userPin }).addTo(this.map);
          if (this.type !== 'add-idr' && !this.justFlewToPin) {
            this.map.flyTo(e.latlng, 15);
          }
          this.justFlewToPin = false;
        } else {
          // Aggiorna la posizione del marker esistente
          userMarker.setLatLng(e.latlng);
        }
      }.bind(this));
    } catch (e) {
      console.error("Errore nel recuperare la posizione:", e);
    }
  },

  // Posiziona un marker di anteprima e centra la mappa su di esso
  setPreviewMarker(coords) {
    if (!this.map) return;
    if (this.previewMarker) {
      this.previewMarker.setLatLng(coords);
    } else {
      this.previewMarker = L.marker(coords, { opacity: 0.7 }).addTo(this.map);
    }
    this.map.flyTo(coords, 19);
  },

  // Rimuove il marker di anteprima
  removePreviewMarker() {
    if (this.previewMarker) {
      this.map.removeLayer(this.previewMarker);
      this.previewMarker = null;
    }
  }
}
}
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
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
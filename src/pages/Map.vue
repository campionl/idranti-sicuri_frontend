<template>
  <div id="mappa"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapState } from 'vuex';

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
      justFlewToPin: false
    }
  },
  mounted() {
    this.initMap();
    this.loadPins();
    this.$nextTick(() => {
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
    });
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
  methods: {
    async initMap() {
      this.map = L.map('mappa', { minZoom: 1, maxZoom: 20 }).setView([45.438913, 10.994400], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 20
      }).addTo(this.map);
      setTimeout(() => {
        this.map.invalidateSize();
      }, 300);
      this.geolocPerm = await this.askGeolocationPermission();
      if (this.geolocPerm) {
        try {
          this.geoloc = await this.getLocalCoordinates();
        } catch (e) {
          console.error("Errore nel recuperare la posizione:", e);
        }
      }
      this.loadPins();
      if (this.geolocPerm) {
        this.loadUserMarker();
      }
    },
    async askGeolocationPermission() {
      return new Promise((resolve) => {
        if (!("geolocation" in navigator)) {
          this.geolocPerm = false;
          resolve(false);
        } else {
          navigator.geolocation.getCurrentPosition(
            () => {
              this.geolocPerm = true;
              resolve(true);
            },
            () => {
              this.geolocPerm = false;
              resolve(false);
            }
          );
        }
      });
    },
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

    flyTo(coords) {
      this.map.flyTo(coords, 15);
    },

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

      this.$store.state.map.pins.forEach((item) => {
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
        const marker = L.marker([item.location_lat, item.location_lon], { icon }).addTo(this.map);
        if (this.type !== 'add-idr') { marker.bindPopup(popup) }
        marker.on('click', () => {
          this.map.flyTo([item.location_lat, item.location_lon], 15);
        });
      });
  },
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
          userMarker = L.marker(e.latlng, { icon: userPin }).addTo(this.map);
          if (this.type !== 'add-idr' && !this.justFlewToPin) {
            this.map.flyTo(e.latlng, 15);
          }
          this.justFlewToPin = false;
        } else {
          userMarker.setLatLng(e.latlng);
        }
      }.bind(this));
    } catch (e) {
      console.error("Errore nel recuperare la posizione:", e);
    }
  },
  setPreviewMarker(coords) {
    if (!this.map) return;
    if (this.previewMarker) {
      this.previewMarker.setLatLng(coords);
    } else {
      this.previewMarker = L.marker(coords, { opacity: 0.7 }).addTo(this.map);
    }
    this.map.flyTo(coords, 19);
  },
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
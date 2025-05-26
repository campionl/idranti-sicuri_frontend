let jsonData = [];
let geolocPerm = null;
let geoloc = [];

async function start() {

    // creazione mappa, set posizione e zoom di default (Piazza Bra)
    let map = L.map('mappa').setView([45.438913, 10.994400], 13);

    // aggiunta layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

    // permessi posizione e coord attuali
    geolocPerm = await askGeolocationPermission();
    if (geolocPerm) {
        try {
            geoloc = await getLocalCoordinates();
        } catch (e) {
            console.error("Errore nel recuperare la posizione:", e);
        }
    }

    // carica json
    await loadJson('db.json');

    // pin rosso e grigio
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

    const userPin = new L.Icon({
        iconUrl: './assets/userMarker.png',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

    // crea i pin
    jsonData.forEach((item, i) => {
        let popup = `
            <h1 id="id_pin">${item.id}</h1>
            <p>Coordinate: ${item.location_lat}, ${item.location_lon}</p>
            <p>Operativo: ${item.operative ? 'Sì' : 'No'}</p>
        `;

        if (geolocPerm && item.operative) {
            popup += `<a href="https://www.google.com/maps?saddr=${geoloc[0]},${geoloc[1]}&daddr=${item.location_lat},${item.location_lon}"><button>Apri in Maps</button></a>`;
        } else {
            popup += `<a href="#"><button disabled>Apri in Maps</button></a>`;
        }

        popup += `<button disabled>Vedi dettagli</button>`;
        const icon = item.operative ? redPin : greyPin;
        L.marker([item.location_lat, item.location_lon], { icon }).addTo(map).bindPopup(popup);
    });

    // 
    if (geolocPerm) {
        try {
            let userMarker = null;
            map.locate({ watch: true, setView: false });
            map.on('locationfound', function (e) {
                if (!userMarker) {
                    userMarker = L.marker(e.latlng, { icon: userPin }).addTo(map);
                    map.flyTo(e.latlng, 15);
                } else {
                    userMarker.setLatLng(e.latlng);
                }
            });
        } catch (e) {
            console.error("Errore nel recuperare la posizione:", e);
        }
    }

}

async function loadJson(path) {
    const response = await fetch(path);
    jsonData = await response.json();
}

async function getLocalCoordinates() {
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
}

async function askGeolocationPermission() {
    return new Promise((resolve) => {
        if (!("geolocation" in navigator)) {
            geolocPerm = false;
            resolve(false);
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    geolocPerm = true;
                    resolve(true);
                },
                (error) => {
                    geolocPerm = false;
                    resolve(false);
                }
            );
        }
    });
}

function attendiFineAnim(map) {
    return new Promise(resolve => {
        map.once('moveend', resolve);
    });
}
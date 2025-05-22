let jsonData = [];
let geolocPerm = null;

async function start() {

    // creazione mappa, set posizione e zoom di default (Piazza Bra)
    let map = L.map('mappa').setView([45.438913, 10.994400], 13);

    // aggiunta layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

    geolocPerm = await askGeolocationPermission();

    // pallino posizione utente
    map.locate({ watch: true });
    map.on('locationfound', function (e) {
        const userMarker = L.circleMarker(e.latlng, {
            radius: 8,
            color: '#ffffff',
            fillColor: '#4444ff',
            fillOpacity: 0.7
        }).addTo(map);
    });
    map.on('locationerror', function (e) {
        console.error("Impossibile determinare la posizione: " + e.message);
        geolocPerm = false;
    });

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

    //lettura presenza / assenza permessi posizione
    geolocPerm = false;
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        if (permissionStatus.state === 'granted') {
            geolocPerm = true;
        } else {
            geolocPerm = false;
        }
        permissionStatus.onchange = () => {
            geolocPerm = permissionStatus.state === 'granted';
        };
    } catch (err) {
        console.error("Errore posizione: ", err);
        geolocPerm = false;
    }

    // crea i pin
    let markers = [];
    let pos = null;
    if (geolocPerm) {
        pos = await getLocalCoordinates();
        for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i].operative) {
                markers[i] = L.marker([jsonData[i].location_lat, jsonData[i].location_lon], { icon: redPin }).addTo(map).bindPopup(
                    '<h1 id="id_pin">' + jsonData[i].id + '</h1>' +
                    '<p>Coordinate: ' + jsonData[i].location_lat + ', ' + jsonData[i].location_lon + '</p>' +
                    '<p>Operativo: Sì</p>' +
                    '<a href=\'https://www.google.com/maps?saddr=' + pos[0] + ',' + pos[1] + '&daddr=' + jsonData[i].location_lat + ',' + jsonData[i].location_lon + '\'><button>Apri in Maps</button></a>' +
                    '<button disabled>Vedi dettagli</button>'
                );
            } else {
                markers[i] = L.marker([jsonData[i].location_lat, jsonData[i].location_lon], { icon: greyPin }).addTo(map).bindPopup(
                    '<h1 id="id_pin">' + jsonData[i].id + '</h1>' +
                    '<p>Coordinate: ' + jsonData[i].location_lat + ', ' + jsonData[i].location_lon + '</p>' +
                    '<p>Operativo: No</p>' +
                    '<a href=\'https://www.google.com/maps?saddr=' + pos[0] + ',' + pos[1] + '&daddr=' + jsonData[i].location_lat + ',' + jsonData[i].location_lon + '\'><button>Apri in Maps</button></a>' +
                    '<button disabled>Vedi dettagli</button>'
                );
            }
        }
    } else {
        for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i].operative) {
                markers[i] = L.marker([jsonData[i].location_lat, jsonData[i].location_lon], { icon: redPin }).addTo(map).bindPopup(
                    '<h1 id="id_pin">' + jsonData[i].id + '</h1>' +
                    '<p>Coordinate: ' + jsonData[i].location_lat + ', ' + jsonData[i].location_lon + '</p>' +
                    '<p>Operativo: Sì</p>' +
                    '<a href=\'#\'><button disabled>Apri in Maps</button></a>' +
                    '<button disabled>Vedi dettagli</button>'
                );
            } else {
                markers[i] = L.marker([jsonData[i].location_lat, jsonData[i].location_lon], { icon: greyPin }).addTo(map).bindPopup(
                    '<h1 id="id_pin">' + jsonData[i].id + '</h1>' +
                    '<p>Coordinate: ' + jsonData[i].location_lat + ', ' + jsonData[i].location_lon + '</p>' +
                    '<p>Operativo: No</p>' +
                    '<a href=\'#\'><button disabled>Apri in Maps</button></a>' +
                    '<button disabled>Vedi dettagli</button>'
                );
            }
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
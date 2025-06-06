let jsonData = [];

let userBlueMarker = null;

async function loadMap() {
    let map = L.map('mappa').setView([45.438913, 10.994400], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let geoloc = [];
    let geolocPerm = await askGeolocationPermission();
    if (geolocPerm) {
        try {
            geoloc = await getLocalCoordinates();
        } catch (e) {
            console.error("Errore nel recuperare la posizione:", e);
        }
    }

    await loadJson('../db.json');
    loadPins(map);
    if (geolocPerm) {
        loadUserMarker(map);
    }

    // Gestione click sulla mappa
    map.on('click', function (e) {
        const lat = e.latlng.lat.toFixed(6);
        const lon = e.latlng.lng.toFixed(6);

        addOrMoveUserBlueMarker(map, lat, lon);

        document.getElementById("info_id_lat").value = lat;
        document.getElementById("info_id_lon").value = lon;
    });

    // Gestione inserimento manuale
    document.getElementById("info_id_lat").addEventListener("change", updateMarkerFromInputs);
    document.getElementById("info_id_lon").addEventListener("change", updateMarkerFromInputs);

    function updateMarkerFromInputs() {
        const lat = parseFloat(document.getElementById("info_id_lat").value);
        const lon = parseFloat(document.getElementById("info_id_lon").value);

        if (!isNaN(lat) && !isNaN(lon)) {
            addOrMoveUserBlueMarker(map, lat, lon);
            map.flyTo([lat, lon], 15);
        }
    }
}

function addOrMoveUserBlueMarker(map, lat, lon) {
    const bluePin = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    if (userBlueMarker) {
        userBlueMarker.setLatLng([lat, lon]);
    } else {
        userBlueMarker = L.marker([lat, lon], { icon: bluePin }).addTo(map);
    }
}


async function loadJson(path) {
    const response = await fetch(path);
    jsonData = await response.json();
}

function loadPins(map) {
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

    const bluePin = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // crea i pin
    jsonData.forEach((item, i) => {
        const icon = item.operative ? redPin : greyPin;
        L.marker([item.location_lat, item.location_lon], { icon }).addTo(map);
    });
}

function loadUserMarker(map) {
    // pin posizione utente
    const userPin = new L.Icon({
        iconUrl: '../assets/userMarker.png',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

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

//funzione per visualizzare le  immagini in anteprima all'inserimetto
function previewImages(event) {
    const preview = document.getElementById('preview');
    preview.innerHTML = '';

    const files = event.target.files;
    if (!files) return;

    // limite 3 file
    const maxFiles = 3;
    if (files.length > maxFiles) {
        alert(`Puoi caricare al massimo ${maxFiles} immagini.`);
        event.target.value = ''; // Resetta l'input file
        return;
    }

    // controllo tipo file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    Array.from(files).forEach(file => {
        if (!allowedTypes.includes(file.type)) {
            console.warn("Formato non supportato:", file.type);
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '60px';
            img.style.maxHeight = '60px';
            img.style.objectFit = 'cover';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function insert_data() {
    id = Math.floor(Math.random() * 10000);
    lat = document.getElementById("info_id_lat").value;
    lon = document.getElementById("info_id_lon").value;
    var operative = document.getElementById("operative").checked;
    camp1 = document.getElementById("camp_1").value;
    camp2 = document.getElementById("camp_2").value;
    camp3 = document.getElementById("camp_3").value;
    console.log("inserimento dati");
    console.log("ID: " + id);
    console.log("Latitudine: " + lat);
    console.log("Longitudine: " + lon);
    console.log("Operativo: " + operative);
    console.log("Campo 1: " + camp1);
    console.log("Campo 2: " + camp2);
    console.log("Campo 3: " + camp3);
}
let jsonData = [];

async function start() {

    // creazione mappa, set posizione e zoom di default (Piazza Bra)
    let map = L.map('mappa').setView([45.438913, 10.994400], 14);

    // aggiunta layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

    // carica json
    await loadJson('db.json');


    // crea i pin
    let markers = [];
    for (let i = 0; i < jsonData.length; i++) {
        markers[i] = L.marker([jsonData[i].location_lat, jsonData[i].location_lon]).addTo(map);
        markers[i].options.id = jsonData[i].id;
        markers[i].on('click', () => {
            clickOnPin(jsonData[i].id);
        });
    }

}

async function loadJson(path) {
    const response = await fetch(path);
    jsonData = await response.json();
}

function clickOnPin(pinID) {
    alert('Pin #' + pinID + 
        '\nCoordinate: ' + jsonData.find(pin => pin.id === pinID).location_lat + ', ' + jsonData.find(pin => pin.id === pinID).location_lon + 
        '\nStato: ' + jsonData.find(pin => pin.id === pinID).status + 
        '\nOperativo: ' + jsonData.find(pin => pin.id === pinID).operative
    );
    
}
//mettere la mappa che si apra nella tabella 
//aggiungere le immagini con il tasto più
//inserire le immagini in db.json

//funzione per visualizzare le  immagini in anteprima all'inserimetto
function previewImages(event) {
    const preview = document.getElementById('preview');
    preview.innerHTML = '';
    const files = event.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
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
    console.log("inserimento dati");
    id = Math.floor(Math.random() * 10000);
    lat = document.getElementById("info_id_lat").value;
    lon = document.getElementById("info_id_lon").value;
    if (document.getElementById("operative").checked) {
        var operative = true;
    } else {
        var operative = false;
    }
    camp1 = document.getElementById("camp_1").value;
    camp2 = document.getElementById("camp_2").value;
    camp3 = document.getElementById("camp_3").value;

    console.log("ID: " + id);
    console.log("Latitudine: " + lat);
    console.log("Longitudine: " + lon);
    console.log("Operativo: " + operative);
    console.log("Campo 1: " + camp1);
    console.log("Campo 2: " + camp2);
    console.log("Campo 3: " + camp3);
}
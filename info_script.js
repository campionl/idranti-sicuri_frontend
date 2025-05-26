let jsonData = [];

async function start() {
    await loadJson('db.json');
    const pars = (window.location.href).split('?');
    if (pars.length > 1) {
        const lastPar = pars[pars.length - 1];
        document.getElementById('IDidr_input').value = lastPar;
        getInfoByID(lastPar);
    }
    document.getElementById("IDidr_input").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            confButtPressed();
        }
    });
}

async function loadJson(path) {
    const response = await fetch(path);
    jsonData = await response.json();
}

function getInfoByID(targetID) {
    const targetIdr = jsonData.find(item => item.id === targetID);

    if (targetIdr) {
        document.getElementById("info_table").style.display = "table";
        document.getElementById("error").style.display = "none";
        document.getElementById("info_id").innerHTML = targetIdr.id;
        document.getElementById("info_lat").innerHTML = targetIdr.location_lat;
        document.getElementById("info_lon").innerHTML = targetIdr.location_lon;
        document.getElementById("info_img1").src = "./assets/" + targetIdr.imgs[0];
        document.getElementById("info_img2").src = "./assets/" + targetIdr.imgs[1];
        if (targetIdr.operative) {
            document.getElementById("info_op").innerHTML = "Sì";
        } else {
            document.getElementById("info_op").innerHTML = "No";
        }
        document.getElementById("info_c1").innerHTML = targetIdr.campo1;
        document.getElementById("info_c2").innerHTML = targetIdr.campo2;
        document.getElementById("info_c3").innerHTML = targetIdr.campo3;
    } else {
        document.getElementById("info_table").style.display = "none";
        document.getElementById("error").style.display = "inline";
    }
}

function confButtPressed() {
    getInfoByID(document.getElementById("IDidr_input").value);
}
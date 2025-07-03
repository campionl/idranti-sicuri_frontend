let jsonData = [];
let IDs = [];
let validID;

async function start() {
    await loadJson('../db.json');
    const pars = (window.location.href).split('?');
    if (pars.length > 1) {
        const lastPar = pars[pars.length - 1];
        document.getElementById('IDidr_input').value = lastPar;
        if (checkInpID(lastPar)) {
            getInfoByID(lastPar);
        } else {
            document.getElementById("info_table").style.display = "none";
            document.getElementById("actionBtn").style.display = "none";
        }
    } else {
        document.getElementById("info_table").style.display = "none";
        document.getElementById("actionBtn").style.display = "none";
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
    IDs = jsonData.map(item => item.id);
}

function getInfoByID(targetID) {
    if (validID) {
        const targetIdr = jsonData.find(item => item.id === targetID);

        if (targetIdr) {
            document.getElementById("info_table").style.display = "table";
            document.getElementById("info_id").innerHTML = targetIdr.id;
            document.getElementById("info_lat").innerHTML = targetIdr.location_lat;
            document.getElementById("info_lon").innerHTML = targetIdr.location_lon;
            if (targetIdr.imgs.length == 0) {
                document.getElementById("info_img_error").style.display = "inline";
                for (let i = 1; i <= 3; i++) {
                    document.getElementById("info_img" + i.toString() + "_link").style.display = "none";
                }
            } else {
                document.getElementById("info_img_error").style.display = "none";
                for (let i = 1; i <= targetIdr.imgs.length; i++) {
                    document.getElementById("info_img" + i.toString() + "_link").style.display = "inline";
                    document.getElementById("info_img" + i.toString()).src = "../assets/" + targetIdr.imgs[i - 1];
                    document.getElementById("info_img" + i.toString() + "_link").href = "../assets/" + targetIdr.imgs[i - 1];
                }
                for (let i = targetIdr.imgs.length + 1; i <= 3; i++) {
                    document.getElementById("info_img" + i.toString() + "_link").style.display = "none";
                }
            }
            if (targetIdr.operative) {
                document.getElementById("info_op").innerHTML = "Sì";
            } else {
                document.getElementById("info_op").innerHTML = "No";
            }
            document.getElementById("info_c1").innerHTML = targetIdr.campo1;
            document.getElementById("info_c2").innerHTML = targetIdr.campo2;
            document.getElementById("info_c3").innerHTML = targetIdr.campo3;
            document.getElementById("editBtn_a").href = document.getElementById("editBtn_a").href + "?" + targetIdr.id;
        } else {
            document.getElementById("info_table").style.display = "none";
        }
    }

}

function confButtPressed() {
    getInfoByID(document.getElementById("IDidr_input").value);
}

function checkInpID() {
    const ID2check = document.getElementById("IDidr_input").value;
    if (ID2check === null) {
        validID = false;
    } else if (IDs.includes(ID2check)) {
        validID = true;
    } else {
        validID = false;
    }
    document.getElementById("button_conf").disabled = !validID;
    return validID;
}
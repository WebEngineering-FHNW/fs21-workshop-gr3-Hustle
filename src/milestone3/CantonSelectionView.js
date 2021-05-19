let cantonNamesArray = [];

function toggleRectangleVis(id, cantonNameid) {
    let recElementById = document.getElementById(id);

    if (recElementById.style.visibility === "hidden") {
        recElementById.style.visibility = "visible"
        cantonNamesArray.push(document.getElementById(cantonNameid).textContent);
        document.getElementById("cSelectionLabel").textContent = cantonNamesArray.join(", ")
    } else {
        recElementById.style.visibility = "hidden"
        cantonNamesArray.pop();
        document.getElementById("cSelectionLabel").textContent = cantonNamesArray.join(", ")
    }
}

function hideRectangle(id) {
    let recElementById = document.getElementById(id);
    recElementById.style.visibility = "hidden";
    document.getElementById("cSelectionLabel").textContent = "Alle Kantone";
    cantonNamesArray = [];
}



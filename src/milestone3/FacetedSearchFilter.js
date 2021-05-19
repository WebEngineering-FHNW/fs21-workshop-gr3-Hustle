function switchFilters() {
    const x = document.getElementById("LabelFilterFirst");
    const y = document.getElementById("LabelFilterSecond");

    if (x.innerHTML === "1. Zeit") {
        x.innerHTML = "2. Kanton";
        y.innerHTML = "1. Zeit";
    } else {
        x.innerHTML = "1. Zeit";
        y.innerHTML = "2. Kanton";
    }
}

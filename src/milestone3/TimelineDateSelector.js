function generateBarGraphs() {
    for (let i = 0; i < 170; i++) {
        const x = document.getElementById("BarChartBox");
        const random = Math.random();
        const xValue = i * 5;
        x.innerHTML += '<rect fill="lightblue" id="pillar' + i + '" x=' + xValue + ' y=' + (198 - 200 * random) + '' +
            ' width="5" height="' + 200 * random + '"  ' +
            'stroke="black" stroke-width="1"/>'
    }
}
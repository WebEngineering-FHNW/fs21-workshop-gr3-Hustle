import {CsvReader}    from "./dataModel/dataModel.js";

export {
    dataContr
}


const dataContr = () => {
    const dir = "../resources/RonaData/";
    const absDir = "D:\\Daten\\Dokumente\\FH\\WexC\\Hustle\\src\\resources\\RonaData\\";

    const readData = fileBlobs => {

        var fileBuffer=[];

        // append the file list to an array
        Array.prototype.push.apply( fileBuffer, fileBlobs ); // <-- here

        CsvReader().aggregateCsv(fileBuffer);

        // CsvReader().readCSV(fileBlobs[0], (d) =>
        //     document.getElementById("box").innerHTML = JSON.stringify(d));

    }

    return {
        getDir: () => {return dir},
        getFiles: () => {return files},
        getTarget: () => {return target},
        readData: readData
    }

}
//
// const data = [
//     {canton: "AG",
//          date: "2021-1-1",
//          type: "Cases",
//          item: 2
//     },
//     {canton: "AG",
//         date: "2021-1-2",
//         type: "Cases",
//         item: 4
//     },
// ];
//
// const timeData = [
//
// ];
//
// const cantonFokus = [
//     "AG", 1200
// ];
//
// // Fokus optionen
// const focusOptions = [
//     "Cases",
//     "Death",
//     "Hospitaliced",
//     "HospitalCapacity",
//     "QuarantineIsolation",
//     "R-Value",
//     "TestCases"
// ]
//
// // Kanton
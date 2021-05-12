import { id }         from "../church/church.js";

export { CsvReader }

const CsvReader = () => {

    const files = [{
        name:"COVID19Cases_geoRegion.csv",
        columns: [
            { c:"geoRegion", n:0 },
            { c:"datum", n:1 },
            { c:"Cases", n:2 },
            { c:"CasesSumTotal", n:3 }
        ]
    },
        {
            name:"COVID19Death_geoRegion.csv",
            columns: [
                { c:"geoRegion", n:0 },
                { c:"datum", n:1 },
                { c:"Death", n:2 },
                { c:"DeathSumTotal", n:3 }
            ]
        },
        {
            name:"COVID19FullyVaccPersons.csv",
            columns: [
                { c:"geoRegion", n:1 },
                { c:"datum", n:0 },
                { c:"FullyVacc", n:2 },
                { c:"FullyVaccSumTotal", n:4 }
            ]
        },
        {
            name:"COVID19Hosp_geoRegion.csv",
            columns: [
                { c:"geoRegion", n:0 },
                { c:"datum", n:1 },
                { c:"Hosp", n:2 },
                { c:"HospSumTotal", n:3 }
            ]
        },
        {
            //"date","geoRegion","ICU_AllPatients","ICU_Covid19Patients","ICU_Capacity","Total_AllPatients","Total_Covid19Patients","Total_Capacity"
            name:"COVID19HospCapacity_geoRegion.csv",
            columns: [
                { c:"geoRegion", n:1 },
                { c:"datum", n:0 },
                { c:"IcuAll", n:2 },
                { c:"IcuCovid", n:3 },
                { c:"IcuCapacity", n:4 },
                { c:"TotalCapacity", n:7 }
            ]
        },
        {
            //"geoRegion","date","median_R_mean"
            name:"COVID19Re_geoRegion.csv",
            columns: [
                { c:"geoRegion", n:0 },
                { c:"datum", n:1 },
                { c:"medianR", n:2 }
            ]
        }, //
        {
            // "datum","entries","entries_pos","entries_neg","sumTotal","timeframe_7d","sumTotal_last7d","timeframe_14d","sumTotal_last14d","timeframe_28d","sumTotal_last28d","timeframe_phase2","sumTotal_Phase2","timeframe_phase2b","sumTotal_Phase2b","sum7d","sum14d","mean7d","mean14d","pos_anteil","pos_anteil_mean7d","timeframe_all","anteil_pos_all","anteil_pos_14","anteil_pos_28","anteil_pos_phase2","anteil_pos_phase2b","pop","inz_entries","inzmean7d","inzmean14d","inzsumTotal","inzsumTotal_last7d","inzsumTotal_last14d","inzsumTotal_last28d","inzsumTotal_Phase2","inzsumTotal_Phase2b","inzsum7d","inzsum14d","entries_diff_last_age","entries_diff_last","type","version","datum_unit","nachweismethode","geoRegion"
            name:"COVID19Test_geoRegion_all.csv",
            columns: [
                { c:"geoRegion", n:45 },
                { c:"datum", n:0 },
                { c:"TestPositiv", n:2 },
                { c:"TestNegativ", n:3 },
                { c:"TestTotal", n:4 }
            ]
        },
        {
            // "date","geoRegion","entries","pop","sumTotal","per100Persons","per100Persons_mean7d","per100PersonsTotal","mean7d","type","version","granularity"
            name:"COVID19VaccDosesAdministered.csv",
            columns: [
                { c:"geoRegion", n:1 },
                { c:"datum", n:0 },
                { c:"VaccAdministred", n:2 },
                { c:"VaccAdministredTotal", n:4 }
            ]
        }];

    let columns = [
        { c:"geoRegion", n:0 },
        { c:"datum", n:1 },
        { c:"entries", n:2 },
        { c:"sumTotal", n:3 }
    ]

    let aggregated = [];

    function aggregateCsv( inputs ){
        if (inputs.length > 0) {
            console.log("readCSV: " + inputs[0].name);
            let fileSettings = files.find( el => el.name === inputs[0].name ).columns;
            console.log("colSets: " + JSON.stringify(fileSettings));
            let reader = new FileReader();
            reader.readAsBinaryString(inputs.shift());
            reader.onload = function (e) {
                parseAgrData(e.target.result, fileSettings)
                aggregateCsv(inputs);
            }
        } else {
            document.getElementById("box").innerText = JSON.stringify(aggregated);
        }

    }

    function parseAgrData(data, colSetting) {
        let lbreak = data.split("\n");
        lbreak.shift();
        lbreak.forEach(res => {
            let cbreak = res.split(",")
            let reg = cbreak[colSetting[0].n];
            let date = cbreak[colSetting[1].n];
            let found = aggregated.find( el =>  {
                return (el.geoRegion == reg && el.datum == date)
            });
            if ( found ){
                colSetting.forEach( el => found[el.c] = cbreak[el.n] )
            } else {
                let entry = {};
                colSetting.forEach( el => entry[el.c] = cbreak[el.n] )
                aggregated.push(entry);
            }
        });
    }

    function readCsv (input, onFinish){
        console.log("readCSV");
        let obj = {size: 0,dataFile: []};
        console.log("starting to Read");
        let reader = new FileReader();
        reader.readAsBinaryString(input);
        reader.onload = function (e) {
            console.log(e);
            obj.size = e.total;
            obj.dataFile = e.target.result
            //console.log(obj.dataFile)
            onFinish(parseData(obj.dataFile));
        }
    }

    function parseData(data) {
        let csvData = [];
        let lbreak = data.split("\n");
        lbreak.shift();
        lbreak.forEach(res => {
            let cbreak = res.split(",")
            let entry = {}
            columns.forEach( el => entry[el.c] = cbreak[el.n] )
            csvData.push(entry);
        });
        console.log(csvData);
        return csvData;
    }

    return {
        readCSV:        readCsv,
        aggregateCsv:   aggregateCsv,
        setColumns:     cols => columns = cols
    }

}
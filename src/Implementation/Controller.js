import { id }                   from "./church/church.js";
import { ObservableList }       from "./observable/observable.js";
import { Attribute, VALUE }     from "./presentationModel/presentationModel.js";
import { Scheduler }            from "./dataflow/dataflow.js";
import { allData }              from "../resources/RonaData/aggregated.js"

export {HustleController}

const DEBUG = true;

const HustleController = () => {

    const focusList = [
        {name:"Faelle", value:"Cases"                   , ctype: "add", ttype: "add"},
        {name:"Tote", value:"Death"                     , ctype: "add", ttype: "add"},
        {name:"Hospitalisiert", value:"Hosp"            , ctype:"average", ttype: "add"},
        {name:"Notaufnahme (alle)", value:"IcuAll"      , ctype:"add", ttype: "add"},
        {name:"Notaufnahme (Covid)", value:"IcuCovid"   , ctype:"add", ttype: "add"},
        {name:"Notaufnahme (max)", value:"IcuCapacity"  , ctype:"average", ttype: "add"},
        {name:"Total Betten", value:"TotalCapacity"     , ctype:"average", ttype: "add"},
        {name:"R-Wert", value:"medianR"                 , ctype:"average", ttype: "average"},
        {name:"Positiv getestet", value:"TestPositiv"   , ctype:"add", ttype: "average"},
        {name:"Negativ getestet", value:"TestNegativ"   , ctype:"add", ttype: "average"},
   ];

    const kpiBoxes = ["medianR","Death","IcuCovid","IcuCapacity","TestPositiv","TestNegativ","Cases","Hosp"]

    const cantons = [
        {name:"Aargau", value:"AG"},
        {name:"Appenzell A.r.", value:"AR"},
        {name:"Appenzell I.r.", value:"AI"},
        {name:"Basel-Land", value:"BL"},
        {name:"Basel-Stadt", value:"BS"},
        {name:"Bern", value:"BE"},
        {name:"Freiburg", value:"FR"},
        {name:"Genf", value:"GE"},
        {name:"Glarus", value:"GL"},
        {name:"Graubünden", value:"GR"},
        {name:"Jura", value:"JU"},
        {name:"Luzern", value:"LU"},
        {name:"Neuenburg", value:"NE"},
        {name:"Nidwalden", value:"NW"},
        {name:"Obwalden", value:"OW"},
        {name:"St. Gallen", value:"SG"},
        {name:"Schaffhausen", value:"SH"},
        {name:"Schwyz", value:"SZ"},
        {name:"Solothurn", value:"SO"},
        {name:"Tessin", value:"TI"},
        {name:"Thurgau", value:"TG"},
        {name:"Uri", value:"UR"},
        {name:"Waadt", value:"VD"},
        {name:"Wallis", value:"VS"},
        {name:"Zürich", value:"ZH"},
        {name:"Zug", value:"ZG"}
    ];

    const fokusController = () => {

        const selection = Attribute("Cases");
        const sequence = Attribute("time");

        const onAnyChange = (f) => {sequence.getObs(VALUE).onChange(f);selection.getObs(VALUE).onChange(f);};

        //debug
        if (DEBUG) sequence.getObs(VALUE).onChange( newVal => console.log(newVal) );
        if (DEBUG) selection.getObs(VALUE).onChange( newVal => console.log(newVal) );

        return{
            setSelection:       selection.getObs(VALUE).setValue,
            getSelection:       selection.getObs(VALUE).getValue,
            setSequence:        sequence.getObs(VALUE).setValue,
            getSequence:        sequence.getObs(VALUE).getValue,
            onChange:           onAnyChange,
            onSequenceChange:   sequence.getObs(VALUE).onChange,
            onSelectionChange:  selection.getObs(VALUE).onChange,
        }
    };

    const cantonController = () => {
        const list = [];
        const selection = ObservableList(list); //selected Cantons

        const toggle = el => {
            if (list.includes(el)){
                selection.del(el);
            } else {
                selection.add(el);
            }
        }

        const clear = () => {
            while (list.length > 0 ) {
                list.forEach(el => selection.del(el));
            }
        }

        return{
            getSelection:       _ => {return list},
            addSel:             selection.add,
            removeSel:          selection.del,
            getCount:           selection.count(),
            onAdd:              selection.onAdd,
            onDel:              selection.onDel,
            onChange:           el => {selection.onAdd(el);selection.onDel(el);},
            toggleSel:          toggle,
            clearSelection:     clear
        }
    };

    const timeController = () => {
        const start = Attribute("2020-03-01");
        const end = Attribute("2021-02-28");

        const onAnyChange = el => {
            start.getObs(VALUE).onChange(el);
            end.getObs(VALUE).onChange(el);
        }

        return{
            setStart:           start.getObs(VALUE).setValue,
            getStart:           start.getObs(VALUE).getValue,
            setEnd:             end.getObs(VALUE).setValue,
            getEnd:             end.getObs(VALUE).getValue,
            onStartChange:      start.getObs(VALUE).onChange,
            onEndChange:        end.getObs(VALUE).onChange,
            onChange:           onAnyChange
        }
    };

    const dataController = (focusController, cantonController, timeController) => {
        const timeLimiters = { start: Date.parse("2020-03-01"), end: Date.parse("2021-02-28")};

        const RelevantData = () => {
            return allData.filter(el => {
                let d = Date.parse(el.datum);
                return (timeLimiters.start <= d && d <= timeLimiters.end);
            });
        }

        const relevantData = RelevantData();

        const filterFinalView = () => {
            let cSelection = cantonController.getSelection();
            let tStart = Date.parse(timeController.getStart());
            let tEnd = Date.parse(timeController.getEnd());

            let data = [];

            if (cSelection.length === 0 ) cSelection = cantons.map( el => { return el.value });

            data = relevantData.filter( el => {
                let d = Date.parse(el.datum);
                let c = el.geoRegion;
                return (tStart <= d && d <= tEnd) && cSelection.includes(c);
            })
            return data;
        }

        /*
        AggregateRawDataView
        Filters and aggregates the data as in the Controllers specified
        @return: Array mit json Elementen:
                    [{name:Cases, value:1023, valueCount:48, valueSum:1023, valueForm:"1'023"},{Deaths}]
         */
        const aggregateKPIView = () => {
            let data = [];

            data = aggregateRawDataView();

            let v;
            let finalData = [];
            focusList.forEach( fel => {
                let chunk = {};
                chunk["name"] = fel.name;
                chunk["id"] = fel.value;
                chunk["value"] = 0;
                chunk["valueSum"] = 0;
                chunk["valueCount"] = 0;
                chunk["valueForm"] = "";
                data.forEach( el => {
                    chunk["valueSum"] += el[fel.value];
                    chunk["valueCount"] ++;
                })

                if (fel.ttype === "add"){
                    v = chunk["valueSum"]
                    chunk["value"] = v;
                    chunk["valueForm"] = formatNumber(v, false);
                } else {
                    v = chunk["valueSum"] / chunk["valueCount"];
                    chunk["value"] = v
                    chunk["valueForm"] = "Ø " + formatNumber(v,true);
                }

                finalData.push(chunk)
            });
            return finalData;
        }

        /* Format
            1023 -> 1'023
            2.143 -> 2.14
         */
        const formatNumber = (number, float) => {
            let v = (float?number.toFixed(2):number.toFixed(0)).toString();
            let x = (float?v.replace(/\d(?=(\d{3})+\.)/g, '$&\''): v.replace(/(.)(?=(\d{3})+$)/g,'$1\''));
            return x;
        }

        /*
        AggregateRawDataView
        Filters and aggregates the data as in the Controllers specified
        @return: Array mit json Elementen:
                    [{canton:AG,    Cases:1023, Casesc:48, CasesSum:1023, CasesForm:"1'023", ...},{}]
         */
        const aggregateRawDataView = () => {
            //(mit tType) --> gibt ein Array mit 1 Eintrag pro Kanton aus
            let d = filterFinalView();
            let tData = []; // "datum:Datum" , Elements...
            d.forEach(el => {
                let canton = el.geoRegion;
                let newAggEl = tData.find(el => el.canton===canton);
                // Baue ein neues Element (Datum, focusElemente, counters)
                if (! newAggEl ) {
                    newAggEl = { canton:canton };
                    focusList.forEach( fel => {
                        newAggEl[fel.value] = 0;
                        newAggEl[fel.value + "Count"] = 0;
                        newAggEl[fel.value + "Sum"] = 0;
                    });
                }

                let v;
                focusList.forEach( fel => {
                    if ( el[fel.value] === "NA") el[fel.value]=0;
                    newAggEl[fel.value + "Sum"] += parseFloat(el[fel.value]);
                    newAggEl[fel.value + "Count"] ++;
                    if ( fel.ctype === "add" ){
                        v = newAggEl[fel.value + "Sum"];
                        newAggEl[fel.value] = v;
                        newAggEl[fel.value + "Form"] = formatNumber(v,false);
                    } else {
                        v = newAggEl[fel.value + "Sum"] / newAggEl[fel.value + "Count"]
                        newAggEl[fel.value] = v;
                        newAggEl[fel.value + "Form"] = "Ø " + formatNumber(v,true);
                    }
                });

                let check = tData.findIndex(el => el.canton===canton);
                if( check >= 0 ){
                    tData[check] = newAggEl;
                } else {
                    tData.push(newAggEl);
                }
            });
            return tData;
        }

        const filterForTime = () => {
            let cantonSelection = cantonController.getSelection();
            let focusSelection = focusController.getSelection();
            let selData = [];
            let data = [];
            if (focusController.getSequence() === "time" || cantonSelection.length === 0){
                selData = relevantData.filter(el => {
                    return el.geoRegion === "CH";
                })
            } else {
                selData = relevantData.filter(el => {
                    return cantonSelection.includes(el.geoRegion);
                });
            }

            selData.forEach( el => {
                let d = el.datum;
                let value = el[focusSelection];
                // Fokus Auswahl bereinigen
                if (value === "NA"){
                    value = 0;
                } else {
                    value = parseFloat(value);
                }

                // Pro Datum zusammenzählen
                let tmpEntry = data.find(el => {return el.datum === d});
                if (tmpEntry) {
                    tmpEntry.value += value;
                    tmpEntry.count += 1;
                } else {
                    data.push({datum: d, value: value, count: 1});
                }
            });

            let focusElement = focusList.find(el => el.value === focusSelection);
            if (focusElement && focusElement.ttype === "average"){
                data.forEach( el => el.value /= el.count);
            }

            return data;

        }

        const filterForCanton = () => {
            let start = Date.parse(timeController.getStart());
            let end = Date.parse(timeController.getEnd());
            let focusSelection = focusController.getSelection();
            let selData = [];
            let data = [];

            if (focusController.getSequence() === "time"){
                selData = relevantData.filter(el => {
                    let d = Date.parse(el.datum);
                    return ( start <= d && d <= end);
                })
            } else {
                selData = relevantData;
            }

            selData.forEach( el => {
                let reg = el.geoRegion;
                let value = el[focusSelection];
                // Fokus Auswahl bereinigen
                if (value === "NA"){
                    value = 0;
                } else {
                    value = parseFloat(value);
                }

                // Pro Kanton zusammenzählen
                let tmpEntry = data.find(el => {return el.geoRegion === reg});
                if (tmpEntry) {
                    tmpEntry.value += value;
                    tmpEntry.count += 1;
                    tmpEntry.valueForm = formatNumber(tmpEntry.value);
                } else {
                    data.push({geoRegion: reg, value: value, count: 1, valueForm: formatNumber(value)});
                }
            });

            let focusElement = focusList.find(el => el.value === focusSelection);
            if (focusElement && focusElement.ctype === "average"){
                data.forEach( el => {
                    let newV = el.value / el.count;
                    el.value = newV;
                    el.valueForm = "Ø " + formatNumber(newV, true);
                });
            }

            return data;
        }

        return {
            getPreSelectedData:     _ => {return relevantData},
            filterForTime:          filterForTime,
            filterForCanton:        filterForCanton,
            filterForKpiView:       aggregateKPIView,
            filterForRawDataView:   aggregateRawDataView
        }

    }

    const scheduler = Scheduler();

    return {
        getFokus:               fokusController,
        getCantonSelection:     cantonController,
        getTimeSelection:       timeController,
        getDataController:      dataController,
        getFokusList:           _ => {return focusList},
        getTimeLimiters:        _ => {return timeLimiters},
        getCantons:             _ => {return cantons},
        getKPIBoxes:            _ => {return kpiBoxes}
    }
};
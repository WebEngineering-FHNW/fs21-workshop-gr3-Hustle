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
        const onSequenceChange = (f) => sequence.getObs(VALUE).onChange(f);
        const onSelectionChange = (f) => selection.getObs(VALUE).onChange(f);

        //debug
        if (DEBUG) onSequenceChange( newVal => console.log(newVal) );
        if (DEBUG) onSelectionChange( newVal => console.log(newVal) );

        return{
            setSelection:       selection.getObs(VALUE).setValue,
            getSelection:       selection.getObs(VALUE).getValue,
            setSequence:        sequence.getObs(VALUE).setValue,
            getSequence:        sequence.getObs(VALUE).getValue,
            onChange:           onAnyChange,
            onSequenceChange:   onSequenceChange,
            onSelectionChange:  onSelectionChange,
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

        return{
            getSelection:       _ => {return list},
            addSel:             selection.add,
            removeSel:          selection.del,
            getCount:           selection.count(),
            onAdd:              selection.onAdd,
            onDel:              selection.onDel,
            onChange:           el => {selection.onAdd(el);selection.onDel(el);},
            toggleSel:          toggle
        }
    };

    const timeController = () => {
        const start = Attribute("2020-06-01");
        const end = Attribute("2020-11-15");

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

        const preSelection = () => {
            return allData.filter(el => {
                let d = Date.parse(el.datum);
                return (timeLimiters.start <= d && d <= timeLimiters.end);
            });
        }
        const preSelectedData = preSelection();


        const filterForTime = () => {
            let cantonSelection = cantonController.getSelection();
            let focusSelection = focusController.getSelection();
            let selData = [];
            let data = [];
            if (focusController.getSequence() === "time" || cantonSelection.length === 0){
                selData = preSelectedData.filter(el => {
                    return el.geoRegion == "CH";
                })
            } else {
                selData = preSelectedData.filter(el => {
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
                selData = preSelectedData.filter(el => {
                    let d = Date.parse(el.datum);
                    return ( start <= d && d <= end);
                })
            } else {
                selData = preSelectedData;
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
                } else {
                    data.push({geoRegion: reg, value: value, count: 1});
                }
            });

            let focusElement = focusList.find(el => el.value === focusSelection);
            if (focusElement && focusElement.ctype === "average"){
                data.forEach( el =>  el.value = (el.value / el.count ).toFixed(4));
            }

            return data;
        }
        return {
            getPreSelectedData:     _ => {return preSelectedData},
            filterForTime:          filterForTime,
            filterForCanton:        filterForCanton
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
        getCantons:             _ => {return cantons}

    }
};


const FokusView = (hustleController, fokus, rootElement) => {

    const render = () => {
        console.log("FokusView: ");

        let focusOptions = "";
        hustleController.getFokusList().forEach( el => focusOptions += '<option value="' + el.value + '">' + el.name + '</option>')

        let selectElement = document.getElementById("focusSelection");
        selectElement.innerHTML = focusOptions;
        selectElement.onchange = _ => fokus.setSelection(selectElement.value);

        let switchPriorityButton = document.getElementById("switchPriorityButton");
        switchPriorityButton.onclick = _ => switchFilters();

        // <label className="font-heading">Fokus:</label>
        // <label>
        //     <select className="font-heading" id="focusSelection">
        //         <option>Positiv getestet</option>
        //         <option>Todesfälle</option>
        //         <option>Hospitalisierte</option>
        //         <option>Quarantäne</option>
        //         <option>Getestet</option>
        //     </select>
        // </label>
        // <br>
        //     <br>
        //
        //         <div className="font-regularText"> Wählen Sie aus, ob zuerst nach Zeit oder Kanton gefiltert werden
        //             soll.
        //         </div>
        //
        //         <br>
        //             <label className="font-heading" id="LabelFilterFirst">1. Zeit</label>
        //             <br>
        //                 <label className="font-heading" id="LabelFilterSecond">2. Kanton</label>
        //                 <br>
        //                     <input id="switchPriorityButton" src="../resources/arrows.png" type="image" value=""
        //                            alt=""/>

        // rootElement.innerHTML = `
        //   Fokus:
        //   <select id="focusSelect">
        //     ${focusOptions}
        //   </select>
        //   </br>
        //   </br>
        //   <div style="">
        //     Facetierte Suche / Reihenfolge: </br>
        //     1. Zeit
        //     </br>
        //     <input type="button" value="vertauschen" text="vertauschen"/>
        //     </br>
        //     2. Kanton
        //   </div>`;
    }

    const switchFilters = () => {
        const x = document.getElementById("LabelFilterFirst");
        const y = document.getElementById("LabelFilterSecond");

        let seqFirst = x.innerText;
        let seqSecond = y.innerText;

        if (seqFirst === "1. Zeit") {
            fokus.setSequence("canton");
            x.innerHTML = "1. Kanton";
            y.innerHTML = "2. Zeit";
        } else {
            fokus.setSequence("time");
            x.innerHTML = "1. Zeit";
            y.innerHTML = "2. Kanton";
        }
    }
    // binding what changes can Occure?

    return {
        render: id(render),
        switchFilters:  id(switchFilters)
    }
};

const TimeView = (hustleController, focusController, cantonController, timeController, dataController, rootElement) => {
    let firstTimeSel = [];
    const render = () => {
        console.log("TimeView: ");
        let tmpArray = [];

        let selData = dataController.filterForTime();

        selData.forEach( el => {
            let d = el.datum;
            let value = el[focusController.getSelection()];
            // Fokus Auswahl bereinigen
            if (value === "NA"){
                value = 0;
            } else {
                value = parseFloat(value);
            }

            // Pro Datum zusammenzählen
            let tmpEntry = tmpArray.find(el => {return el.datum === d});
            if (tmpEntry) {
                tmpEntry.value += value;
            } else {
                tmpArray.push({datum: d,value: value});
            }
        });

        let highestValue = 0;
        tmpArray.forEach( el => {
            if (el.value > highestValue ) highestValue = el.value;
        });
        tmpArray.forEach( el => {
            (el.value !== 0 ) ? el["percent"] = el.value / highestValue : el["percent"] = 0;
        });

        const x = document.getElementById("BarChartBox");
        x.innerHTML = "";
        for (let i = 0; i < tmpArray.length  ; i++) {
            const per = tmpArray[i].percent;
            const datum = tmpArray[i].datum;
            const xValue = i * 2;
            x.innerHTML += '<rect fill="lightblue" datum="' + datum + '" id="pillar' + i + '" x=' + xValue + ' y=' + (198 - 200 * per) + '' +
                ' width="2" height="' + 200 * per + '"  ' +
                'stroke="none" stroke-width="0.5"/>'
        }
    }

    const repaintRectangles = () => {
        const x = document.getElementById("BarChartBox");
        let rects = [... x.children];
        let start = Date.parse(timeController.getStart());
        let end = Date.parse(timeController.getEnd());

        rects.forEach( el => {
            let d = Date.parse(el.getAttribute("datum"))
            if ( start <= d && d <= end ){
                el.setAttribute("class", "selected");
            } else {
                el.setAttribute("class", "");
            }
        })
    }

    // binding what changes can Occure?

    focusController.onSelectionChange(render);
    focusController.onSequenceChange(render);
    timeController.onStartChange(repaintRectangles);
    timeController.onEndChange(repaintRectangles);

    return {
        render: render
    }
};

const CantonsView = (hustleController, focusController, cantonController, timeController, dataController, rootElement) => {

    const render = () => {
        console.log("CantonsView: ");

        const allC = hustleController.getCantons();

        allC.forEach( el => {
            let div = document.createElement("div");
            div.setAttribute("class", "liC");
            div.onclick = _ => cantonController.toggle(el.value);

            div.innerHTML =
                `<svg id="cantonBox${el.value}" class="cantonSelection" width="165" height="40" style="margin:0;">
                    <rect x="0" y="0" width="100%" height="100%" fill="#D3E0EA" style="margin:0;"/>
                    <rect id="${el.value}Selection" visibility="hidden" fill-opacity="0" x="0" y="0" width="100%" 
                        height="100%" stroke='#CA5375' stroke-width="5" style="margin:0; visibility:hidden;"/>
                    <text id="${el.value}Value" x="20" y="25" style="margin:0;" fill="blue">700</text>
                    <text x="80" y="25" style="margin:0;" fill="blue">${el.name}</text>
                </svg>`

            rootElement.appendChild(div);
        })
        updateAll();
    }

    const updateAll = () => {
        let data = dataController.filterForCanton();
        let cantonSel = cantonController.getSelection();

        data.forEach( el => {
            let selElement = document.getElementById(el.geoRegion + "Selection");
            let valElement = document.getElementById(el.geoRegion + "Value");

            if (selElement && valElement){
                if( cantonSel.includes(el.geoRegion) ){
                    selElement.setAttribute( "visibility", "visible");
                } else {
                    selElement.setAttribute( "visibility", "hidden");
                }
                valElement.innerText = el.value;
            }

        })

    }

    const updateValues = () => {
        let allC = hustleController.getCantons();
        let data = dataController.filterForCanton();

        data.forEach( el => {
                let valElement = document.getElementById(el.geoRegion + "Value");
                if (valElement) valElement.innerText = el.value;
        });
    }

    const updateSelection = () => {
        let allC = controller.getCantons();

        allC.forEach( el => {
            let selElement = document.getElementById(el.value + "Selection");

            if (selElement){
                if( cantonController.getCantonSelection().includes(el.value) ){
                    selElement.setAttribute( "visibility", "visible");
                } else {
                    selElement.setAttribute( "visibility", "hidden");
                }
            }//
        });
    }
    // binding what changes can Occure?

    focusController.onChange(updateValues);
    cantonController.onChange(updateSelection);
    timeController.onChange(updateValues);

    return {
        render: id(render)
    }
};


const KPIView = (hustleController, rootElement) => {

    const render = () => // do the stuff that needs to be done
        numberOfTasksElement.innerText = "" + todoController.numberOfTodos();

    // binding what changes can Occure?

    todoController.onTodoAdd(render);
    todoController.onTodoRemove(render);
};

const DataTableView = (hustleController, rootElement) => {

    const render = () => // do the stuff that needs to be done
        numberOfTasksElement.innerText = "" + todoController.numberOfTodos();

    // binding what changes can Occure?

    todoController.onTodoAdd(render);
    todoController.onTodoRemove(render);
};
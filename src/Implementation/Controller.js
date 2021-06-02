import { id }                   from "./church/church.js";
import { ObservableList }       from "./observable/observable.js";
import { Attribute, VALUE }     from "./presentationModel/presentationModel.js";
import { Scheduler }            from "./dataflow/dataflow.js";
import { allData }              from "../resources/RonaData/aggregated.js"

export {HustleController, FokusView, TimeView, CantonsView, KPIView, DataTableView}

const DEBUG = true;

const HustleController = () => {

    const focusList = [
        {name:"Faelle", value:"Cases"},
        {name:"Tote", value:"Death"},
        {name:"Hospitalisiert", value:"Hosp"},
        {name:"Notaufnahme (alle)", value:"IcuAll"},
        {name:"Notaufnahme (Covid)", value:"IcuCovid"},
        {name:"Notaufnahme (max)", value:"IcuCapacity"},
        {name:"Total Betten", value:"TotalCapacity"},
        {name:"R-Wert", value:"medianR"},
        {name:"Positiv getestet", value:"TestPositiv"},
        {name:"Negativ getestet", value:"TestNegativ"},
        {name:"Total Tests", value:"TestTotal"}
    ];

    const cantons = [
        {name:"Aargau", value:"AG"},
        {name:"Appenzell A.r.", value:"AR"},
        {name:"Appenzell I.r.", value:"AI"},
        {name:"Basel-Landschaft", value:"BL"},
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

    const timeLimiters = { start: Date.parse("2020-03-01"), end: Date.parse("2021-02-28")};

    const fokus = () => {

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

    const cantonSelection = () => {
        const list = [];
        const selection = ObservableList(list); //selected Cantons

        return{
            getSelection:       _ => {return list},
            addSel:             selection.add,
            removeSel:          selection.del,
            getCount:           selection.count(),
            onAdd:              selection.onAdd,
            onDel:              selection.onDel
        }
    };

    const timeSelection = () => {
        const start = Attribute("2020-06-01");
        const end = Attribute("2020-11-15");

        return{
            setStart:           start.getObs(VALUE).setValue,
            getStart:           start.getObs(VALUE).getValue,
            setEnd:             end.getObs(VALUE).setValue,
            getEnd:             end.getObs(VALUE).getValue,
            onStartChange:      start.getObs(VALUE).onChange,
            onEndChange:        end.getObs(VALUE).onChange
        }
    };

    const scheduler = Scheduler();

    return {
        getFokusList:           _ => {return focusList},
        getFokus:               fokus,
        getCantonSelection:     cantonSelection,
        getTimeSelection:       timeSelection,
        getTimeLimiters:        _ => {return timeLimiters}
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

        let sequenceElement = document.getElementById("LabelFilterFirst")
        let seq = "";
        if (sequenceElement.innerText == "1. Zeit"){
            seq = "time";
        } else {
            seq = "canton";
        }

        if (fokus.getSequence() === seq) {
            fokus.setSequence(seq);
        }

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

        if (x.innerHTML === "1. Zeit") {
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
        switchFilters:  switchFilters
    }
};

const TimeView = (hustleController, focus, canton, time, rootElement) => {
    let selData = [];
    let firstTimeSel = [];
    const render = () => {
        console.log("TimeView: ");
        let tmpArray = [];
        let cantonSelection = canton.getSelection();
        let limiters = hustleController.getTimeLimiters();

        if (firstTimeSel.length === 0) {
            firstTimeSel = allData.filter(el => {
                let d = Date.parse(el.datum);
                return (limiters.start <= d && d <= limiters.end);
            });
        }

        if (focus.getSequence() === "time" || cantonSelection.length === 0) {
            selData = firstTimeSel.filter(el => {
                return el.geoRegion == "CH";
            })
        } else {
            selData = firstTimeSel.filter(el => {
                return cantonSelection.includes( el.geoRegion );
            })
        }

        selData.forEach( el => {
            let d = el.datum;
            let value = el[focus.getSelection()];
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
        let start = Date.parse(time.getStart());
        let end = Date.parse(time.getEnd());

        console.log("repainting start:" + start + " end: " + end);

        rects.forEach( el => {
            let d = Date.parse(el.getAttribute("datum"))
            console.log(d);
            if ( start <= d && d <= end ){
                el.setAttribute("class", "selected");
            } else {
                el.setAttribute("class", "");
            }
        })
    }

    // binding what changes can Occure?

    focus.onSelectionChange(render);
    focus.onSequenceChange(render);
    time.onStartChange(repaintRectangles);
    time.onEndChange(repaintRectangles);

    return {
        render: render
    }
};

const CantonsView = (hustleController, focusController, timeController, rootElement) => {

    const render = () => {

    }// do the stuff that needs to be done

    // binding what changes can Occure?

    focusController.onChange(render);
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
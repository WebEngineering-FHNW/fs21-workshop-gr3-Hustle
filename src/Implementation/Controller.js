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
        {name:"Total geimpft", value:"FullyVacc"},
        {name:"Hospitalisiert", value:"Hosp"},
        {name:"Notaufnahme (alle)", value:"IcuAll"},
        {name:"Notaufnahme (Covid)", value:"IcuCovid"},
        {name:"Notaufnahme (max)", value:"IcuCapacity"},
        {name:"Total Betten", value:"TotalCapacity"},
        {name:"R-Wert", value:"medianR"},
        {name:"Positiv getestet", value:"TestPositiv"},
        {name:"Negativ getestet", value:"TestNegativ"},
        {name:"Total Tests", value:"TestTotal"},
        {name:"Impfdosen", value:"VaccAdministred"}
    ];

    const fokus = () => {

        const selection = Attribute("text");
        const sequence = Attribute("text");

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
            getSelection:       list,
            addSel:             selection.add,
            removeSel:          selection.del,
            getCount:           selection.count(),
            onAdd:              selection.onAdd,
            onDel:              selection.onDel
        }
    };

    const timeSelection = () => {
        const start = Attribute("");
        const end = Attribute("");

        return{
            setStart:           start.getObs(VALUE).setValue,
            getStart:           start.getObs(VALUE).getValue,
            setEnd:             end.getObs(VALUE).getValue,
            getEnd:             end.getObs(VALUE).setValue,
            onStartChange:      selection.getObs(VALUE).onChange
        }
    };

    const scheduler = Scheduler();

    return {
        getFokusList:           _ => {return focusList},
        getFokus:               fokus,
        getCantonSelection:     cantonSelection,
        getTimeSelection:       timeSelection
    }
};


const FokusView = (hustleController, fokusController, rootElement) => {

    const render = () => {
        let focusOptions = "";
        hustleController.getFokusList().forEach( el => focusOptions += '<option value="' + el.value + '">' + el.name + '</option>')

        let selectElement = document.getElementById("focusSelection");
        selectElement.innerHTML = focusOptions;
        selectElement.onchange = _ => fokusController.setSelection(selectElement.value);

        let sequenceElement = document.getElementById("LabelFilterFirst")
        let seq = ""
        if (sequenceElement.innerText == "1. Zeit"){
            seq = "time";
        } else {
            seq = "canton";
        }
        hustleController.getFokus().setSequence(seq);

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
            hustleController.getFokus().setSequence("canton");
            x.innerHTML = "1. Kanton";
            y.innerHTML = "2. Zeit";
        } else {
            hustleController.getFokus().setSequence("time");
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

const TimeView = (hustleController, rootElement) => {

    const render = () => {
        let selData = allData.filter( el => {
            return el.geoRegion == "AG";
        })

        let d = [];

        console.log(selData);
        const x = document.getElementById("BarChartBox");
        x.innerHTML = "";
        for (let i = 0; i < 170; i++) {
            const random = Math.random();
            const xValue = i * 5;
            x.innerHTML += '<rect fill="lightblue" id="pillar' + i + '" x=' + xValue + ' y=' + (198 - 200 * random) + '' +
                ' width="5" height="' + 200 * random + '"  ' +
                'stroke="black" stroke-width="1"/>'
        }
    }
    // binding what changes can Occure?

    hustleController.getFokus().onSelectionChange(render);
    hustleController.getFokus().onSequenceChange(render);

    return {
        render: render
    }
};

const CantonsView = (hustleController, rootElement) => {

    const render = () => // do the stuff that needs to be done
        numberOfTasksElement.innerText = "" + todoController.numberOfTodos();

    // binding what changes can Occure?

    todoController.onTodoAdd(render);
    todoController.onTodoRemove(render);
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
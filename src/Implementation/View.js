import { id }                   from "./church/church.js";
import { ObservableList }       from "./observable/observable.js";
import { Attribute, VALUE }     from "./presentationModel/presentationModel.js";
import { Scheduler }            from "./dataflow/dataflow.js";
import { allData }              from "../resources/RonaData/aggregated.js"
import { HustleController }     from "./Controller.js";

export {FokusView, TimeView, CantonsView, KPIView, DataTableView}

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
    render();

    return {
        render: id(render),
        switchFilters:  id(switchFilters)
    }
};

const TimeView = (hustleController, focusController, cantonController, timeController, dataController, rootElement) => {

    const render = () => {
        console.log("TimeView: ");
        let tmpArray = dataController.filterForTime();

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

    const updateValues = () => {
        let tmpArray = dataController.filterForTime();

        let highestValue = 0;
        tmpArray.forEach( el => {
            if (el.value > highestValue ) highestValue = el.value;
        });
        tmpArray.forEach( el => {
            (el.value !== 0 ) ? el["percent"] = el.value / highestValue : el["percent"] = 0;
        });

        for (let i = 0; i < tmpArray.length  ; i++) {
            const per = tmpArray[i].percent;
            const datum = tmpArray[i].datum;

            let element = document.getElementById("pillar" + i);
            element.setAttribute("y", (198 - 200 * per));
            element.setAttribute("height", (200 * per));
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

    const checkIfUpdateNeeded = () =>{
        if (focusController.getSequence() === "canton") updateValues();
    }

    render();
    // binding what changes can Occure?

    focusController.onSelectionChange(updateValues);
    focusController.onSequenceChange(updateValues);
    timeController.onStartChange(repaintRectangles);
    timeController.onEndChange(repaintRectangles);
    cantonController.onChange(checkIfUpdateNeeded);

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
            div.onclick = _ => cantonController.toggleSel(el.value);

            div.innerHTML =
                `<svg id="cantonBox${el.value}" class="cantonSelection" width="197" height="40" style="margin:0;">
                    <rect x="0" y="0" width="100%" height="100%" fill="#D3E0EA" style="margin:0;"/>
                    <rect id="${el.value}Selection" visibility="hidden" fill-opacity="0" x="0" y="0" width="100%" 
                        height="100%" stroke='#CA5375' stroke-width="5" style="margin:0;"/>
                    <text text-anchor="end" id="${el.value}Value" x="183" y="25" style="margin:0;" fill="blue">700</text>
                    <text x="15" y="25" style="margin:0;" fill="blue">${el.name}</text>
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
                valElement.textContent = el.value;
            }

        })

    }

    const updateValues = () => {
        let allC = hustleController.getCantons();
        let data = dataController.filterForCanton();

        data.forEach( el => {
                let valElement = document.getElementById(el.geoRegion + "Value");
                if (valElement) valElement.textContent = el.value;;
        });
    }

    const updateSelection = () => {
        let allC = hustleController.getCantons();
        let cantonSel = cantonController.getSelection();

        allC.forEach( el => {
            let selElement = document.getElementById(el.value + "Selection");
            if (selElement){
                if( cantonSel.includes(el.value) ){
                    selElement.setAttribute( "visibility", "visible");
                } else {
                    selElement.setAttribute( "visibility", "hidden");
                }
            }//
        });
    }
    // binding what changes can Occure?

    render();

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
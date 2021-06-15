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
                valElement.textContent = el.valueForm;
            }

        })

    }

    const updateValues = () => {
        let allC = hustleController.getCantons();
        let data = dataController.filterForCanton();

        data.forEach( el => {
                let valElement = document.getElementById(el.geoRegion + "Value");
                if (valElement) valElement.textContent = el.valueForm;;
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


const KPIView = (hustleController, focusController, cantonController, timeController, dataController, rootElement) => {

    const render = () => {
        let titleTime = buildTag("label","titleKPI" )
        titleTime.innerText = "ausgewählte Zeitspanne: ";
        let vonBisLabel = buildTag("label","vonBisKPI", "vonBisKPILabel" );
        let divTime = buildTag("div","kpiTime");
        divTime.append(titleTime);
        divTime.append(vonBisLabel);

        let titleCanton = buildTag("label", "titleKPI");
        titleCanton.innerText = "ausgewählte Kantone: ";
        let cantonSelection = buildTag("label","cSelectionKPI", "cSelectionLabel" );
        let divCanton = buildTag("div","kpiCanton");
        divCanton.append(titleCanton);
        divCanton.append(cantonSelection);

        let divMeta = buildTag("div", "", "kpiMeta")
        divMeta.append(divTime, divCanton);

        let divKPIBoxes = buildTag("div","kpiBoxAroundFocus", "boxes");
        let boxesCount = 6
        let boxes = buildTag("div", "kpiBoxAround");

        let focus = buildBox(0, true)
        let focuswrapper = buildTag("div", "focusWrapper");
        focuswrapper.append(focus)
        for( let i = 0; i < boxesCount; i++){
            boxes.append(buildBox(i))
        }
        divKPIBoxes.append(focuswrapper, boxes);
        rootElement.append(divMeta, divKPIBoxes);
        update()
    }

    const buildBox = (id, focus=false) => {
        let styleC = (focus ? "fkpiBox kpiBox" : "kpiBox");
        let idPart = (focus ? "focus" : id)
        let bdiv = buildTag("div", styleC,"b" + idPart)
        let t = buildTag("label", "kpi-info", "ti" + idPart );
        let v = buildTag("label", "kpi-number", "num" + idPart )
        bdiv.append(t, v);
        return bdiv
    }

    const update = () => {
        let data = dataController.filterForKpiView();
        let kpiConf = hustleController.getKPIBoxes();
        // update Zeit & Kantone:
        let start = timeController.getStart();
        let end = timeController.getEnd();
        let fokus = focusController.getSelection();
        let fokusList = hustleController.getFokusList();
        let vonBis = document.getElementById("vonBisKPILabel");
        vonBis.innerText = formatDate(start) + " - " + formatDate(end);

        let cantons = cantonController.getSelection();
        let cantonLabel = document.getElementById("cSelectionLabel");
        let cString = (cantons.length === 0 ? "Ganze Schweiz" : cantons.join( ", "));

        cantonLabel.innerText = cString;

        let v = document.getElementById("tifocus")
        let t = document.getElementById("numfocus")
        v.innerText = fokusList.find( el => { return el.value === fokus}).name;
        t.innerText = data.find(el => {return el.id === fokus}).valueForm;

        let offset = 0;
        for ( let i = 0; i < 6 ; i++ ){
            if ( kpiConf[i+offset] === fokus ) offset ++;
            let kname = fokusList.find( el => { return el.value === kpiConf[i + offset]}).name;
            let kvalue = data.find(el => {return el.id === kpiConf[i + offset]}).valueForm;
            document.getElementById("ti" + i).innerText = kname;
            document.getElementById("num" + i).innerText = kvalue;
        }

    }

    render();
    // binding what changes can Occure?
    focusController.onSelectionChange(update);
    timeController.onChange(update);
    cantonController.onChange(update);

};

const DataTableView = (hustleController, focusController, cantonController, timeController, dataController, rootElement) => {

    const render = () => { // do the stuff that needs to be done
        let table = buildTag("table", "dataTable", "rawDataTable");
        rootElement.append(table);
    }

    const update = () =>{
        let data = dataController.filterForRawDataView();
        let focus = focusController.getSelection();
        let cantons = cantonController.getSelection();
        let table = document.getElementById("rawDataTable")
        let focusList = hustleController.getFokusList();
        let firstEntry = data[0];
        let currentTr = buildTag("tr");
        let tmpElements = []
        table.innerText="";

        let tmp = buildTag("th");
        tmp.innerText = "Kanton";
        currentTr.append(tmp)

        focusList.forEach( el => {
            let name = el.name;
            let isFocus = focus === el.value
            tmp = buildTag("th", isFocus?"focusTd":"");
            if (name.length >= 9) name = name.replace( " " , "\n")

            tmp.innerText = isFocus? "Fokus: \n" + name: name;
            isFocus ? currentTr.append(tmp) : tmpElements.push(tmp);
        })
        currentTr.append(...tmpElements);
        table.append(currentTr);


        //values:
        data.forEach( el => {
            tmpElements = []
            currentTr = buildTag("tr");
            tmp = buildTag("td");
            tmp.innerText = el.canton;
            currentTr.append(tmp);

            focusList.forEach( ele => {
                tmp = buildTag("td");
                tmp.innerText = el[ele.value + "Form"];
                focus === ele.value ? currentTr.append(tmp) : tmpElements.push(tmp);
            })
            currentTr.append(...tmpElements);
            table.append(currentTr);
        });

    }

    render();
    // binding what changes can Occure?
    focusController.onSelectionChange(update);
    timeController.onChange(update);
    cantonController.onChange(update);
};

const buildTag = (name, c, id) => {
    let v = document.createElement(name);
    v.setAttribute("class", c)
    if (id) v.setAttribute("id", id);
    return v
}

const formatDate = (d)=>{
    let date = new Date(d);
    let formatted_date = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear()
    return formatted_date;
}
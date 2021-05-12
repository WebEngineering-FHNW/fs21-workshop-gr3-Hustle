import { ObservableList }           from "../observable/observable.js";
import { Attribute, VALID, VALUE }  from "../presentationModel/presentationModel.js";
import { Scheduler }                from "../dataflow/dataflow.js";

export {HustleController, FokusView, TimeView, CantonsView, KPIView, DataTableView}

const HustleController = () => {

    const data = () => {}

    const fokus = () => {
        const selection = Attribute("text");
        const sequence = Attribute("text");

        const onAnyChange = (f) => {sequence.getOps(VALUE).onChange(f);selection.getOps(VALUE).onChange(f);};
        const onSequenceChange = (f) => sequence.getOps(VALUE).onChange(f);
        const onSelectionChange = (f) => selection.getOps(VALUE).onChange(f);

        return{
            setSelection:       selection.getOps(VALUE).setValue,
            getSelection:       selection.getOps(VALUE).getValue,
            setSequence:        sequence.getOps(VALUE).setValue,
            getSequence:        sequence.getOps(VALUE).getValue,
            onChange:           onAnyChange,
            onSequenceChange:   onSequenceChange,
            onSelectionChange:  onSelectionChange,
        }
    };

    const cantonSelection = () => {
        const selection = ObservableList(); //selected Cantons
        const count = Attribute(0);

        selection.getOps(VALUE).onChange( (f) => count.getOps(VALUE).set)

        return{
            setSelection:       selection.getOps(VALUE).setValue,
            getSelection:       selection.getOps(VALUE).getValue,
            addSel:             selection.getOps(VALUE).addAll,
            removeSel:          selection.getOps(VALUE).remove,
            getCount:           count.getOps(VALUE).getValue,
            onChange:           selection.getOps(VALUE).onChange
        }
    };

    const timeSelection = () => {
        const start = Attribute("");
        const end = Attribute("");

        return{
            setStart:           start.getOps(VALUE).setValue,
            getStart:           start.getOps(VALUE).getValue,
            setEnd:             end.getOps(VALUE).getValue,
            getEnd:             end.getObs(VALUE).setValue,
            onChange:           selection.getOps(VALUE).onChange
        }
    };

    const scheduler = Scheduler();

    return {
    }
};


const FokusView = (hustleController, rootElement) => {

    const render = () => // do the stuff that needs to be done
        rootElement.innerHTML = `
          Fokus:
          <select>
            <option>positiv getestet</option>
          </select>
          </br>
          </br>
          <div style="">
            Facetierte Suche / Reihenfolge: </br>
            1. Zeit
            </br>
            <input type="button" value="vertauschen" text="vertauschen"/>
            </br>
            2. Kanton
          </div>`;

    // binding what changes can Occure?

};

const TimeView = (hustleController, rootElement) => {

    const render = () => // do the stuff that needs to be done
        numberOfTasksElement.innerText = "" + todoController.numberOfTodos();

    // binding what changes can Occure?

    todoController.onTodoAdd(render);
    todoController.onTodoRemove(render);
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
import { createReactiveArray } from "./reactiveArray.js";

const choreInput = document.getElementById("chore-input");
const addBtn = document.getElementById("btn-add");
const deleteBtn = document.getElementById("btn-delete");
const choresContainer = document.getElementById("chores");

choreInput.addEventListener("keydown", onChoreSubmit);
addBtn.addEventListener("click", onChoreSubmit);
deleteBtn.addEventListener("click", onDeleteBtnClick);

let chores = createReactiveArray(onChoresUpdate);

chores.push("Do dished");
chores.push("Clean kitchen");
chores.push("Do laundry");

function onChoresUpdate(action, elements) {
    if (action === "add") {
        console.log(`Chores added: ${elements}`);
        renderChores();
    } else if (action === "remove") {
        console.log(`Chores removed: ${elements}`);
        renderChores();
    } else {
        console.error(
            `Error on chores proxy array update: action of '${action}' not handled`,
        );
    }
}

function onChoreSubmit(event) {
    if (event.key === "Enter" || event.target === addBtn) {
        const chore = choreInput.value;
        if (chore !== "") {
            chores.push(chore);
            choreInput.value = "";
        }
    }
}

function onDeleteBtnClick() {
    choreInput.value = "";
    chores.clear();
}

function renderChores() {
    const choresElements = [...chores].reduce((pv, nv) => {
        return pv + `<div class="chore rounded flex-center">${nv}</div>`;
    }, "");
    if (choresElements && choresElements !== "") {
        choresContainer.innerHTML = choresElements;
    } else {
        choresContainer.innerHTML = "";
    }
}

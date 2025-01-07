// create an editable text label for cards and group names
function createLabel(initialText="") {
    let label = document.createElement("div");
    label.classList.add("label-wrapper");

    // inner text element
    let text = document.createElement("div");
    text.classList.add("label-text");
    text.innerText = initialText;
    label.appendChild(text);

    // hidden rename input
    let renamer = document.createElement("input");
    renamer.classList.add("label-renamer");
    renamer.style.display = "none";
    label.appendChild(renamer);

    // show rename input on double click
    label.addEventListener("dblclick", () => beginLabelRename(label));

    // cancel rename on blur
    renamer.addEventListener("blur", () => endLabelRename(text, renamer));

    // keydown handling
    renamer.addEventListener("keydown", (e) => {
        switch(e.code) {
            // submit rename on Enter key press
            case "Enter":
                submitLabelRename(label);
                break;
            // blur if Esc is pressed
            case "Escape":
                renamer.blur();
                break;
        }
    })

    return label;
}

function addGroup(groupName) {
    let board = document.getElementById("board");

    let group = document.createElement("div");
    group.classList.add("group");
    group.draggable = true;

    group.addEventListener("dragstart", handleDragstart);

    // header section
    let header = document.createElement("div");
    header.classList.add("group-header");
    group.appendChild(header);

    let groupLabel = createLabel(groupName);
    header.appendChild(groupLabel);

    // add card button
    let addCardButton = document.createElement("button");
    addCardButton.classList.add("add-button", "add-card-button");
    addCardButton.innerText = "+";
    addCardButton.addEventListener("click", () => addCard(group));
    group.appendChild(addCardButton);

    // insert before add group button
    board.insertBefore(group, board.lastElementChild);

    // name group
    beginLabelRename(groupLabel);
}

// creates a new card within the specified group
function addCard(group) {
    // card container
    let card = document.createElement("div");
    card.classList.add("card");
    card.draggable = true;

    let label = createLabel("card", true);
    card.appendChild(label);

    // insert before add new button
    group.insertBefore(card, group.lastElementChild);

    // text input for initial naming
    beginLabelRename(label);
}

// show rename input instead of text on label
function beginLabelRename(label) {
    let text = label.querySelector(".label-text");
    let renamer = label.querySelector(".label-renamer");

    text.style.display = "none";
    renamer.style.display = "block";
    renamer.value = text.innerText;
    renamer.focus();
    renamer.select();
}

// hide rename input of label
function endLabelRename(text, renamer) {
    // submitting rename fires blur event of input
    // this is to prevent the function from running twice due to blur handling
    if (renamer.style.display === "none") return;

    renamer.style.display = "none";
    text.style.display = "block";
}

// apply new name to label
function submitLabelRename(label) {
    let text = label.querySelector(".label-text");
    let renamer = label.querySelector(".label-renamer");

    endLabelRename(text, renamer);
    text.innerText = renamer.value;
}

// handle dragstart event of group and their children card elements
function handleDragstart(e) {
    draggedElement = e.target;

    let data;

    if (draggedElement.classList.contains("group")) {
        data = "group";
    }
    else {
        data = "card";
    }

    e.dataTransfer.setData("text/plain", data);
}

// set drop effect
function dragoverHandler(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
}

// handle drop based on whether a card or a group is being moved
function dropHandler(e) {
    // remove if dragged to trash
    if (e.target.id === "trash") {
        draggedElement.remove();
        return;
    }

    switch(e.dataTransfer.getData("text/plain")) {
        case "card":
            dropCard(e.target, e.clientY);
            break;
        case "group":
            dropGroup(e.clientX);
            break;
    }
}

// drop card based on its position and target group
function dropCard(target, mouseY) {
    // get parent group of drop target
    let group = target.closest(".group");

    // reset if card was dragged to board
    if (!group) return;

    cardsOfTargetGroup = group.querySelectorAll(".card");

    // iterate over cards of target group
    for (const card of cardsOfTargetGroup) {
        let rect = card.getBoundingClientRect();
        let y = rect.top;
        let height = rect.height;
        
        // place dragged card before this one if mouse is above middle point
        if (mouseY < y + height / 2) {
            group.insertBefore(draggedElement, card);
            return;
        }
    }

    // insert dragged card as last if card was placed lower than all the others
    group.insertBefore(draggedElement, group.lastElementChild);
}

// drop group based on its X position
function dropGroup(mouseX) {
    let board = document.getElementById("board");
    let groups = board.querySelectorAll(".group");

    // iterate over groups
    for (const group of groups) {
        let rect = group.getBoundingClientRect();
        let x = rect.x;
        let width = rect.width;

        if (mouseX < x + width / 2) {
            board.insertBefore(draggedElement, group);
            return;
        }
    }

    // insert as last if group was dragged way to the right
    board.insertBefore(draggedElement, board.lastElementChild);
}

// parse board status as JSON and save to local storage
function save() {
    let boardSave = {}
    boardSave.groups = new Array();

    let groups = document.querySelectorAll(".group");

    // iterate over groups
    for (const group of groups) {
        let groupSave = {};

        groupSave.label = group.querySelector(".group-header .label-text").innerText;
        groupSave.cards = new Array();

        let cards = group.querySelectorAll(".card");
        
        // cards within group
        for (const card of cards) {
            let cardLabel = card.querySelector(".label-text").innerText;
            groupSave.cards.push(cardLabel);
        }

        boardSave.groups.push(groupSave);
    }

    // save to local storage
    localStorage.setItem("board", JSON.stringify(boardSave));
}

let draggedElement;

document.getElementById("add-group-button").addEventListener("click", () => addGroup("group"));
addGroup("New Group");

let board = document.getElementById("board");
board.addEventListener("dragover", dragoverHandler);
board.addEventListener("drop", dropHandler);

addEventListener("dragstart", () => {
    setTimeout(() => { document.getElementById("trash").style.display = "flex"}, 0);
})

addEventListener("dragend", () => {
    console.log("end");
    setTimeout(() => { document.getElementById("trash").style.display = "none"; console.log("end");}, 0);
})
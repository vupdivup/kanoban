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

// create a group and append it to board
function addGroup(groupName) {
    let board = document.getElementById("board");

    // group wrapper
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

    // scrollable card list
    let scroller = document.createElement("div");
    scroller.classList.add("card-scroller");
    group.appendChild(scroller);

    // add card button
    let addCardButton = document.createElement("button");
    addCardButton.classList.add("add-button", "add-card-button");

    // add icon within button
    let addIcon = document.createElement("img");
    addIcon.classList.add("icon");
    addIcon.src = "./images/add_icon.png";
    addIcon.draggable = false;
    addCardButton.appendChild(addIcon);

    // add card event handling
    addCardButton.addEventListener("click", () => {
        let card = createCard("card");
        moveCard(card, group);
    });

    group.appendChild(addCardButton);

    // insert before add group button
    board.insertBefore(group, board.lastElementChild);

    // name group
    beginLabelRename(groupLabel);

    return group;
}

// create card with label
function createCard(text) {
    // card container
    let card = document.createElement("div");
    card.classList.add("card");
    card.draggable = true;

    // card text label
    let label = createLabel(text, true);
    card.appendChild(label);

    return card;
}

// move card into group
function moveCard(card, group, before=null) {
    // insert into card list of group
    let scroller = group.querySelector(".card-scroller")
    scroller.insertBefore(card, before);
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
function handleDragover(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
}

function focusDropZone(e) {
    e.target.classList.add("drop-zone");
}

function blurDropZone(e) {
    e.target.classList.remove("drop-zone");
}

// handle drop based on whether a card or a group is being moved
function handleBoardDrop(e) {
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
            moveCard(draggedElement, group, card);
            return;
        }
    }

    // insert dragged card as last if card was placed lower than all the others
    moveCard(draggedElement, group);
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

// remove item if dragged to trash bin
function handleBinDrop(e) {
    draggedElement.remove();
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

// load JSON save from local storage
function load() {
    // clear board
    let board = document.getElementById("board");
    let groups = board.querySelectorAll(".group");
    groups.forEach(g => g.remove());

    try {
        // parse save
        let save = JSON.parse(localStorage.getItem("board"));

        for (const groupSave of save.groups) {
            // create group
            let group = addGroup(groupSave.label);

            for (const cardSave of groupSave.cards) {
                // create card for group
                let card = createCard(cardSave);
                moveCard(card, group);
            }
        }
    }
    catch {
        // use basic template if load failed
        addGroup("to do");
        addGroup("doing");
        addGroup("done");
    }
}

// configure listeners and call startup functions
function init() {
    // add group event
    document.getElementById("add-group-button").addEventListener("click", () => addGroup("group"));

    // board drag & drop events
    let board = document.getElementById("board");
    board.addEventListener("dragover", handleDragover);
    board.addEventListener("drop", handleBoardDrop);

    // deletion drag & drop events
    let bin = document.getElementById("bin");
    bin.addEventListener("dragover", handleDragover);
    bin.addEventListener("drop", handleBinDrop);
    bin.addEventListener("dragenter", focusDropZone);
    bin.addEventListener("dragleave", blurDropZone);
    bin.addEventListener("drop", blurDropZone);

    addEventListener("dragstart", () => {
        setTimeout(() => { document.getElementById("bin").style.display = "flex"}, 0);
    })

    addEventListener("dragend", () => {
        setTimeout(() => { document.getElementById("bin").style.display = "none";}, 0);
    })

    load();
}

let draggedElement;

init();
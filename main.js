// create an editable text label for cards and group names
function createLabel(initialText="") {
    let label = document.createElement("div");
    label.classList.add("label");
    label.innerText = initialText;
    
    // edit label on double click
    label.addEventListener("dblclick", () => editLabel(label));

    // quit editing on blur
    label.addEventListener("blur", () => {
        label.contentEditable = false;

        // edited event
        let e = new Event("labeledit");
        dispatchEvent(e);
    })

    // quit editing on keydown
    label.addEventListener("keydown", (e) => {
        if (e.code !== "Escape" && e.code !== "Enter") return;

        label.blur();
    })

    return label;
}

// make label have an editable text input
function editLabel(label) {
    label.contentEditable = true;
    label.focus();

    // select all text within contenteditable div
    let selection = window.getSelection();
    selection.removeAllRanges();

    let r = document.createRange();
    r.selectNodeContents(label);
    selection.addRange(r);
}

// create a group and append it to board
function addGroup(groupName, edit=false) {
    let board = document.getElementById("board");

    // group wrapper
    let group = document.createElement("div");
    group.classList.add("group");
    group.draggable = true;

    group.addEventListener("dragstart", handleDragstart);

    // label
    let groupLabel = createLabel(groupName);
    group.appendChild(groupLabel);

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
        let card = createCard("");
        moveCard(card, group, edit=true);
    });

    group.appendChild(addCardButton);

    // insert before add group button
    board.insertBefore(group, board.lastElementChild);

    if (edit) {
        let label = group.querySelector(".label");
        editLabel(label);
    }

    // create group event
    let e = new Event("groupadd");
    dispatchEvent(e);

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

    // drag event handlers
    card.addEventListener("dragstart", handleDragstart);

    return card;
}

// move card into group
function moveCard(card, group, edit=false, before=null) {
    // insert into card list of group
    let scroller = group.querySelector(".card-scroller")
    scroller.insertBefore(card, before);

    // scroll to card
    let y = card.offsetTop;
    let scrollerHeight = scroller.offsetHeight;

    // make label editable
    if (edit) {
        let label = card.querySelector(".label");
        editLabel(label);
    }

    // move event
    let e = new Event("cardmove");
    dispatchEvent(e);
}

// handle dragstart event of group and their children card elements
function handleDragstart(e) {
    if (e.handled) return;

    draggedElement = e.currentTarget;

    let data;

    // define item type
    if (draggedElement.classList.contains("group")) {
        data = "group";
    }
    else {
        data = "card";
    }

    e.dataTransfer.setData("text/plain", data);

    // mark event as handled to ensure that bubbling up to group level causes no problems
    e.handled = true;
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
            moveCard(draggedElement, group, false, card);
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
    this.style.display = "none";

    // delete event
    let ev = new Event("itemdelete");
    dispatchEvent(ev);
}

// parse board status as JSON and save to local storage
function save() {
    let boardSave = {}
    boardSave.groups = new Array();

    let groups = document.querySelectorAll(".group");

    // iterate over groups
    for (const group of groups) {
        let groupSave = {};

        // first label within group is always the group label
        groupSave.label = group.querySelector(".label").innerText;
        groupSave.cards = new Array();

        let cards = group.querySelectorAll(".card");
        
        // cards within group
        for (const card of cards) {
            let cardLabel = card.querySelector(".label").innerText;
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

            // reset group scroll
            let scroller = group.querySelector(".card-scroller");
            scroller.scroll(0, 0);
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
    let addGroupButton = document.getElementById("add-group-button")
    addGroupButton.addEventListener("click", () => addGroup("new group", edit=true));

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

    // save points
    // must be after load to not trigger save unnecessarily
    addEventListener("cardmove", save);
    addEventListener("labeledit", save);
    addEventListener("groupadd", save);
    addEventListener("itemdelete", save);
}

let draggedElement;

init();
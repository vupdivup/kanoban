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

        save();
    })

    // quit editing on keydown
    label.addEventListener("keydown", (e) => {
        if (e.code !== "Enter") return;

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

// create a group for storing cards
function createGroup(label) {
    // group wrapper
    let group = document.createElement("div");
    group.classList.add("group");
    group.draggable = true;

    group.addEventListener("dragstart", handleDragstart);

    group.addEventListener("dragenter", handleDragenter);
    group.addEventListener("dragleave", handleDragleave);

    // label
    let groupLabel = createLabel(label);
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

    return group;
}

// move group within board
function moveGroup(group, edit, saveAfter=true, before=null) {
    let board = document.getElementById("board");

    // ensure to insert before add new button
    if (!before) {
        before = board.lastElementChild;
    }

    board.insertBefore(group, before);

    // make editable if specified
    if (edit) {
        let label = group.querySelector(".label");
        editLabel(label);
    }

    if (saveAfter) save();
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
    card.addEventListener("dragenter", handleDragenter);
    card.addEventListener("dragleave", handleDragleave);

    return card;
}

// move card into group
function moveCard(card, group, edit=false, saveAfter=true, before=null) {
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

    if (saveAfter) save();
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

// highlight drop zone
function handleDragenter(e) {
    e.currentTarget.classList.add("drop-zone");
}

// remove drop zone highlight if drag leaves element
function handleDragleave(e) {
    // if mouse is still within target, don't remove dropzone styling
    if (e.currentTarget.contains(e.relatedTarget)) return;

    e.currentTarget.classList.remove("drop-zone");
}

// remove all drop zone highlights
function handleDragend(e) {
    let dropZones = document.querySelectorAll(".drop-zone");

    for (const dz of dropZones) {
        dz.classList.remove("drop-zone");
    }
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
            moveCard(draggedElement, group, false, true, card);
            return;
        }
    }

    // insert dragged card as last if card was placed lower than all the others
    moveCard(draggedElement, group);
}

// drop group based on its X position
function dropGroup(mouseX) {
    let groups = board.querySelectorAll(".group");

    // iterate over groups
    for (const group of groups) {
        let rect = group.getBoundingClientRect();
        let x = rect.x;
        let width = rect.width;

        // place dragged before current group if mouse x is less than current's middle point 
        if (mouseX < x + width / 2) {
            moveGroup(draggedElement, false, true, group);
            return;
        }
    }

    // insert as last if group was dragged way to the right
    moveGroup(draggedElement, false);
}

// remove item if dragged to trash bin
function moveItemToBin() {
    draggedElement.remove();

    save();
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
            let group = createGroup(groupSave.label);
            moveGroup(group, false, false);

            for (const cardSave of groupSave.cards) {
                // create card for group
                let card = createCard(cardSave);
                moveCard(card, group, false, false);
            }

            // reset group scroll
            let scroller = group.querySelector(".card-scroller");
            scroller.scroll(0, 0);
        }
    }
    catch {
        // use basic template if load failed
        let toDo = createGroup("to do");
        let doing = createGroup("doing");
        let done = createGroup("done");

        moveGroup(toDo, false, false);
        moveGroup(doing, false, false);
        moveGroup(done, false, false);
    }
}

// configure listeners and call startup functions
function init() {
    // add group event
    let addGroupButton = document.getElementById("add-group-button")
    addGroupButton.addEventListener("click", () => {
        let group = createGroup("");
        moveGroup(group, true);
    });

    // board drag & drop events
    let board = document.getElementById("board");
    board.addEventListener("dragover", handleDragover);
    board.addEventListener("drop", handleBoardDrop);

    // deletion drag & drop events
    let bin = document.getElementById("bin");
    bin.addEventListener("dragover", handleDragover);
    bin.addEventListener("drop", moveItemToBin);
    bin.addEventListener("dragenter", handleDragenter);
    bin.addEventListener("dragleave", handleDragleave);

    // drag end - document-wide
    document.addEventListener("dragend", handleDragend);

    // show bin when dragging
    // timeout is to ensure that drag starts before layout is updated
    addEventListener("dragstart", () => {
        setTimeout(() => { bin.style.display = "flex"}, 0);
    })

    // hide bin
    document.addEventListener("dragend", () => { bin.style.display = "none"; });

    // blur on Escape press
    document.addEventListener("keydown", e => {
        if (e.code === "Escape") document.activeElement.blur();
    })

    load();
}

let draggedElement;

init();
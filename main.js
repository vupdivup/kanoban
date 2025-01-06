function addGroup(groupName) {
    let board = document.getElementById("board");

    let group = document.createElement("div");
    group.classList.add("group");

    let groupLabel = document.createElement("div");
    groupLabel.innerText = groupName;
    group.appendChild(groupLabel);

    let addCardButton = document.createElement("button");
    addCardButton.innerText = "+";
    addCardButton.addEventListener("click", () => addCard(group));
    group.appendChild(addCardButton);

    board.insertBefore(group, board.lastElementChild);
}

// creates a new card within the specified group
function addCard(group) {
    // card container
    let card = document.createElement("div");
    card.classList.add("card");

    // card label
    let label = document.createElement("div");
    label.classList.add("label");
    label.innerText = "card";

    card.appendChild(label);

    // card label input
    let renameInput = document.createElement("input");
    renameInput.classList.add("label-input");
    renameInput.style.display = "none";
    card.appendChild(renameInput);

    // initiate renaming via double click
    label.addEventListener("dblclick", () => beginRename(label, renameInput));

    // cancel rename if input is blurred
    renameInput.addEventListener("blur", () => endRename(label, renameInput));

    // rename hotkeys
    renameInput.addEventListener("keydown", (e) => {
        switch(e.code) {
            // submit rename on Enter key press
            case "Enter":
                submitRename(label, renameInput);
                break;
            // blur if esc is pressed
            case "Escape":
                renameInput.blur();
                break;
        }
    })

    // delete button
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-card");
    deleteButton.innerText = "X";
    deleteButton.addEventListener("click", () => card.remove());
    card.appendChild(deleteButton);

    // events for button hover visuals
    card.addEventListener("mouseover", () => show(deleteButton));
    card.addEventListener("mouseleave", () => hide(deleteButton));

    group.insertBefore(card, group.lastElementChild);
}

function beginRename(label, input) {
    label.style.display = "none";
    input.style.display = "block";
    input.value = label.innerText;
    input.focus();
}

function endRename(label, input) {
    input.style.display = "none";
    label.style.display = "block";
}

function submitRename(label, input) {
    endRename(label, input);
    label.innerText = input.value;
}

function show(element) {
    element.style.visibility = "visible"; 
}

function hide(element) {
    element.style.visibility = "hidden";
}

document.getElementById("add-group").addEventListener("click", () => addGroup("group"));
addGroup("group");
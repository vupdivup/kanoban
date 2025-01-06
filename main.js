function createLabel(text, rename=false) {
    let wrapper = document.createElement("div");
    wrapper.classList.add("label-wrapper");

    let label = document.createElement("div");
    label.classList.add("label-text");
    label.innerText = text;
    wrapper.appendChild(label);

    let renamer = document.createElement("input");
    renamer.classList.add("label-rename-input");
    renamer.style.display = "none";
    wrapper.appendChild(renamer);

    wrapper.addEventListener("dblclick", () => beginRename(label, renamer));

    renamer.addEventListener("blur", () => endRename(label, renamer));

    renamer.addEventListener("keydown", (e) => {
        switch(e.code) {
            // submit rename on Enter key press
            case "Enter":
                submitRename(label, renamer);
                break;
            // blur if esc is pressed
            case "Escape":
                renamer.blur();
                break;
        }
    })

    // TODO: this doesn't focus
    if (rename) beginRename(label, renamer);

    return wrapper;
}

function addGroup(groupName) {
    let board = document.getElementById("board");

    let group = document.createElement("div");
    group.classList.add("group");

    let groupLabel = createLabel(groupName);
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

    let label = createLabel("card", true);
    card.appendChild(label);

    group.insertBefore(card, group.lastElementChild);
}

function beginRename(label, input) {
    label.style.display = "none";
    input.style.display = "block";
    input.value = label.innerText;
    input.focus();
}

// TODO: this fires twice on submit
function endRename(label, input) {
    console.log("Ending");
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
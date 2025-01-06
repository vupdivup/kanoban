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

document.getElementById("add-group-button").addEventListener("click", () => addGroup("group"));
addGroup("New Group");
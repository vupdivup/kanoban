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

function addCard(group) {
    let card = document.createElement("div");
    card.innerText = "card";
    group.insertBefore(card, group.lastElementChild);
}

document.getElementById("add-group").addEventListener("click", () => addGroup("group"));
addGroup("group");
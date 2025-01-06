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
    let cardLabel = document.createElement("div");
    cardLabel.classList.add("label");
    cardLabel.innerText = "card";
    card.appendChild(cardLabel);

    // delete button
    let deleteCardButton = document.createElement("button");
    deleteCardButton.classList.add("delete-card");
    deleteCardButton.innerText = "X";
    deleteCardButton.addEventListener("click", () => card.remove());
    card.appendChild(deleteCardButton);

    // events for button hover visuals
    card.addEventListener("mouseover", () => show(deleteCardButton));
    card.addEventListener("mouseleave", () => hide(deleteCardButton));

    group.insertBefore(card, group.lastElementChild);
}

function show(element) {
    element.style.visibility = "visible"; 
}

function hide(element) {
    element.style.visibility = "hidden";
}

document.getElementById("add-group").addEventListener("click", () => addGroup("group"));
addGroup("group");
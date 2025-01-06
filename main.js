function addGroup() {
    let board = document.getElementById("board");

    let group = document.createElement("div");
    group.classList.add("group");

    board.insertBefore(group, this);
}

document.getElementById("add-group").addEventListener("click", addGroup);
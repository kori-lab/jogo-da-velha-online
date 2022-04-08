/* exemple row arena
<div class="arena-row" id="row1">
    <button id="arena-cell-1-1"></button>
    <button id="arena-cell-1-2"></button>
    <button id="arena-cell-1-3"></button>
</div>
*/

function renderizeArena(arena) {
  const arena_element = document.querySelector("#arena");
  arena_element.innerHTML = "";

  var index_row = 0;
  for (const row of arena) {
    const row_element = document.createElement("div");
    row_element.classList.add("arena-row");
    row_element.id = `row${index_row}`;

    var index_cell = 0;
    for (const button of row) {
      const button_element = document.createElement("button");
      button_element.id = `arena-cell-${index_row}-${index_cell}`;
      button_element.innerHTML = button;
      row_element.appendChild(button_element);

      ++index_cell;
    }

    ++index_row;
    arena_element.appendChild(row_element);
  }
}

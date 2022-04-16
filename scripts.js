const gridSize = 16;
const grid = document.querySelector('.grid');
grid.style.cssText = `grid-template-columns: repeat(${gridSize}, 1fr);
    grid-template-rows: repeat(${gridSize}, 1fr);`;
const tiles = [];

// Generate the grid tiles
function generateGrid (size) {

    for (let i=0; i < size * size; i++) {
        tiles.push(document.createElement('div'));
    }

    tiles.forEach((tile) => {
        tile.classList.add('tile');
        grid.appendChild(tile);
    });

}

generateGrid (gridSize);


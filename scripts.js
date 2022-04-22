// Sketch Modes
const activeMode = modeClassic;

function modeClassic() {
    this.style.cssText = 'background-color: black;';
}

function modeGhost() {

}

function modeColor() {
    const customColor = document.querySelector('#custom-color');
    this.style.cssText = `background-color: ${customColor.value};`;
}

function modeRainbow() {
    const currentColor = this.style.backgroundColor;
    const h = Math.floor(Math.random() * (360 + 1));
    const s = Math.floor(Math.random() * (50 + 1)) + 50;
    let l = 50;

    if (currentColor === 'white') {
        this.style.cssText = `background-color: hsl(${h},${s}%,${l}%);`;
    }

}

function modePicture() {
    this.style.cssText = `opacity: 0;`;
}

// Generate Grid
const grid = document.querySelector('.grid');
let gridSize = 16;
const gridTiles = [];

generateGrid (gridSize);

function generateGrid (size) {
    grid.style.cssText = `grid-template-columns: repeat(${size}, 1fr);
    grid-template-rows: repeat(${size}, 1fr);`;

    for (let i=0; i < size * size; i++) {
        gridTiles.push(document.createElement('div'));
    }
    gridTiles.forEach((tile) => {
        tile.classList.add('tile');
        grid.appendChild(tile);
        tile.addEventListener('mouseover', modeRainbow);
        tile.style.cssText = 'background-color: white; opacity: 1;';
    });
}

// Clear Grid
const clearButton = document.querySelector('.clear');
clearButton.addEventListener('click', clearGrid)

function clearGrid() {
    gridTiles.forEach((tile) => {
        tile.style.cssText = 'background-color: white; opacity: 1;';
    });
}

// INITIATORS & SETTINGS
// ========================================================

// Mouse tracking
let mouseDown = false;

window.addEventListener('mousedown', ()=> {
    mouseDown = true;
})
window.addEventListener('mouseup', ()=> {
    mouseDown = false;
})

// Grid
const grid = document.querySelector('.grid');
const gridTiles = [];

// Grid Color
const storedGridColor = sessionStorage.getItem('lastGridColor');
let gridColor = (storedGridColor !== null) ? storedGridColor : '#ffffff';
const gridColorInput = document.querySelector('#grid-color');
gridColorInput.value = gridColor;

gridColorInput.addEventListener('input', () => {
    gridColor = gridColorInput.value;
    sessionStorage.setItem('lastGridColor', gridColor);
});

// Grid Lines
const gridLines = document.querySelector('#grid-lines');
const sessionGridLines = sessionStorage.getItem('lastGridLines');
gridLines.value = (sessionGridLines !== null) ? sessionGridLines : 0;
const gridLinesValue = document.querySelector('#grid-lines-value');
gridLinesValue.textContent = gridLines.value;

gridLines.addEventListener('input', () => {
    gridLinesValue.textContent = gridLines.value;
    sessionStorage.setItem('lastGridLines', gridLines.value);
});

// Grid Size
const gridSize = document.querySelector('#grid-size');
const sessionGridSize = sessionStorage.getItem('lastGridSize');
gridSize.value = (sessionGridSize !== null) ? sessionGridSize : 16;
const gridSizeValue = document.querySelector('#grid-size-value');
gridSizeValue.textContent = gridSize.value;

gridSize.addEventListener('input', () => {
    gridSizeValue.textContent = gridSize.value;
    sessionStorage.setItem('lastGridSize', gridSize.value);
});

// Active Mode
const storedMode = sessionStorage.getItem('lastMode');
let activeMode = (storedMode !== null) ? storedMode : 'classic';
storedModeButton = document.querySelector(`[data-mode="${activeMode}"]`);

// Mode Buttons
const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));
modeButtons.forEach(modeButton => modeButton.addEventListener('click', function() {
    setActiveMode(this, this.dataset.mode);
}));

// Sketch Options
const sketchOptions = Array.from(document.querySelectorAll('.main-option > input'));
const eraser = document.querySelector('#eraser');
eraser.checked = true;
const dark = document.querySelector('#dark');
const light = document.querySelector('#light');
const overlay = document.querySelector('#overlay');

const penColor = document.querySelector('#pen-color');
const penColorValue = document.querySelector('#pen-color-value');
penColorValue.textContent = penColor.value;
penColor.addEventListener('input', () => {
    penColorValue.textContent = penColor.value;
});

function disableSketchOptions() {
    sketchOptions.forEach(sketchOption => {
        sketchOption.disabled = true;
        sketchOption.checked = false;
    });
}

let shadeColor;


// GRID CREATION
// ========================================================

const gridButton = document.querySelector('.generate');
gridButton.addEventListener('click', () => {
    generateGrid(0);
    generateGrid(gridSize.value);
});

function generateGrid(size) {
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    grid.style.gap = `${gridLines.value}px`;
    grid.style.backgroundColor = gridColor;

    gridTiles.length = 0;

    for (let i = 0; i < size * size; i++) {
        gridTiles.push(document.createElement('div'));
    }
    gridTiles.forEach((tile) => {
        tile.setAttribute('data-passed', 0);
        tile.classList.add('tile');
        grid.appendChild(tile);
        tile.addEventListener('mouseover', sketch);
        tile.style.cssText = 'background-color: transparent; opacity: 1';
    });
}

generateGrid(gridSize.value);
setActiveMode(storedModeButton, activeMode);

// SKETCH MODES
// ========================================================

function setActiveMode(button, mode) {
    activeMode = '';
    clearGrid();

    modeButtons.forEach(modeButton => {
        modeButton.disabled = false;
    });
    button.disabled = true;

    disableSketchOptions();

    gridTiles.forEach((tile) => {
        tile.dataset.passed = '0';
        tile.classList.remove('animation');
        tile.style.cssText = 'background-color: white; opacity: 1;';
    });

    // Classic mode
    if (mode === 'classic') {
        activeMode = 'classic';
        eraser.disabled = false;
        overlay.disabled = false;
    }
    // Color mode
    else if (mode === 'color') {
        activeMode = 'color';
        eraser.disabled = false;
        overlay.disabled = false;
    }
    // Rainbow mode
    else if (mode === 'rainbow') {
        activeMode = 'rainbow';
        eraser.disabled = false;
        overlay.disabled = false;
    }
    // Ghost mode
    else if (mode === 'ghost') {
        activeMode = 'ghost';
    }
    // Shades mode
    else if (mode === 'shades') {
        activeMode = 'shades';
        eraser.disabled = false;
        overlay.disabled = false;
        shadeColor = Math.floor(Math.random() * (360 + 1));
    }
    // Picture mode
    else if (mode === 'picture') {
        activeMode = 'picture';
        grid.style.gap = '0';
        grid.style.backgroundImage = 'url("https://source.unsplash.com/random")';
        gridTiles.forEach((tile) => {
            tile.style.cssText = 'background-color: black; opacity: 1;';
        });
    }

    sessionStorage.setItem('lastMode', activeMode);
}

// SKETCH BEHAVIOR
// ========================================================

function sketch() {

    if (!mouseDown) {
        return
    }

    // Tile attributes
    let timesPassed = parseInt(this.dataset.passed);
    const currentColor = this.style.backgroundColor;

    // Classic mode
    if (activeMode === 'classic') {
        if (eraser.checked) {
            this.style.backgroundColor = 'background-color: white;';
        } else {
            this.style.cssText = 'background-color: black;';
        }
    }
    // Color mode
    else if (activeMode === 'color') {
        if (eraser.checked) {
            this.style.cssText = 'background-color: white;';
        } else if (!overlay.checked && this.style.backgroundColor === 'white') {
            this.style.cssText = `background-color: ${penColor.value};`;
        } else if (overlay.checked) {
            this.style.cssText = `background-color: ${penColor.value};`;
        }
    }
    // Rainbow mode
    else if (activeMode === 'rainbow') {

        const h = Math.floor(Math.random() * (360 + 1));
        const s = Math.floor(Math.random() * (50 + 1)) + 50;
        let l = 50;

        if (eraser.checked) {
            this.style.cssText = 'background-color: white;';
        } else if (!overlay.checked && currentColor === 'white') {
            this.style.cssText = `background-color: hsl(${h},${s}%,${l}%);`;
        } else if (overlay.checked) {
            this.style.cssText = `background-color: hsl(${h},${s}%,${l}%);`;
        }
    }
    // Ghost mode
    else if (activeMode === 'ghost') {
        if (!eraser.checked && this.style.backgroundColor !== 'black') {
            this.classList.add('light-animation');
            setTimeout(() => {
                this.classList.remove('light-animation');
            }, 2000)
        } else if (eraser.checked && this.style.backgroundColor !== 'white') {
            this.classList.add('dark-animation');
            setTimeout(() => {
                this.classList.remove('dark-animation');
            }, 2000)
        }
    }
    // Shades mode
    else if (activeMode === 'shades') {
        const h = shadeColor;
        const s = 100;
        let l = Math.floor(Math.random() * (100 + 1));

        if (l < 10) {
            l += 10;
        } else if (l > 90) {
            l -= 10;
        }

        if (eraser.checked) {
            this.style.cssText = 'background-color: white;';
        } else if (!overlay.checked && this.style.backgroundColor === 'white') {
            this.style.cssText = `background-color: hsl(${h},${s}%,${l}%);`;
        } else if (overlay.checked) {
            this.style.cssText = `background-color: hsl(${h},${s}%,${l}%);`;
        }
    }
    // Picture mode
    else if (activeMode === 'picture') {
        this.style.cssText = `opacity: 0;`;
    }

    timesPassed += 1;
    this.dataset.passed = String(timesPassed);
}

// CLEAR GRID
// ========================================================

const clearButton = document.querySelector('.clear');
clearButton.addEventListener('click', clearGrid)

function clearGrid() {
    if (activeMode !== 'picture') {
        grid.style.backgroundImage = 'none';
        gridTiles.forEach((tile) => {
            tile.style.cssText = 'background-color: transparent; opacity: 1;';
        });
    } else {
        grid.style.backgroundImage = 'none';
        grid.style.backgroundImage = 'url("https://source.unsplash.com/random")';
        gridTiles.forEach((tile) => {
            tile.style.cssText = 'background-color: transparent; opacity: 1;';
        });
    }
}

// INITIATORS & SETTINGS
// ========================================================

const copyYear = document.querySelector('.year');
const currentYear = new Date().getFullYear();
copyYear.textContent = " " + currentYear + " ";

// Mouse/touch tracking
let mouseDown = false;
let touchEnabled = "ontouchstart" in document.documentElement;

window.addEventListener('mousedown', ()=> {
    mouseDown = true;
})
window.addEventListener('mouseup', ()=> {
    mouseDown = false;
})
window.addEventListener('touchstart', ()=> {
    mouseDown = true;
})
window.addEventListener('touchend', ()=> {
    mouseDown = false;
})

// Grid
const grid = document.querySelector('.grid');
const gridTiles = [];

// Grid Color
const sessionGridColor = sessionStorage.getItem('lastGridColor');
let gridColor = (sessionGridColor !== null) ? sessionGridColor : '#ffffff';
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
const sessionMode = sessionStorage.getItem('lastMode');
let activeMode = (sessionMode !== null) ? sessionMode : 'classic';
const activeModeButton = document.querySelector(`[data-mode="${activeMode}"]`);

// Mode Buttons
const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));
modeButtons.forEach(modeButton => modeButton.addEventListener('click', function() {
    setActiveMode(this, this.dataset.mode);
}));

// Sketch Options
const sketchOptions = Array.from(document.querySelectorAll('.main-option > input'));
sketchOptions.forEach((sketchOption, index) => {

    sketchOption.addEventListener('change', ()=> {
        if (sketchOption.checked) {
            const currentIndex = index;

            sketchOptions.forEach((sketchOption, index) => {
                if (index !== currentIndex) {
                    sketchOption.checked = false;
                }
            });
        }
    })
});

const eraser = document.querySelector('#eraser');
const shade = document.querySelector('#shade');
const tint = document.querySelector('#tint');
const overlay = document.querySelector('#overlay');

const penColor = document.querySelector('#pen-color');
const penColorValue = document.querySelector('#pen-color-value');
let shadeColor = hexToHSL(penColor.value,'h');
penColorValue.textContent = penColor.value;
penColor.addEventListener('input', () => {
    penColorValue.textContent = penColor.value;
    shadeColor = hexToHSL(penColor.value,'h');
});

// Ghost Mode Animation
let ghostAnim = [
    { backgroundColor: gridColor },
    { backgroundColor: 'black' },
    { backgroundColor: gridColor }
];

const ghostAnimDuration = {
    duration: 1000,
    iterations: 1,
}


// GENERATE GRID FUNCTION
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

    gridTiles.length = 0;

    for (let i = 0; i < size * size; i++) {
        gridTiles.push(document.createElement('div'));
    }
    gridTiles.forEach((tile) => {
        tile.classList.add('tile');
        tile.addEventListener(!touchEnabled ? 'mouseover' : 'touchmove', sketch);
        tile.addEventListener(!touchEnabled ? 'mousedown' : 'touchstart', sketch);
        tile.style.backgroundColor = gridColor;
        grid.appendChild(tile);
    });

    if (activeMode === 'picture') {
        grid.style.backgroundImage = 'none';
        grid.style.backgroundImage = 'url("https://picsum.photos/960")';
    }

    ghostAnim = [
        { backgroundColor: gridColor },
        { backgroundColor: 'black' },
        { backgroundColor: gridColor }
    ];
}

generateGrid(gridSize.value);
setActiveMode(activeModeButton, activeMode);

// CLEAR GRID FUNCTION
// ========================================================

const clearButton = document.querySelector('.clear');
clearButton.addEventListener('click', clearGrid)

function clearGrid() {
    if (activeMode !== 'picture') {
        grid.style.backgroundImage = 'none';
        gridTiles.forEach((tile) => {
            tile.style.backgroundColor = gridColor;
        });
    } else {
        grid.style.backgroundImage = 'none';
        grid.style.backgroundImage = 'url("https://picsum.photos/960")';
        gridTiles.forEach((tile) => {
            tile.style.backgroundColor = gridColor;
        });
    }
}

// SET MODE FUNCTION
// ========================================================

function setActiveMode(button, mode) {
    activeMode = '';
    clearGrid();

    modeButtons.forEach(modeButton => {
        modeButton.disabled = false;
    });
    button.disabled = true;

    disableSketchOptions();

    // Classic mode
    if (mode === 'classic') {
        activeMode = 'classic';
        eraser.disabled = false;
        shade.disabled = false;
        tint.disabled = false;
    }
    // Color mode
    else if (mode === 'color') {
        activeMode = 'color';
        enableSketchOptions();
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
        penColor.disabled = false;
    }
    // Picture mode
    else if (mode === 'picture') {
        activeMode = 'picture';
        grid.style.backgroundImage = 'url("https://picsum.photos/960")';
    }

    sessionStorage.setItem('lastMode', activeMode);
}

// SKETCH FUNCTION
// ========================================================

function sketch(e) {

    if (e.type === 'mouseover' && !mouseDown && !touchEnabled) {
        return
    }

    if (e.type === 'touchmove' && !mouseDown && touchEnabled) {
        return
    }

    // Tile attributes
    const currentColor = this.style.backgroundColor;

    // Classic mode
    if (activeMode === 'classic') {
        if (eraser.checked) {
            this.style.backgroundColor = gridColor;
        } else if (shade.checked) {
            const currentColor = getRGB(this.style.backgroundColor);
            this.style.backgroundColor = shadeRGB(currentColor);
        } else if (tint.checked) {
            const currentColor = getRGB(this.style.backgroundColor);
            this.style.backgroundColor = tintRGB(currentColor);
        } else {
            this.style.backgroundColor = 'rgb(0, 0, 0)';
        }
    }
    // Color mode
    else if (activeMode === 'color') {
        if (eraser.checked) {
            this.style.backgroundColor = gridColor;
        } else if (!overlay.checked && !shade.checked && !tint.checked &&
            currentColor === hexToRGB(gridColor)) {
            this.style.backgroundColor = penColor.value;
        } else if (shade.checked) {
            const currentColor = getRGB(this.style.backgroundColor);
            this.style.backgroundColor = shadeRGB(currentColor);
        } else if (tint.checked) {
            const currentColor = getRGB(this.style.backgroundColor);
            this.style.backgroundColor = tintRGB(currentColor);
        } else if (overlay.checked) {
            this.style.backgroundColor = penColor.value;
        }
    }
    // Rainbow mode
    else if (activeMode === 'rainbow') {
        const randomColor = randomRGB();
        if (eraser.checked) {
            this.style.backgroundColor = gridColor;
        } else if (!overlay.checked && currentColor === hexToRGB(gridColor)) {
            this.style.backgroundColor = randomColor;
        } else if (overlay.checked) {
            this.style.backgroundColor = randomColor;
        }
    }
    // Ghost mode
    else if (activeMode === 'ghost') {
        this.animate(ghostAnim, ghostAnimDuration);
    }
    // Shades mode
    else if (activeMode === 'shades') {
        const s = 100;
        let l = Math.floor(Math.random() * (100 + 1));

        if (l < 10) {
            l += 10;
        } else if (l > 90) {
            l -= 10;
        }

        if (eraser.checked) {
            this.style.backgroundColor = gridColor;
        } else if (!overlay.checked && currentColor === hexToRGB(gridColor)) {
            this.style.backgroundColor = `hsl(${shadeColor},${s}%,${l}%)`;
        } else if (overlay.checked) {
            this.style.backgroundColor = `hsl(${shadeColor},${s}%,${l}%)`;
        }
    }
    // Picture mode
    else if (activeMode === 'picture') {
        this.style.backgroundColor = `transparent`;
    }
}

// HELPER FUNCTIONS
// ========================================================

function disableSketchOptions() {
    sketchOptions.forEach(sketchOption => {
        sketchOption.disabled = true;
        sketchOption.checked = false;
    });
    penColor.disabled = true;
}

function enableSketchOptions() {
    sketchOptions.forEach(sketchOption => {
        sketchOption.disabled = false;
        sketchOption.checked = false;
    });
    penColor.disabled = false;
}

function hexToRGB(h) { // https://css-tricks.com/converting-color-spaces-in-javascript/
    let r = 0, g = 0, b = 0;

    if (h.length === 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];
    } else if (h.length === 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    return "rgb("+ +r + ", " + +g + ", " + +b + ")";
}

function hexToHSL(hex,part) { // https://css-tricks.com/converting-color-spaces-in-javascript/
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }

    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta === 0)
        h = 0;
    else if (cmax === r)
        h = ((g - b) / delta) % 6;
    else if (cmax === g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    if (part === 'h') {
        return h;
    } else if (part === 's') {
        return s;
    } else if (part === 'l') {
        return l;
    } else {
        return "hsl(" + h + "," + s + "%," + l + "%)";
    }

}

function getRGB(str) {
    return str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
}

function shadeRGB(rgb) {
    const factor = 1/4;
    let r = parseInt(rgb[1]), g = parseInt(rgb[2]), b = parseInt(rgb[3]);

    r -= (r * factor);
    g -= (g * factor);
    b -= (b * factor);

    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}

function tintRGB(rgb) {
    const factor = 1/4;
    let r = parseInt(rgb[1]), g = parseInt(rgb[2]), b = parseInt(rgb[3]);

    r += ((255 - r) * factor);
    g += ((255 - g) * factor);
    b += ((255 - b) * factor);

    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}

function randomRGB() {
    return `rgb(${Math.floor(Math.random() * (255 + 1))}, 
    ${Math.floor(Math.random() * (255 + 1))}, 
    ${Math.floor(Math.random() * (255 + 1))})`;
}
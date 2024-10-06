document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const colorPicker = document.getElementById('colorPicker');
    const clearButton = document.getElementById('clearButton');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const exportButton = document.getElementById('exportButton');
    const gridSizeSelect = document.getElementById('gridSize');

    let isDarkMode = false;
    let pixelSize = parseInt(gridSizeSelect.value);

    const exportWithGridButton = document.getElementById('exportWithGridButton');
    const exportWithoutGridButton = document.getElementById('exportWithoutGridButton');

    function createGrid() {
        canvas.innerHTML = '';
        canvas.style.gridTemplateColumns = `repeat(${pixelSize}, 1fr)`;
        
        const pixelDimension = Math.floor(543 / pixelSize) - 1;
        canvas.style.width = `${pixelSize * (pixelDimension + 1) - 1}px`;
        canvas.style.height = `${pixelSize * (pixelDimension + 1) - 1}px`;

        for (let i = 0; i < pixelSize * pixelSize; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            pixel.style.width = `${pixelDimension}px`;
            pixel.style.height = `${pixelDimension}px`;
            canvas.appendChild(pixel);
        }

        updateColors();
    }

    createGrid();

    // Add click event listener to the canvas
    canvas.addEventListener('click', (e) => {
        if (e.target.classList.contains('pixel')) {
            const currentColor = e.target.style.backgroundColor;
            if (isDefaultColor(currentColor)) {
                e.target.style.backgroundColor = colorPicker.value;
            } else {
                e.target.style.backgroundColor = getDefaultColor();
            }
        }
    });

    // Add mouseover event listener for drag drawing
    let isDrawing = false;
    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);
    canvas.addEventListener('mouseover', (e) => {
        if (isDrawing && e.target.classList.contains('pixel')) {
            const currentColor = e.target.style.backgroundColor;
            if (isDefaultColor(currentColor)) {
                e.target.style.backgroundColor = colorPicker.value;
            } else {
                e.target.style.backgroundColor = getDefaultColor();
            }
        }
    });

    // Clear canvas functionality
    clearButton.addEventListener('click', () => {
        document.querySelectorAll('.pixel').forEach(pixel => {
            pixel.style.backgroundColor = isDarkMode ? '#444' : 'white';
        });
    });

    // Dark mode toggle functionality
    darkModeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode');
        updateColors();
    });

    // Grid size change functionality
    gridSizeSelect.addEventListener('change', (e) => {
        pixelSize = parseInt(e.target.value);
        createGrid();
    });

    // Export as PNG functionality
    function exportAsPNG(withGrid) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const pixelSize = 16;
        const gridSize = parseInt(document.getElementById('gridSize').value);
        const canvasSize = gridSize * pixelSize;

        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // Draw pixels
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach((pixel, index) => {
            const x = (index % gridSize) * pixelSize;
            const y = Math.floor(index / gridSize) * pixelSize;
            ctx.fillStyle = pixel.style.backgroundColor || 'white';
            ctx.fillRect(x, y, pixelSize, pixelSize);
        });

        // Draw grid if withGrid is true
        if (withGrid) {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            for (let i = 1; i < gridSize; i++) {
                const pos = i * pixelSize;
                ctx.beginPath();
                ctx.moveTo(pos, 0);
                ctx.lineTo(pos, canvasSize);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, pos);
                ctx.lineTo(canvasSize, pos);
                ctx.stroke();
            }
        }

        // Create download link
        const link = document.createElement('a');
        link.download = `pixel_art_${withGrid ? 'with' : 'without'}_grid.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    // Event listeners for export buttons
    exportWithGridButton.addEventListener('click', () => exportAsPNG(true));
    exportWithoutGridButton.addEventListener('click', () => exportAsPNG(false));

    function updateColors() {
        canvas.style.backgroundColor = isDarkMode ? '#666' : '#ccc';
        document.querySelectorAll('.pixel').forEach(pixel => {
            if (isDefaultColor(pixel.style.backgroundColor)) {
                pixel.style.backgroundColor = getDefaultColor();
            }
        });
    }

    function isDefaultColor(color) {
        return !color || color === 'white' || color === 'rgb(255, 255, 255)' ||
               color === '#444' || color === 'rgb(68, 68, 68)';
    }

    function getDefaultColor() {
        return isDarkMode ? '#444' : 'white';
    }
});
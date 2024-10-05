document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const colorPicker = document.getElementById('colorPicker');
    const clearButton = document.getElementById('clearButton');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const exportButton = document.getElementById('exportButton');
    const gridSizeSelect = document.getElementById('gridSize');

    let isDarkMode = false;
    let pixelSize = parseInt(gridSizeSelect.value);

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
            e.target.style.backgroundColor = colorPicker.value;
        }
    });

    // Add mouseover event listener for drag drawing
    let isDrawing = false;
    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseover', (e) => {
        if (isDrawing && e.target.classList.contains('pixel')) {
            e.target.style.backgroundColor = colorPicker.value;
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
    exportButton.addEventListener('click', () => {
        const tempCanvas = document.createElement('canvas');
        const pixelDimension = Math.floor(543 / pixelSize) - 1;
        tempCanvas.width = pixelSize * (pixelDimension + 1) - 1;
        tempCanvas.height = pixelSize * (pixelDimension + 1) - 1;
        const ctx = tempCanvas.getContext('2d');

        // Draw grid
        ctx.fillStyle = isDarkMode ? '#666' : '#ccc';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        document.querySelectorAll('.pixel').forEach((pixel, index) => {
            const x = (index % pixelSize) * (pixelDimension + 1);
            const y = Math.floor(index / pixelSize) * (pixelDimension + 1);
            ctx.fillStyle = pixel.style.backgroundColor || (isDarkMode ? '#444' : 'white');
            ctx.fillRect(x, y, pixelDimension, pixelDimension);
        });

        const link = document.createElement('a');
        link.download = 'pixel_art.png';
        link.href = tempCanvas.toDataURL();
        link.click();
    });

    function updateColors() {
        canvas.style.backgroundColor = isDarkMode ? '#666' : '#ccc';
        document.querySelectorAll('.pixel').forEach(pixel => {
            if (!pixel.style.backgroundColor || 
                pixel.style.backgroundColor === 'white' || 
                pixel.style.backgroundColor === 'rgb(255, 255, 255)' ||
                pixel.style.backgroundColor === '#444' ||
                pixel.style.backgroundColor === 'rgb(68, 68, 68)') {
                pixel.style.backgroundColor = isDarkMode ? '#444' : 'white';
            }
        });
    }
});
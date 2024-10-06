document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const colorPicker = document.getElementById('colorPicker');
    const clearButton = document.getElementById('clearButton');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const gridSizeSelect = document.getElementById('gridSize');
    const exportWithGridButton = document.getElementById('exportWithGridButton');
    const exportWithoutGridButton = document.getElementById('exportWithoutGridButton');
    const imageUpload = document.getElementById('imageUpload');
    const convertImageButton = document.getElementById('convertImageButton');

    let isDarkMode = false;
    let pixelSize = parseInt(gridSizeSelect.value);

    function createGrid(width = pixelSize, height = pixelSize) {
        canvas.innerHTML = ''; // Clear the existing grid
        canvas.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        
        const maxDimension = 543;
        const pixelDimension = Math.max(1, Math.floor(maxDimension / Math.max(width, height)) - 1);
        canvas.style.width = `${width * (pixelDimension + 1) - 1}px`;
        canvas.style.height = `${height * (pixelDimension + 1) - 1}px`;

        const gridColor = isDarkMode ? '#555' : '#ccc';
        canvas.style.backgroundColor = gridColor;

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < width * height; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            pixel.style.width = `${pixelDimension}px`;
            pixel.style.height = `${pixelDimension}px`;
            pixel.style.backgroundColor = getDefaultColor();
            fragment.appendChild(pixel);
        }
        canvas.appendChild(fragment);
    }

    createGrid();

    function isDefaultColor(color) {
        return !color || color === 'white' || color === 'rgb(255, 255, 255)' ||
               color === '#444' || color === 'rgb(68, 68, 68)';
    }

    function getDefaultColor() {
        return isDarkMode ? '#444' : 'white';
    }

    function togglePixelColor(pixel) {
        const currentColor = pixel.style.backgroundColor;
        if (isDefaultColor(currentColor)) {
            pixel.style.backgroundColor = colorPicker.value;
        } else {
            pixel.style.backgroundColor = getDefaultColor();
        }
    }

    // Click event listener for the canvas
    canvas.addEventListener('click', (e) => {
        if (e.target.classList.contains('pixel')) {
            togglePixelColor(e.target);
        }
    });

    // Mouseover event listener for drag drawing
    let isDrawing = false;
    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);
    canvas.addEventListener('mouseover', (e) => {
        if (isDrawing && e.target.classList.contains('pixel')) {
            togglePixelColor(e.target);
        }
    });

    // Clear canvas functionality
    clearButton.addEventListener('click', () => {
        document.querySelectorAll('.pixel').forEach(pixel => {
            pixel.style.backgroundColor = getDefaultColor();
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
        createGrid(pixelSize, pixelSize);
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
            ctx.fillStyle = pixel.style.backgroundColor || getDefaultColor();
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
        const gridColor = isDarkMode ? '#555' : '#ccc';
        canvas.style.backgroundColor = gridColor;
        document.querySelectorAll('.pixel').forEach(pixel => {
            if (isDefaultColor(pixel.style.backgroundColor)) {
                pixel.style.backgroundColor = getDefaultColor();
            }
        });
    }

    convertImageButton.addEventListener('click', convertUploadedImage);

    function convertUploadedImage() {
        const file = imageUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const maxSize = 64; // Maximum grid size
                    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                    const scaledWidth = Math.floor(img.width * scale);
                    const scaledHeight = Math.floor(img.height * scale);

                    // Update grid size to match scaled image dimensions exactly
                    pixelSize = Math.max(scaledWidth, scaledHeight);
                    gridSizeSelect.value = pixelSize > 64 ? 64 : pixelSize; // Ensure it's a valid option

                    // Recreate the grid with the new size
                    createGrid(scaledWidth, scaledHeight);

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = scaledWidth;
                    canvas.height = scaledHeight;
                    
                    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                    const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
                    
                    const pixels = document.querySelectorAll('.pixel');
                    pixels.forEach((pixel, index) => {
                        const x = index % scaledWidth;
                        const y = Math.floor(index / scaledWidth);
                        const dataIndex = (y * scaledWidth + x) * 4;
                        const r = imageData.data[dataIndex];
                        const g = imageData.data[dataIndex + 1];
                        const b = imageData.data[dataIndex + 2];
                        const color = `rgb(${r},${g},${b})`;
                        pixel.style.backgroundColor = color;
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
});
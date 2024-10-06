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
    const brightnessSlider = document.getElementById('brightnessSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const hueSlider = document.getElementById('hueSlider');
    const hueValue = document.getElementById('hueValue');
    const saturationSlider = document.getElementById('saturationSlider');
    const saturationValue = document.getElementById('saturationValue');
    const toggleAdjustmentsButton = document.getElementById('toggleAdjustments');
    const imageAdjustments = document.querySelector('.image-adjustments');
    const imageAdjustmentsContainer = document.querySelector('.image-adjustments-container');

    let isDarkMode = false;
    let pixelSize = parseInt(gridSizeSelect.value);
    let originalImageData = null;
    let brightness = 0;
    let hue = 0;
    let saturation = 0;

    // Hide image adjustments container initially
    imageAdjustmentsContainer.style.display = 'none';

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
        const selectedColor = colorPicker.value;
        
        if (!pixel.dataset.originalColor) {
            pixel.dataset.originalColor = currentColor;
        }

        if (pixel.dataset.modified === 'true' && currentColor !== pixel.dataset.originalColor) {
            // If the pixel was modified, revert to the original color with brightness applied
            const [r, g, b] = pixel.dataset.originalColor.match(/\d+/g).map(Number);
            const adjustedColor = adjustColor(r, g, b, brightness, hue, saturation);
            pixel.style.backgroundColor = `rgb(${adjustedColor.join(',')})`;
            pixel.dataset.modified = 'false';
        } else {
            // Change to the selected color
            pixel.style.backgroundColor = selectedColor;
            pixel.dataset.modified = 'true';
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
    function resetCanvas() {
        originalImageData = null;
        pixelSize = parseInt(gridSizeSelect.value);
        createGrid(pixelSize, pixelSize);
        imageUpload.value = ''; // Clear the file input
        brightnessSlider.value = 0;
        hueSlider.value = 0;
        saturationSlider.value = 0;
        brightnessValue.textContent = 0;
        hueValue.textContent = 0;
        saturationValue.textContent = 0;
        brightness = 0;
        hue = 0;
        saturation = 0;

        // Hide image adjustments container when canvas is reset
        imageAdjustmentsContainer.style.display = 'none';
        imageAdjustments.classList.add('hidden');
        toggleAdjustmentsButton.textContent = 'Show Image Adjustments';
    }

    clearButton.addEventListener('click', resetCanvas);

    // Dark mode toggle functionality
    darkModeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode');
        updateColors();
    });

    // Modify the grid size change functionality
    gridSizeSelect.addEventListener('change', (e) => {
        pixelSize = parseInt(e.target.value);
        if (originalImageData) {
            resizeAndDrawImage(originalImageData, pixelSize, pixelSize);
        } else {
            createGrid(pixelSize, pixelSize);
        }
    });

    // Export as PNG functionality
    function exportAsPNG(withGrid) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const gridSize = parseInt(document.getElementById('gridSize').value);
        const pixelSize = Math.max(1, Math.floor(543 / gridSize));
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
        link.download = `pixel_art_${gridSize}x${gridSize}_${withGrid ? 'with' : 'without'}_grid.png`;
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
            const validTypes = ['image/png', 'image/webp', 'image/jpeg'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a PNG, WebP, or JPEG image.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    originalImageData = {
                        width: img.width,
                        height: img.height,
                        data: e.target.result
                    };
                    resizeAndDrawImage(originalImageData, pixelSize, pixelSize);
                    
                    // Show image adjustments container when an image is uploaded
                    imageAdjustmentsContainer.style.display = 'block';
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function resizeAndDrawImage(imageData, gridWidth, gridHeight) {
        const img = new Image();
        img.onload = function() {
            const aspectRatio = img.width / img.height;
            let scaledWidth, scaledHeight;

            if (aspectRatio > 1) {
                scaledWidth = gridWidth;
                scaledHeight = Math.floor(gridWidth / aspectRatio);
            } else {
                scaledHeight = gridHeight;
                scaledWidth = Math.floor(gridHeight * aspectRatio);
            }

            createGrid(scaledWidth, scaledHeight);

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = scaledWidth;
            tempCanvas.height = scaledHeight;
            
            tempCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
            const scaledImageData = tempCtx.getImageData(0, 0, scaledWidth, scaledHeight);
            
            const pixels = document.querySelectorAll('.pixel');
            pixels.forEach((pixel, index) => {
                const x = index % scaledWidth;
                const y = Math.floor(index / scaledWidth);
                const dataIndex = (y * scaledWidth + x) * 4;
                const r = scaledImageData.data[dataIndex];
                const g = scaledImageData.data[dataIndex + 1];
                const b = scaledImageData.data[dataIndex + 2];
                const color = `rgb(${r}, ${g}, ${b})`;
                pixel.style.backgroundColor = color;
                pixel.dataset.originalColor = color; // Store the original color
                pixel.dataset.modified = 'false'; // Initialize as unmodified
            });

            applyAdjustments(); // Apply current brightness after drawing the image
        };
        img.src = imageData.data;
    }

    brightnessSlider.addEventListener('input', updateAdjustments);
    hueSlider.addEventListener('input', updateAdjustments);
    saturationSlider.addEventListener('input', updateAdjustments);

    function updateAdjustments() {
        brightness = parseInt(brightnessSlider.value);
        hue = parseInt(hueSlider.value);
        saturation = parseInt(saturationSlider.value);
        
        brightnessValue.textContent = brightness;
        hueValue.textContent = hue;
        saturationValue.textContent = saturation;
        
        applyAdjustments();
    }

    function applyAdjustments() {
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach(pixel => {
            const originalColor = pixel.dataset.originalColor || pixel.style.backgroundColor;
            const [r, g, b] = originalColor.match(/\d+/g).map(Number);
            const adjustedColor = adjustColor(r, g, b, brightness, hue, saturation);
            pixel.style.backgroundColor = `rgb(${adjustedColor.join(',')})`;
        });
    }

    function adjustColor(r, g, b, brightness, hue, saturation) {
        // Convert RGB to HSL
        let [h, s, l] = rgbToHsl(r, g, b);
        
        // Apply hue adjustment
        h = (h + hue) % 360;
        
        // Apply saturation adjustment
        s = Math.max(0, Math.min(100, s + saturation));
        
        // Apply brightness adjustment
        l = Math.max(0, Math.min(100, l + brightness / 2));
        
        // Convert back to RGB
        const [newR, newG, newB] = hslToRgb(h, s, l);
        return [newR, newG, newB];
    }

    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    }

    function hslToRgb(h, s, l) {
        h /= 360, s /= 100, l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    toggleAdjustmentsButton.addEventListener('click', () => {
        imageAdjustments.classList.toggle('hidden');
        toggleAdjustmentsButton.textContent = imageAdjustments.classList.contains('hidden') 
            ? 'Show Image Adjustments' 
            : 'Hide Image Adjustments';
    });

    // Replace the event listeners for reset buttons with this:
    document.querySelectorAll('.reset-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const sliderType = e.target.dataset.slider;
            resetSlider(sliderType);
        });
    });

    function resetSlider(sliderType) {
        let slider, valueSpan;
        switch (sliderType) {
            case 'brightness':
                slider = brightnessSlider;
                valueSpan = brightnessValue;
                break;
            case 'hue':
                slider = hueSlider;
                valueSpan = hueValue;
                break;
            case 'saturation':
                slider = saturationSlider;
                valueSpan = saturationValue;
                break;
        }

        if (slider && valueSpan) {
            slider.value = slider.defaultValue;
            valueSpan.textContent = slider.defaultValue;
            updateAdjustments();
        }
    }
});
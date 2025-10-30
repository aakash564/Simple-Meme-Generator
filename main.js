const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const imageUpload = document.getElementById('imageUpload');
const downloadButton = document.getElementById('downloadMeme');

let image = new Image();
const MAX_CANVAS_WIDTH = 500; // Limit size for preview

// --- Drawing Functions ---

/**
 * Draws text onto the canvas in classic meme style (Impact font, white fill, black stroke).
 * @param {string} text - The caption text.
 * @param {number} x - Center X coordinate.
 * @param {number} y - Approximate Y coordinate (top margin for top text, bottom baseline for bottom text).
 * @param {number} maxWidth - Maximum width for the text line.
 * @param {boolean} isTop - True if text is positioned at the top.
 */
function drawText(text, x, y, maxWidth, isTop = true) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;

    const lines = text.toUpperCase().split('\n');
    
    // Determine font size based on canvas height for responsiveness
    let fontSize = Math.floor(canvas.height / 8); 
    if (fontSize < 20) fontSize = 20;

    ctx.font = `${fontSize}px Impact, sans-serif`;
    
    const lineHeight = fontSize * 1.1;

    lines.forEach((line, index) => {
        let lineY;
        
        if (isTop) {
            // Start Y is based on the top margin (y parameter)
            // Subsequent lines move down
            lineY = y + index * lineHeight; 
        } else {
            // Start Y is based on the bottom baseline (y parameter)
            // Subsequent lines move UP (since we draw the last line first conceptually)
            lineY = y - (lines.length - 1 - index) * lineHeight; 
        }
        
        ctx.strokeText(line, x, lineY, maxWidth);
        ctx.fillText(line, x, lineY, maxWidth);
    });
}

function renderMeme() {
    // Ensure canvas dimensions are set before drawing
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    let imageDrawn = false;

    // 1. Draw Image
    if (image.complete && image.naturalWidth !== 0) {
        // Calculate dimensions to fit image within the canvas while maintaining aspect ratio
        const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight);
        
        const w = image.naturalWidth * ratio;
        const h = image.naturalHeight * ratio;
        
        const x = (width - w) / 2;
        const y = (height - h) / 2;

        ctx.drawImage(image, x, y, w, h);
        imageDrawn = true;
    } 
    
    if (!imageDrawn) {
        // Fallback or placeholder rendering
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#666';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Load an image to start', width / 2, height / 2);
    }

    // 2. Draw Text
    const topText = topTextInput.value;
    const bottomText = bottomTextInput.value;
    const centerX = width / 2;
    const textMargin = 10; 
    
    // Top Text: Y is slightly offset from the top edge (acts as the starting baseline for the first line)
    // We approximate the initial baseline position based on font size calculation (using 1/10th of height as a starting point)
    drawText(topText, centerX, textMargin + (height / 12), width - 20, true);

    // Bottom Text: Y is set near the bottom edge (acts as the baseline for the last line)
    drawText(bottomText, centerX, height - textMargin, width - 20, false);
}

// --- Utility & Event Handlers ---

function setupCanvasSize(img) {
    let targetWidth, targetHeight;

    if (img.naturalWidth === 0) {
        // Default size if no image or image failed to load
        targetWidth = 500;
        targetHeight = 400;
    } else {
        // Calculate proportional size based on MAX_CANVAS_WIDTH for screen display
        if (img.naturalWidth > MAX_CANVAS_WIDTH) {
            targetWidth = MAX_CANVAS_WIDTH;
            targetHeight = (img.naturalHeight / img.naturalWidth) * MAX_CANVAS_WIDTH;
        } else {
            targetWidth = img.naturalWidth;
            targetHeight = img.naturalHeight;
        }
    }
    
    // Ensure dimensions are positive integers
    canvas.width = Math.max(100, Math.round(targetWidth));
    canvas.height = Math.max(100, Math.round(targetHeight));
}

// Input listener for live update
topTextInput.addEventListener('input', renderMeme);
bottomTextInput.addEventListener('input', renderMeme);

// Image loading logic
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            image.onload = () => {
                setupCanvasSize(image);
                renderMeme();
            };
            image.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Initial setup: Load placeholder image
function loadPlaceholder() {
    image.onload = () => {
        setupCanvasSize(image);
        renderMeme();
    };
    image.onerror = () => {
        console.error("Failed to load placeholder image.");
        setupCanvasSize(image); 
        renderMeme();
    };
    image.src = 'placeholder_meme.png';
}

// Download functionality
downloadButton.addEventListener('click', () => {
    // Re-render to ensure current inputs are captured
    renderMeme(); 
    
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'generated_meme.png';
    // Must append to body, click, and remove quickly for download to work cross-browser
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Initial load
loadPlaceholder();


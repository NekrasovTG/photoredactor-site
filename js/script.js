
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
let originalImage = null;
let currentImage = null;
let currentRotation = 0;
let isFlippedH = false;
let isFlippedV = false;

fileInput.addEventListener('change', loadImage);
document.getElementById('reset').addEventListener('click', resetImage);

function loadImage(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
        originalImage = new Image();
        originalImage.onload = () => {
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
            currentImage = originalImage;
            applyFilters();
            document.querySelector('.placeholder').style.display = 'none';
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function applyFilters() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const brightness = document.getElementById('brightness').value;
    const contrast = document.getElementById('contrast').value;
    const saturate = document.getElementById('saturate').value;
    const blur = document.getElementById('blur').value;

    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(currentRotation * Math.PI / 180);
    ctx.scale(isFlippedH ? -1 : 1, isFlippedV ? -1 : 1);
    ctx.translate(-canvas.width/2, -canvas.height/2);

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) blur(${blur}px)`;
    ctx.drawImage(currentImage, 0, 0);
    ctx.restore();
}

document.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', applyFilters);
});

document.getElementById('rotateLeft').addEventListener('click', () => {
    currentRotation = (currentRotation - 90) % 360;
    applyFilters();
});

document.getElementById('rotateRight').addEventListener('click', () => {
    currentRotation = (currentRotation + 90) % 360;
    applyFilters();
});

document.getElementById('flipHorizontal').addEventListener('click', () => {
    isFlippedH = !isFlippedH;
    applyFilters();
});

document.getElementById('flipVertical').addEventListener('click', () => {
    isFlippedV = !isFlippedV;
    applyFilters();
});

document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        switch(filter) {
            case 'normal':
                resetFilters();
                break;
            case 'grayscale':
                applyPresetFilter('grayscale(100%)');
                break;
            case 'sepia':
                applyPresetFilter('sepia(100%)');
                break;
            case 'vintage':
                applyPresetFilter('sepia(50%) contrast(85%) brightness(90%)');
                break;
            case 'warm':
                applyPresetFilter('saturate(150%) hue-rotate(30deg)');
                break;
            case 'cold':
                applyPresetFilter('saturate(140%) hue-rotate(-30deg)');
                break;
        }
    });
});

function applyPresetFilter(filterString) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = filterString;
    ctx.drawImage(currentImage, 0, 0);
}

function resetFilters() {
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.value = input.defaultValue;
    });
    applyFilters();
}

document.getElementById('resizeImage').addEventListener('click', () => {
    const width = parseInt(document.getElementById('widthInput').value);
    const height = parseInt(document.getElementById('heightInput').value);
    
    if (width && height) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempCanvas.getContext('2d').drawImage(canvas, 0, 0, width, height);
        
        canvas.width = width;
        canvas.height = height;
        currentImage = tempCanvas;
        applyFilters();
    }
});

document.getElementById('save').addEventListener('click', () => {
    const format = document.getElementById('saveFormat').value;
    const quality = parseFloat(document.getElementById('quality').value);
    
    const link = document.createElement('a');
    link.download = `edited-image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, quality);
    link.click();
});

function resetImage() {
    if (originalImage) {
        currentImage = originalImage;
        currentRotation = 0;
        isFlippedH = false;
        isFlippedV = false;
        resetFilters();
    }
}

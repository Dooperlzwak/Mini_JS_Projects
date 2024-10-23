// Get references to DOM elements
const colorPreview = document.getElementById('colorPreview');
const hexCode = document.getElementById('hexCode');
const rgbCode = document.getElementById('rgbCode');
const colorBar = document.getElementById('colorBar');
const sliderHandle = document.getElementById('sliderHandle');
const darknessBar = document.getElementById('darknessBar');
const darknessHandle = document.getElementById('darknessHandle');
const lightnessBar = document.getElementById('lightnessBar');
const lightnessHandle = document.getElementById('lightnessHandle');

// Initialize hue, darkness, and lightness values
let hue = 0;
let darkness = 0; // 0% darkness (no black added)
let lightness = 0; // 0% lightness (no white added)

// Function to update the color preview and codes
function updateColor() {
    const h = hue;
    const s = 100; // Saturation is fixed at 100%

    // Calculate base color in RGB
    const baseRgb = hslToRgb(h / 360, s / 100, 0.5);

    // Apply darkness (mix with black)
    const darkRgb = {
        r: Math.round(baseRgb.r * (1 - darkness)),
        g: Math.round(baseRgb.g * (1 - darkness)),
        b: Math.round(baseRgb.b * (1 - darkness))
    };

    // Apply lightness (mix with white)
    const finalRgb = {
        r: Math.round(darkRgb.r + (255 - darkRgb.r) * lightness),
        g: Math.round(darkRgb.g + (255 - darkRgb.g) * lightness),
        b: Math.round(darkRgb.b + (255 - darkRgb.b) * lightness)
    };

    // Update the color preview
    const rgbString = `rgb(${finalRgb.r}, ${finalRgb.g}, ${finalRgb.b})`;
    colorPreview.style.backgroundColor = rgbString;

    // Update the HEX and RGB codes
    rgbCode.textContent = rgbString;
    const hexString = rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);
    hexCode.textContent = hexString;

    // Update the slider handle positions
    const rect = colorBar.getBoundingClientRect();
    const x = (h / 360) * rect.width;
    sliderHandle.style.left = `${x - sliderHandle.offsetWidth / 2}px`;

    const dRect = darknessBar.getBoundingClientRect();
    const dX = darkness * dRect.width;
    darknessHandle.style.left = `${dX - darknessHandle.offsetWidth / 2}px`;

    const lRect = lightnessBar.getBoundingClientRect();
    const lX = lightness * lRect.width;
    lightnessHandle.style.left = `${lX - lightnessHandle.offsetWidth / 2}px`;

    // Update the gradients of the darkness and lightness bars
    const pureHueColor = `hsl(${h}, 100%, 50%)`;
    darknessBar.style.background = `linear-gradient(to right, ${pureHueColor}, black)`;
    lightnessBar.style.background = `linear-gradient(to right, ${pureHueColor}, white)`;
}

// Function to handle hue changes
function updateHue(event) {
    const rect = colorBar.getBoundingClientRect();
    let x = event.clientX - rect.left;

    // Clamp x within the color bar width
    x = Math.max(0, Math.min(x, rect.width));

    // Update the slider handle position
    sliderHandle.style.left = `${x - sliderHandle.offsetWidth / 2}px`;

    // Calculate hue based on position
    hue = (x / rect.width) * 360;

    updateColor();
}

// Event listeners for hue selection
colorBar.addEventListener('mousedown', function(event) {
    updateHue(event);

    function onMouseMove(e) {
        updateHue(e);
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Function to handle darkness changes
function updateDarkness(event) {
    const rect = darknessBar.getBoundingClientRect();
    let x = event.clientX - rect.left;

    // Clamp x within the darkness bar width
    x = Math.max(0, Math.min(x, rect.width));

    // Update the darkness handle position
    darknessHandle.style.left = `${x - darknessHandle.offsetWidth / 2}px`;

    // Calculate darkness based on position
    darkness = x / rect.width;

    updateColor();
}

// Event listeners for darkness selection
darknessBar.addEventListener('mousedown', function(event) {
    updateDarkness(event);

    function onMouseMove(e) {
        updateDarkness(e);
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Function to handle lightness changes
function updateLightness(event) {
    const rect = lightnessBar.getBoundingClientRect();
    let x = event.clientX - rect.left;

    // Clamp x within the lightness bar width
    x = Math.max(0, Math.min(x, rect.width));

    // Update the lightness handle position
    lightnessHandle.style.left = `${x - lightnessHandle.offsetWidth / 2}px`;

    // Calculate lightness based on position
    lightness = x / rect.width;

    updateColor();
}

// Event listeners for lightness selection
lightnessBar.addEventListener('mousedown', function(event) {
    updateLightness(event);

    function onMouseMove(e) {
        updateLightness(e);
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Initialize the color picker
updateColor();

// Helper function to convert HSL to RGB
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l * 255; // Achromatic
    } else {
        const hue2rgb = function(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3) * 255;
        g = hue2rgb(p, q, h) * 255;
        b = hue2rgb(p, q, h - 1/3) * 255;
    }

    return { r, g, b };
}

// Helper function to convert RGB to HEX
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1).toUpperCase();
}

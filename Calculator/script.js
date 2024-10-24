function appendToDisplay(value) {
    const display = document.getElementById('display');
    display.value += value;
}

function appendFunction(func) {
    const display = document.getElementById('display');
    let value = display.value;

    switch (func) {
        case 'square':
            if (value !== '') {
                display.value += '^2';
            }
            break;
        case 'inverse':
            if (value !== '') {
                display.value = '1/(' + value + ')';
            }
            break;
        case 'sqrt':
            display.value += '√(';
            break;
        case 'tenPower':
            display.value += '10^';
            break;
    }
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function deleteLast() {
    const display = document.getElementById('display');
    display.value = display.value.slice(0, -1);
}

function toggleSign() {
    const display = document.getElementById('display');
    if (display.value.charAt(0) === '-') {
        display.value = display.value.substr(1);
    } else if (display.value !== '') {
        display.value = '-' + display.value;
    }
}

function calculateResult() {
    const display = document.getElementById('display');
    let expression = display.value;

    try {
        // Replace constants
        expression = expression.replace(/π/g, Math.PI);
        expression = expression.replace(/e/g, Math.E);

        // Replace functions
        expression = expression.replace(/√\(/g, 'Math.sqrt(');

        // Replace exponents (e.g., 2^3)
        expression = expression.replace(/(\d+(\.\d+)?|\([^\)]+\))\^(\d+(\.\d+)?|\([^\)]+\))/g, 'Math.pow($1,$3)');

        // Evaluate the expression
        let result = eval(expression);

        // Fix floating point precision issues
        result = parseFloat(result.toPrecision(12));

        display.value = result;
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            clearDisplay();
        }, 1500);
    }
}

/* Settings Menu Functions */
function toggleMenu() {
    const menu = document.getElementById('settingsMenu');
    menu.classList.toggle('open');
}

function changeButtonHue(hue) {
    // Convert hue to HSL color
    const operatorColor = `hsl(${hue}, 100%, 50%)`;
    const operatorHoverColor = `hsl(${hue}, 100%, 65%)`;

    document.documentElement.style.setProperty('--operator-btn-bg', operatorColor);
    document.documentElement.style.setProperty('--operator-btn-hover-bg', operatorHoverColor);

    // Update the hex input value
    const hexColor = hslToHex(hue, 100, 50);
    document.getElementById('hexInput').value = hexColor;
}

function changeButtonHex(hex) {
    // Convert hex to HSL
    const hsl = hexToHSL(hex);

    if (hsl) {
        const { h, s, l } = hsl;
        const operatorColor = `hsl(${h}, ${s}%, ${l}%)`;
        const operatorHoverColor = `hsl(${h}, ${s}%, ${Math.min(l + 15, 100)}%)`;

        document.documentElement.style.setProperty('--operator-btn-bg', operatorColor);
        document.documentElement.style.setProperty('--operator-btn-hover-bg', operatorHoverColor);

        // Update the hue slider value
        document.getElementById('hueSlider').value = h;
    } else {
        alert('Invalid Hex Code');
    }
}

function toggleTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}

/* Utility Functions */
function hslToHex(h, s, l) {
    l /= 100;
    s /= 100;

    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };

    return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(H) {
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    } else {
        return null;
    }
    r /= 255;
    g /= 255;
    b /= 255;

    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;

    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
}

/* Initialize Values */
window.onload = function() {
    // Set initial hex input value
    const hue = document.getElementById('hueSlider').value;
    const hexColor = hslToHex(hue, 100, 50);
    document.getElementById('hexInput').value = hexColor;
};
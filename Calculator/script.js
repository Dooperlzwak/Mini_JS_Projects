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

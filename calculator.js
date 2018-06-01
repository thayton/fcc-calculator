'use strict';

const MAX_PRECISION = 2;
const MAX_DIGITS_SCREEN_TOP = 11;
const MAX_DIGITS_SCREEN_BOTTOM = 22;

class TooManyDigitsError extends Error {}

const State = {
    INIT: 0, DIGIT: 1, OP: 2, RESULT: 3
};

var isOp = (op) => {
    return [ '+', '-', '*', '%' ].indexOf(op) !== -1;
};

var doOp = (x, op, y) => {
    switch (op) {
    case '+':
        x += y;
        break;
        
    case '-':
        x -= y;  
        break;
        
    case '*':
        x *= y;
        break;
        
    case '%':
        x /= y;  
        break;
    }

    return x;
};

class Calculator {
    constructor (screenTopId, keypadId, screenBottomId) {
        this.state = State.INIT;
        this.screenTop = document.getElementById(screenTopId);
        this.screenBottom = document.getElementById(screenBottomId);
        this.keypad = document.getElementById(keypadId);
        this.entry = '0';
        this.equation = [];
    }

    allClear() {
        this.state = State.INIT;    
        this.screenTop.innerText = '0';

        this.equation = [];
        this.displayEquation();
    }

    clearEntry() {
        if (this.state === State.RESULT) {
            this.allClear();
        } else {
            this.equation.pop();
            
            // If we clear all of the equation we start back over
            // at the initial state. Otherwise, the last part of
            // the equation determines what state we're in now
            if (this.equation.length === 0) {
                this.screenTop.innerText = '0';                 
                this.state = State.INIT;
            } else {
                let i = this.equation.length - 1;
                let last = this.equation[i];
                
                this.screenTop.innerText = last;
                this.state = isOp(last) ? State.OP : State.DIGIT;
            }
        
            this.displayEquation();  
        }
    }

    // User entered too many digits to fit on calculator screen
    // or the result is too large to fit on calculator screen
    digitLimitMet() {
        this.screenTop.innerText = '0';
        this.screenBottom.innerText = 'Digit Limit Met';        
        this.equation = [];    
        this.state = State.INIT;
    }

    displayEquation() {
        let txt = '';
        
        if (this.equation.length === 0) {
            txt = '0';
        } else {
            for (var i = 0; i < this.equation.length; i++) {
                txt += this.equation[i];
            }
        }

        if (txt.length > MAX_DIGITS_SCREEN_BOTTOM) {
            throw new TooManyDigitsError();
        } else {
            this.screenBottom.innerText = txt;
        }
    }

    equationAppendToLast(x) {
        if (this.equation.length === 0) {
            this.equation[0] = x;
        } else {
            var n = this.equation.length - 1;
            this.equation[n] += x;
        }
    }

    handleOp(op) {
        if (this.state === State.DIGIT || this.state === State.RESULT) {
            this.state = State.OP;       
            this.screenTop.innerText = op;
            this.equation.push(op);   
            this.displayEquation();
        }
    }

    computeResult() {
        let result;
        let lastOp;

        result = parseFloat(this.equation[0]);

        /* reduce */
        for (var i = 1; i < this.equation.length; i++) {
            if (isOp(this.equation[i])) {
                lastOp = this.equation[i];
            } else {
                result = doOp(result, lastOp, parseFloat(this.equation[i]));
            }
        }

        result = parseFloat(result.toPrecision(MAX_PRECISION));
        return result;
    }
    
    handleEq() {
        let result;

        if (this.state !== State.DIGIT) {
            return;
        }
    
        result = this.computeResult();
        
        if (result.toString().length > MAX_DIGITS_SCREEN_TOP) {
            this.digitLimitMet();
            return;
        }

        this.screenTop.innerText = result;
    
        this.equation.push('=')
        this.equation.push(result);

        try {
            this.displayEquation();
        } catch (e) {
            if (e instanceof TooManyDigitsError) {
                this.tooManyDigits();
                return;
            }
        }
        
        this.equation = [ result ];
        this.state = State.RESULT;
    }

    /* number or '.' */
    handleDigit(txt) {
        if (this.state !== State.DIGIT) {
            // Prevent divide by zero       
            if (this.state === State.OP && txt === '0') {
                n = this.equation.length - 1;
                if (this.equation[n] === '%') {
                    return;
                }
            }
            
            this.screenTop.innerText = txt;

            // If user enters a digit from the RESULT state
            // then we assume they're starting a new calculation
            // and overwrite the existing one.
            if (this.state === State.RESULT) {
                this.equation = [ txt ];                
            } else { 
                this.equation.push(txt);
            }
        } else {
            if (txt === '.' && this.screenTop.innerText.indexOf('.') !== -1) {
                // Can't have multiple decimal points 
                return;
            }

            if (txt === '0' && this.screenTop.innerText === '0') {
                // Don't display multiple zeros */
                return;
            }

            if (this.screenTop.innerText.length === MAX_DIGITS_SCREEN_TOP) {
                this.digitLimitMet();
                return;
            }

            if (txt !== '0' && this.screenTop.innerText === '0') {
                // If they enter '0' followed by non-zero number
                // we replace '0' with the non-zero number
                this.screenTop.innerText = txt;
                this.equation[this.equation.length - 1] = txt;
            } else {
                this.screenTop.innerText += txt;
                this.equationAppendToLast(txt);
            }
        }

        try {
            this.displayEquation();
        } catch (e) {
            if (e instanceof TooManyDigitsError) {
                this.digitLimitMet();
                return;
            }
        }
        
        this.state = State.DIGIT;    
    }
}

const calculator = new Calculator('screen-top', 'keypad', 'screen-bottom');

keypad.onclick = function(event) {
    let txt = event.target.innerText;
    let num = parseInt(txt);
    
    if (Number.isNaN(num) && txt !== '.') {
        if (isOp(txt)) {
            calculator.handleOp(txt);
        } else if (txt === 'AC') {
            calculator.allClear();
        } else if (txt === 'CE') {
            calculator.clearEntry();
        } else if (txt === '=') {
            calculator.handleEq();
        }
    } else {
        calculator.handleDigit(txt);
    }
};

window.addEventListener('keydown', function(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    
    switch (event.key) {
    case '0': case '1': case '2': case '3': case '4':
    case '5': case '6': case '7': case '8': case '9':
    case '.':
        calculator.handleDigit(event.key);
        break;
        
    case '+': case '-': case '*': case '%':
        calculator.handleOp(event.key);
        break;

    case '=': case 'Enter':
        calculator.handleEq('=');
        break;

    case 'Clear': case 'Backspace':
        calculator.clearEntry();
        break;
        
    default:
        return; // Quit when this doesn't handle the key event.
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);
// the last option dispatches the event to the listener first,
// then dispatches event to window

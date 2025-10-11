import React, { useRef } from "react";
import { NumericFormat } from "react-number-format";
import './IncreaseDecreaseButtons.css';

export default function IncreaseDecreaseButtons({
    value,                 // number | null: current numeric value stored in parent state
    onChange,              // function(newNumberOrNull) called when value changes
    step,                  // increment/decrement step
    min,                   // optional lower clamp
    max,                   // optional upper clamp
    decimalScale,          // digits after decimal to allow/display
    allowNegative = false, // allow negative values
    ariaLabel = "numeric-input",
}) {
    // current numeric value (NaN if empty)
    // Number.isFinite is used to detect valid numbers and avoid treating 0 as falsy. NaN signals “no valid number”.
    const currentValue = Number.isFinite(value) ? value : NaN; 

    // Ref to hold interval ID for continuous increment/decrement on button hold
    const holdInterval = useRef(null);

    //Clamps n to [min, max] and uses toFixed(decimalScale) then parseFloat to normalize rounding
    const clampAndRound = (n) => {
        if (!Number.isFinite(n)) return null;
        if (Number.isFinite(min) && n < min) n = min;
        if (Number.isFinite(max) && n > max) n = max;
        return parseFloat(Number(n).toFixed(decimalScale));
    };

    // Increase button function
    const handleIncrement = () => {
        onChange(prev => {
            const base = Number.isFinite(prev) ? prev : 0;
            const newValue = clampAndRound(base + step);
            return Number.isFinite(newValue) ? newValue : null;
        });
    };

    // Decrease button function
    const handleDecrement = () => {
        onChange(prev => {
            const base = Number.isFinite(prev) ? prev : 0;
            const newValue = clampAndRound(base - step);
            return Number.isFinite(newValue) ? newValue : null;
        });
    };

    // Hold to repeat functionality
    const startHold = (actionFn) => {
        actionFn(); // do first action immediately
        holdInterval.current = setInterval(actionFn, 120); // then repeat every 120ms
    };

    const stopHold = () => {
        if (holdInterval.current) {
            clearInterval(holdInterval.current);
            holdInterval.current = null;
        }
    };

    // Disable buttons if at min/max
    const disableDecrement = Number.isFinite(currentValue) && Number.isFinite(min) ? currentValue <= min : false;
    const disableIncrement = Number.isFinite(currentValue) && Number.isFinite(max) ? currentValue >= max : false;

    return (
        <div className="increase-decrease-buttons">

            <NumericFormat
                value={Number.isFinite(currentValue) ? currentValue : ""}
                decimalSeparator="."
                thousandSeparator={false}
                allowNegative={allowNegative}
                decimalScale={decimalScale}
                fixedDecimalScale={false}
                onValueChange={(vals) => onChange(vals.floatValue) !== undefined ? vals.floatValue : null}
                aria-label={ariaLabel}
                className="numeric-input"
            />

            <div className="button-group">
                <button 
                    type= "button"
                    aria-label = "increment"
                    className="button"
                    onMouseDown={() => startHold(handleIncrement)}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    disabled = {disableIncrement}
                >
                    ▲
                </button>

                <button 
                    type= "button"
                    aria-label = "decrement"
                    className="button"
                    onMouseDown={() => startHold(handleDecrement)}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    disabled = {disableDecrement}
                >
                    ▼
                </button>
            </div>
        </div>
    );
}


import React, { useState, useEffect, useRef } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest function.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export default useInterval;

/******************
 * Example below
*******************/

function Counter() {
    const [count, setCount] = useState(0);
    const [delay, setDelay] = useState(1000);
    const [isRunning, setIsRunning] = useState(true);

    useInterval(() => {
        // Your custom logic here
        setCount(count + 1);
    }, isRunning ? delay : null);

    function handleDelayChange(e) {
        setDelay(Number(e.target.value));
    }

    function handleIsRunningChange(e) {
        setIsRunning(e.target.checked);
    }

    return (
        <>
            <h1>{count}</h1>
            <input type="checkbox" checked={isRunning} onChange={handleIsRunningChange} /> Running
      <br />
            <input value={delay} onChange={handleDelayChange} />
        </>
    );
}
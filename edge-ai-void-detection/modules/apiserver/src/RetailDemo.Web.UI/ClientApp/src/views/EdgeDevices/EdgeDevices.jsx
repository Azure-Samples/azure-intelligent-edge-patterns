import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

import { TextField, DefaultButton, classNamesFunction } from "office-ui-fabric-react";
import { styled } from "@uifabric/utilities";

// Import sub-components

// Import the components styles
import { getStyles } from "./EdgeDevices.styles.jsx";

// function to create classNames for each element with the need of a className
const getClassNames = classNamesFunction();

// Process the styles to create the components classNmes
const EdgeDevices = styled(
    EdgeDevicesBase,
    getStyles,
    undefined,
    {
        scope: "EdgeDevices"
    }
);

function EdgeDevicesBase(props) {
    const { className, styles, theme } = props;

    const classNames = getClassNames(styles, { theme, className }); // after className add any other props from IComponentStyleProps example disabled, etc
    const { subComponentStyles } = classNames;

    let endPointUrl = "";
    // Hooks
    //const [styles, setStyles] = useState();

    // Handlers
    const handleUrlOnChange = (value) => {
        endPointUrl = value.target.value;
    }

    const handleSaveOnClick = () => {
        localStorage.setItem("endpointUrl", endPointUrl);
    }

    return (
        <div className={classNames.root}>
            <h2 className={classNames.title}>Edge Devices</h2>
            <br />
            <div className={classNames.edgedevicesContainer}>
                <TextField
                    onChange={(e) => handleUrlOnChange(e)}
                    label="Endpoint Url"
                />
                <br />
                <DefaultButton
                    data-automation-id="test"
                    text="Save"
                    onClick={() => handleSaveOnClick()}
                />
            </div>
        </div>
    );
}

EdgeDevicesBase.propTypes = {
    className: PropTypes.string
};

export default EdgeDevices;
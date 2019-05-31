import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

import { getTheme, classNamesFunction } from "office-ui-fabric-react";
import { styled } from "@uifabric/utilities";

// Import sub-components

// Import the components styles
import { getStyles } from "./Footer.styles.jsx";

// function to create classNames for each element with the need of a className
const getClassNames = classNamesFunction();

// Process the styles to create the components classNmes
const Footer = styled(
    FooterBase,
    getStyles,
    undefined,
    {
        scope: "Footer"
    }
);

function FooterBase(props) {
    const { className, styles, theme } = props;

    const classNames = getClassNames(styles, { theme, className }); // after className add any other props from IComponentStyleProps example disabled, etc
    const { subComponentStyles } = classNames;

    // Hooks
    //const [styles, setStyles] = useState();

    // Handlers

    return (
        <div className={classNames.root}>
            <div className={classNames.contentContainer}>
            </div>
        </div>
    );
}

FooterBase.propTypes = {
    className: PropTypes.string
};

export default Footer;
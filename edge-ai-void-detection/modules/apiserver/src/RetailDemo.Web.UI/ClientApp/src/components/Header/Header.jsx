import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

import { Icon, classNamesFunction } from "office-ui-fabric-react";
import { styled } from "@uifabric/utilities";

// Import sub-components

// Import the components styles
import { getStyles } from "./Header.styles.jsx";

// function to create classNames for each element with the need of a className
const getClassNames = classNamesFunction();

// Process the styles to create the components classNmes
const Footer = styled(
    HeaderBase,
    getStyles,
    undefined,
    {
        scope: "Header"
    }
);

function HeaderBase(props) {
    const { title, className, styles, theme } = props;

    const classNames = getClassNames(styles, { theme, className }); // after className add any other props from IComponentStyleProps example disabled, etc
    const { subComponentStyles } = classNames;

    // Hooks
    //const [styles, setStyles] = useState();

    // Handlers

    return (
        <div className={classNames.root}>
            <Icon iconName="Waffle" styles={subComponentStyles.icons} />
            <div className={classNames.title}>
                {title}
            </div>
        </div>
    );
}

HeaderBase.propTypes = {
    className: PropTypes.string
};

export default Footer;
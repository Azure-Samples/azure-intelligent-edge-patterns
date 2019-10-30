import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

// Components styles
import { getStyles } from "./Layout.styles.jsx";


/**
 * The component props. (IComponentProps) Add here any props needed by the component props, for exmple disabled, etc.
 */
export const LayoutProps = props => {
    console.log("LayoutProps==========>: ", props); //TODO: remove
    return {
        test: "LayoutProps1"
    };
}

/**
 * The getStyles props contract. (IComponentStyleProps) Here we add the stylings for the component
 */
export const LayoutStyleProps = props => {
    console.log("LayoutStylesProps==========>: ", props); //TODO: remove
    return {
        testb: "LayoutStyleProps2"
    };
}

/**
 * The styles produced by getStyles. (IComponentStyles)
 */
export const LayoutStyles = props => getStyles(props);

//LayoutProps.propTypes = {
//    theme: PropTypes.array,

//};

//export default LayoutProps;


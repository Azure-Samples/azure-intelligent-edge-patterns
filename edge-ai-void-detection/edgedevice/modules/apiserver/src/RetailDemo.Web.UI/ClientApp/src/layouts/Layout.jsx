import React from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

import { getTheme } from "office-ui-fabric-react";
import { styled } from "@uifabric/utilities";

// Import the base component
import { LayoutBase } from "./Layout.base.jsx";

// Import the components styles
import { getStyles } from "./Layout.styles.jsx";

/**
* Layout component defines a UI layout that renders components.
*/
export const Layout = styled(
    LayoutBase,
    getStyles,
    undefined,
    {
        scope: "Layout"
    }
);

//Layout.propTypes = {
//    theme: PropTypes.array,

//};
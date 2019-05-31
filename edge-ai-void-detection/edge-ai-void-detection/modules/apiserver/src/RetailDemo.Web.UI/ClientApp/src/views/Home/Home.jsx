import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

import { getTheme, classNamesFunction } from "office-ui-fabric-react";
import { styled } from "@uifabric/utilities";

import { apiUrl } from '../../app/App.settings.jsx';

// Import sub-components

// Import the components styles
import { getStyles } from "./Home.styles.jsx";

// function to create classNames for each element with the need of a className
const getClassNames = classNamesFunction();

// Process the styles to create the components classNmes
const Home = styled(
    HomeBase,
    getStyles,
    undefined,
    {
        scope: "Home"
    }
);

function HomeBase(props) {
    const { className, styles, theme } = props;

    const classNames = getClassNames(styles, { theme, className }); // after className add any other props from IComponentStyleProps example disabled, etc
    const { subComponentStyles } = classNames;

    const hostUrl = apiUrl;

    // Hooks
    //const [styles, setStyles] = useState();

    // Handlers

    return (
        <div className={classNames.root}>
            <div className={classNames.contentContainer}>
                <h1>Retail Stock Demo</h1>
                <p>Welcome to the Data Box Edge Retail Stock Demo</p>
                <br /><br />
                <p>Current host url: https://{hostUrl}</p>
            </div>
        </div>
    );
}

HomeBase.propTypes = {
    className: PropTypes.string
};

export default Home;
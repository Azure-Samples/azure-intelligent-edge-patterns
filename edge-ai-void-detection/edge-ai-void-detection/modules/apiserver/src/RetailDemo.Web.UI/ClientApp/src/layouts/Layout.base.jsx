import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";
import { Route, Switch } from "react-router-dom";

import { Fabric, classNamesFunction } from "office-ui-fabric-react";
//import { withResponsiveMode } from "office-ui-fabric-react/lib/Utilities/decorators/withResponsiveMode";
import PerfectScrollbar from "react-perfect-scrollbar";

// Sub-components
import Header from "../components/Header/Header.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Footer from "../components/Footer/Footer.jsx";

// routes
import layoutRoutes from "../routes/layoutRoutes.jsx";

//import "react-perfect-scrollbar/dist/css/styles.css"; // TODO: Move into plugins in SASS or .style.jsx

// Import theme overrides
import themeData from "../variables/themeData.jsx";

// function to create classNames for each element with the need of a className
const getClassNames = classNamesFunction();

export const LayoutBase = (props) => {
    const { className, styles, theme } = props;

    //loadTheme(themeData); TODO: To customize OOB theme

    const classNames = getClassNames(styles, { theme, className }); // after className add any other props from IComponentStyleProps example disabled, etc
    const { subComponentStyles } = classNames;

    // Hooks
    //const [styles, setStyles] = useState();

    const getRoutes = routes => {
        return routes.map((prop, key) => {
            // Here we difine any props needed by the component that layout will render
            const dataScope = props.dataScope; //TODO: Get the datascope from the token

            const ComposedComponent = prop.component;

            if (prop.collapse) {
                return getRoutes(prop.views);
            }

            if (prop.layout === "/web") {
                return (
                    <Route
                        path={prop.layout + prop.path}
                        component={prop.component}
                        // Uncomment the code below is props needs to be passed down the stream (and comment the previous line)
                        //render={props => <ComposedComponent {...props} />}
                        key={key}
                    />
                );
            } else {
                return null;
            }
        });
    };

    // Handlers

    return (
        <Fabric className={classNames.root}> {/* dusplacted fabric node see index.js but same happens in official sample app  */}
            <div className={classNames.headerContainer}>
                <Header title="Inventory Control" styles={classNames.subComponentStyles.header} routes={layoutRoutes} />
            </div>
            <div className={classNames.leftNavContainer}>
                <Sidebar routes={layoutRoutes} styles={classNames.subComponentStyles.nav} />
            </div>
            <div className={classNames.content} data-is-scrollable="true">
                <Switch>{getRoutes(layoutRoutes)}</Switch>
                {// we don't want the Footer to be rendered on full screen maps page
                    window.location.pathname.indexOf("full-screen-map") !==
                        -1 ? null : (
                            <Footer fluid />
                        )}
            </div>
        </Fabric>
    );
}

//const LayoutWithResponsiveMode = withResponsiveMode(Layout); TODO: Work in progress not in use may deprecrate given the upcoming changes in v7
//const LayoutWithResponsiveMode = Layout;

LayoutBase.propTypes = {
    className: PropTypes.string
};


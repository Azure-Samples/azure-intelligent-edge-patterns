import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

import { Fabric, Customizer, classNamesFunction, initializeIcons, loadTheme, getTheme } from "office-ui-fabric-react";
import { styled } from "@uifabric/utilities";
import { FluentCustomizations } from "@uifabric/fluent-theme";
import { createBrowserHistory } from "history";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { ClientContextProvider } from "react-fetching-library";

import { client } from "../api/FetchComponents/fetchClient.jsx";

// Import routes
import indexRoutes from "../routes/indexRoutes.jsx";

// Import the components styles
import { getStyles } from "./App.styles.jsx";

const hist = createBrowserHistory();

// Exported style object for UI Fabric component
const getClassNames = classNamesFunction();

function AppBase(props) {
    const { className, styles } = props; // Since this is first order of component we don't expect theme
    const theme = getTheme();

    //const isLargeDown = responsiveMode <= ResponsiveMode.large; TODO: Fix this
    const isLargeDownDefault = false;  //TODO: Temporal till withFluentResponsive declaraor is solved

    initializeIcons(); //Initialize Office UI Fbric icons

    const classNames = getClassNames(styles, { theme, className }); // after className add any other props from IComponentStyleProps example disabled, etc
    const { subComponentStyles } = classNames;

    return (
        <Fabric>
            <Customizer {...FluentCustomizations}>
                <ClientContextProvider client={client}>
                    <Router history={hist}>
                        <Switch>
                            {indexRoutes.map((prop, key) => {
                                if (prop.redirect)
                                    return <Redirect from={prop.path} to={prop.pathTo} key={key} />;
                                const ComposedComponent = prop.component;
                                return <Route path={prop.path} key={"app"} component={props => <ComposedComponent {...props} className={classNames.root} />} />;
                            })}
                        </Switch>
                    </Router>
                </ClientContextProvider>
            </Customizer>
        </Fabric>
    );
}

export const App = styled(
    AppBase,
    getStyles,
    undefined,
    {
        scope: "App"
    }
);

export default App;

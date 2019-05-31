import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

import { Nav, CompoundButton, Icon, css, classNamesFunction } from "office-ui-fabric-react";
import { Link, NavLink, withRouter, history } from "react-router-dom";
import { styled } from "@uifabric/utilities";

// Import sub-components

// Import the components styles
import { getStyles } from "./Sidebar.styles.jsx";

// function to create classNames for each element with the need of a className
const getClassNames = classNamesFunction();

// Process the styles to create the components classNmes
const Sidebar = styled(
    SidebarBase,
    getStyles,
    undefined,
    {
        scope: "Sidebar"
    }
);

function SidebarBase(props) {
    const { className, styles, theme, routes, onLinkClick } = props;

    const classNames = getClassNames(styles, { theme, className }); // after className add any other props from IComponentStyleProps example disabled, etc
    const { subComponentStyles } = classNames;

    // Hooks
    //const [styles, setStyles] = useState();

    const navGroups = [
        {
            "name": "Dashboard",
            "links": [
                {
                    "name": "Edge devices",
                    "key": "edgedevices",
                    "url": "/web/edgedevices"
                },
                {
                    "name": "Monitoring",
                    "key": "monitoring",
                    "url": "/web/monitoring"
                },
                {
                    "name": "Monitoring Slider",
                    "key": "monitoringslider",
                    "url": "/web/monitoringslider"
                }
            ],
        }
    ];

    // Wrapper for Office-UI-Fabric Nav needed to integrate to react-router this is a workaround till fabric UI adds support in NAV for react router
    const FabricNav = withRouter(({ history }) => (
        <Nav
            groups={navGroups}
            onLinkClick={(event, element) => {
                event.preventDefault();
                history.push(element.url);
            }}
            onRenderLink={(link) => onRenderLink(link)}
        />
    ));

    // this creates the intial state of this component based on the collapse routes
    // that it gets through this.props.routes
    const getCollapseStates = routes => {
        let initialState = {};
        routes.map((prop, key) => {
            if (prop.collapse) {
                initialState = {
                    [prop.state]: getCollapseInitialState(prop.views),
                    ...getCollapseStates(prop.views),
                    ...initialState
                };
            }
            return null;
        });
        return initialState;
    };

    // this verifies if any of the collapses should be default opened on a rerender of this component
    // for example, on the refresh of the page,
    // while on the src/views/Something/Something.jsx - route /web/something
    const getCollapseInitialState = routes => {
        for (let i = 0; i < routes.length; i++) {
            if (routes[i].collapse && getCollapseInitialState(routes[i].views)) {
                return true;
            } else if (window.location.pathname.indexOf(routes[i].path) !== -1) {
                return true;
            }
        }
        return false;
    };

    // verifies if routeName is the one active (in browser input)
    const activeRoute = routeName => {
        return window.location.pathname.indexOf(routeName) > -1 ? "active nav-link" : "text-dark nav-link";
    };

    // this function creates the links and collapses that appear in the sidebar (left menu)
    const createNavItems = routes => {
        return routes.map((prop, key) => {
            if (prop.redirect) {
                return null;
            }

            // TODO: Work in progress for collapsable in navbar, need to refactor properly baed on reactstrap
            if (prop.collapse) {
                let st = {};
                st[prop["state"]] = !collapseStates[prop.state];
                return (
                    <li
                        className={getCollapseInitialState(prop.views) ? "active" : ""}
                        key={key}
                    >
                        <a
                            href="#Terawe"
                            data-toggle="collapse"
                            aria-expanded={this.state[prop.state]}
                            onClick={e => {
                                e.preventDefault();
                                setCollapseStates(st);
                            }}
                        >
                            {prop.icon !== undefined ? (
                                <>
                                    <i className={prop.icon} />
                                    <p>
                                        {prop.name}
                                        <b className="caret" />
                                    </p>
                                </>
                            ) : (
                                    <>
                                        <span className="sidebar-mini-icon">{prop.mini}</span>
                                        <span className="sidebar-normal">
                                            {prop.name}
                                            <b className="caret" />
                                        </span>
                                    </>
                                )}
                        </a>
                        <div isOpen={this.state[prop.state]}>
                            tag used to be collapse instead of div
                            <ul className="nav">{this.createLinks(prop.views)}</ul>
                        </div>
                    </li>
                );
            }

            // Don't display routes from a different barComponent
            if ((prop.barComponent !== "NavBar" && prop.barComponent !== "all") || prop.barComponent === "none") {
                return null;
            }

            return (
                <div key={key}>
                    <div to={prop.layout + prop.path} className={activeRoute(prop.layout + prop.path)}>
                        {prop.icon !== undefined ? (
                            <>
                                {prop.name}
                            </>
                        ) : (
                                <>
                                    {prop.name}
                                </>
                            )}
                    </div>
                </div>
            );
        });
    };

    // State hooks
    const [toggleNavbar, setToggleNavbar] = useState(false);
    const [collapseStates, setCollapseStates] = useState(getCollapseStates(routes));

    // Handlers
    const handleLinkClick = (ev, item) => {
        onLinkClick(item);
    };

    const onRenderLink = (link) => {
        const exampleStatus = {
            placeholder: 0,
            started: 1,
            beta: 2,
            release: 3
        };

        // Nav-linkText is a class name from the Fabric nav
        return (
            <>
                <Icon iconName="Waffle" styles={subComponentStyles.icons} />
                <span key={1} className="Nav-linkText">
                    {link.name}
                </span>
                {link.status !== undefined && (
                    <span
                        key={2}
                        className={css(
                            classNames.subComponentStyles.linkFlair,
                            link.status === exampleStatus.started && classNames.subComponentStyles.linkFlairStarted,
                            link.status === exampleStatus.beta && classNames.subComponentStyles.linkFlairBeta,
                            link.status === exampleStatus.release && classNames.subComponentStyles.linkFlairRelease
                        )}
                    >
                        {exampleStatus[link.status]}
                    </span>
                )}
            </>
        );
    };

    const onRenderGroupHeader = (group) => {
        // onRenderGroupHeader={(group) => onRenderGroupHeader(group)}
        return <>{group.name}</>;
    };

    return (
        <FabricNav />
    );
}

SidebarBase.propTypes = {
    className: PropTypes.string
};

export default Sidebar;
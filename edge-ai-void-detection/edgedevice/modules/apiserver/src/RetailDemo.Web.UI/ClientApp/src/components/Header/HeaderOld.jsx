import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";
import { Route, Switch } from "react-router-dom";

import { FocusZone, Icon, IconButton, css, getFocusStyle, classNamesFunction } from "office-ui-fabric-react";

// Sub-components
import TopNav from "components/NavBar/TopNav.jsx";

// Component styles
import { globalClassNames, getStyles } from "assets/jss/components/headerStyles.jsx";

const getClassNames = classNamesFunction();

function Header(props) {
    const { title, styles, isLargeDown } = props;

    const classNames = getClassNames(getStyles, { styles });
    const { subComponentStyles } = classNames;

    // TODO: Fix how styles flow and it is used since TS handles this differently

    return (
        <div className={classNames.root}>
            <Icon iconName="Waffle" styles={subComponentStyles.icons} />
            <div className={classNames.title}>
                {title}
            </div>
        </div>
    );
}

Header.propTypes = {
    name: PropTypes.string
};

export default Header;

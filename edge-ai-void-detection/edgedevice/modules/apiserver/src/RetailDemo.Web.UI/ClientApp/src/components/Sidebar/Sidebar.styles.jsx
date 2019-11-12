import { getFocusStyle, classNamesFunction } from "office-ui-fabric-react";

/**
 * If className is defined in baseclasses then use:
 * const globalClassNames = getGlobalClassNames(GlobalClassNames, theme);
*/
const globalClassNames = {
    root: 'ms-Sidebar',
    title: 'ms-Sidebar-title',
    button: 'ms-Sidebar-button',
    buttons: 'ms-Sidebar-buttons'
};

export const getStyles = props => {
    const { className, styles, theme } = props;

    //const isLargeDown = responsiveMode <= ResponsiveMode.large;
    const isLargeDown = false; // TODO: Implement responsive and this parameter come from that functionality
    // TODO: We need to merge styles (if any) with what's here <- this is under research and current refactoring

    console.log("Sidebar_styles_getStyles theme: ", theme); //TODO: remove
    const commonStyles = {
        display: 'inline-block',
        verticalAlign: 'top',
        color: theme.palette.white,
        borderRadius: 0
    };

    const iconStyles = {
        root: {
            fontSize: 18,
            padding: '0 5px 0 5px'
        }
    };

    return {
        root: [
            {
                height: 50,
                lineHeight: 50,
                padding: isLargeDown ? 0 : '0 20px',
                backgroundColor: '#272630',
                overflow: 'hidden',
                whiteSpace: 'no-wrap',
                userSelect: 'none',
                color: 'white'
            },
            globalClassNames.root
        ],
        title: [
            commonStyles,
            theme.fonts.large,
            {
                lineHeight: 48
            },
            globalClassNames.title
        ],
        button: [
            commonStyles,
            getFocusStyle(theme, 1, 'relative', undefined, theme.palette.themeLight, 'transparent'),
            {
                position: 'relative',
                textDecoration: 'none',
                background: 'none',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0 10px',
                minWidth: 50,
                lineHeight: 50,
                margin: isLargeDown ? 0 : '0 5px',
                textTransform: 'uppercase',
                display: 'inline-block',
                verticalAlign: 'top',
                boxSizing: 'border-box',
                selectors: {
                    '&:hover': {
                        background: isLargeDown ? 'inherit' : theme.palette.themePrimary
                    }
                }
            },
            globalClassNames.button
        ],
        buttons: [
            commonStyles,
            {
                float: 'right'
            },
            globalClassNames.buttons
        ],
        subComponentStyles: {
            icons: iconStyles
        }
    };
};

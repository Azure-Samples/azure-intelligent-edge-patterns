import { getTheme, classNamesFunction } from "office-ui-fabric-react";

/**
 * If className is defined in baseclasses then use:
 * const globalClassNames = getGlobalClassNames(GlobalClassNames, theme);
*/
const globalClassNames = {
    root: "ms-Layout",
    header: "ms-Layout-header",
    leftNav: "ms-Layout-nav",
    content: "ms-Layout-content",
    linkFlair: "Nav-linkFlair",
    linkFlairStarted: "is-state1",
    linkFlairBeta: "is-state2",
    linkFlairRelease: "is-state3"
};

const headerHeight = 50;
const navWidth = 250;

export const getStyles = props => {
    const { className, styles, theme } = props;

    //const isLargeDown = responsiveMode <= ResponsiveMode.large;
    const isLargeDown = false; // TODO: Implement responsive and this parameter come from that functionality
    // TODO: We need to merge styles (if any) with what's here <- this is under research and current refactoring

    return {
        root: [
            {
                selectors: {
                    ':global(body)': {
                        padding: 0,
                        margin: 0,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        minWidth: '100%',
                        minHeight: '100%',
                        '-webkit-tap-highlight-color': 'transparent'
                    }
                }
            },
            globalClassNames.root,
            className
        ],
        headerContainer: [
            {
                position: 'absolute',
                top: 0,
                height: headerHeight,
                left: 0,
                right: 0
            },
            globalClassNames.header
        ],
        leftNavContainer: [
            {
                position: 'absolute',
                left: 0,
                width: navWidth,
                top: headerHeight,
                bottom: 0,
                borderRight: `1px solid ${theme.palette.neutralLight}`,
                background: theme.palette.white,
                boxSizing: 'border-box',
                overflowX: 'hidden',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch'
            },
            globalClassNames.leftNav
        ],
        content: [
            {
                position: 'absolute',
                left: isLargeDown ? 0 : navWidth,
                right: 0,
                top: headerHeight,
                bottom: 0,
                padding: isLargeDown ? 5 : undefined,
                overflowX: 'auto',
                overflowY: 'auto',
                // Helps to enable hardware acceleration and improve painting performance.
                transform: 'translateZ(0)',
                // Helps to enable smooth scrolling on ios devices.
                WebkitOverflowScrolling: 'touch'
            },
            globalClassNames.content
        ],
        subComponentStyles: {
            header: {},
            nav: {
                root: {
                    position: 'absolute',
                    top: 5,
                    left: 15,
                    right: 0,
                    bottom: 0
                }
            },
            navPanel: { root: { top: headerHeight } }
        }
    };
};


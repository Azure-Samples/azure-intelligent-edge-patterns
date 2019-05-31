import { getTheme, classNamesFunction } from "office-ui-fabric-react";

const globalClassNames = {
    root: "ms-App"
};

const getStyles = props => {
    const { className, styles, theme } = props;

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
        subComponentStyles: {
            layout: {
                backgroundColor: '#272630'
            }
        }
    };
};

export { globalClassNames, getStyles };

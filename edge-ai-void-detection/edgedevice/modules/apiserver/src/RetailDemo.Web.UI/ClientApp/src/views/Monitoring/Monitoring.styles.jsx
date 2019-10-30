import { getTheme, classNamesFunction } from "office-ui-fabric-react";

/**
 * If className is defined in baseclasses then use:
 * const globalClassNames = getGlobalClassNames(GlobalClassNames, theme);
*/
const globalClassNames = {
    root: "ms-Monitoring",
    title: "ms-Monitoring-title",
    outOfStockTotalContainer: "ms-Monitoring-outOfStockTotalContainer",
    notificationContainer: "ms-Monitoring-notificationContainer",
    imageFrame: "ms-Monitoring-imageFrame",
    imageBox: "ms-Monitoring-imageFrame-imageBox",
    notificationsSummary: "ms-Monitoring-notificationsSummary",
    notificationsSummaryText: "ms-Monitoring-notificationsSummaryText",
    notificationsButton: "ms-Monitoring-notificationsButton",
    notificationMessage: "ms-Monitoring-notificationMessage"
};

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
        notificationContainer: [
            {
                marginLeft: 20,
                minHeight: 50,
                width: 500
            },
            globalClassNames.notificationContainer
        ],
        imageFrame: [
            {
                minHeight: 630
            },
            globalClassNames.imageFrame
        ],
        imageBox: [
            {
                marginLeft: 20,
                width: 500
            },
            globalClassNames.imageBox
        ],
        title: [
            theme.fonts.xxLarge,
            {
                marginLeft: 20,
                display: 'inline-block'
            },
            globalClassNames.title
        ],
        stack: {
            marginTop: 10
        },
        item: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        outOfStockTotalContainer: [
            theme.fonts.xxLarge,
            {
                marginLeft: 20,
                display: 'inline-block'
            },
            globalClassNames.outOfStockTotalContainer
        ],
        notificationsSummary: [
            {
                marginLeft: 20,
                minHeight: 50,
                width: 500
            },
            globalClassNames.notificationsSummary
        ],
        notificationsSummaryText: [
            {
                width: 480,
                height: 30,
                marginLeft: 20,
                padding: 10,
                backgroundColor: theme.palette.neutralLighter
            },
            globalClassNames.notificationsSummaryText,
            theme.fonts.large
        ],
        notificationsButton: [
            {
                marginLeft: 20
            },
            globalClassNames.notificationsButton
        ],
        notificationMessage: [
            {
                fontSize: 30,
                paddingTop: 5,
                marginLeft: 20,
                display: 'inline-block',
                backgroundColor: theme.palette.neutralLighter
            },
            globalClassNames.notificationMessage
        ],
        subComponentStyles: {}
    };
};

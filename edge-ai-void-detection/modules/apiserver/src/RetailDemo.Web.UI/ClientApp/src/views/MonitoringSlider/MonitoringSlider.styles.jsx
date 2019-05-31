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
    carouselContainer: "ms-Monitoring-carouselContainer",
    carouselOosContainer: "ms-Monitoring-carouselOosContainer",
    imageMessage: "ms-Monitoring-imageMessage",
    notificationsButton: "ms-Monitoring-notificationsButton",
    carouselHead: "ms-Monitoring-carouselHead",
    carouselOosHead: "ms-Monitoring-carouselOosHead"
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
                width: '70%'
            },
            globalClassNames.notificationContainer
        ],
        imageFrame: [
            {
                height: 1230
            },
            globalClassNames.imageFrame
        ],
        carouselContainer: [
            {
                marginLeft: 0,
                padding: 10,
                backgroundColor: '#f3f2f1'
            },
            globalClassNames.carouselContainer
        ],
        carouselOosContainer: [
            {
                marginTop: 20,
                marginLeft: 0,
                padding: 10,
                backgroundColor: '#f3f2f1'
            },
            globalClassNames.carouselOosContainer
        ],
        imageMessage: [
            {
                marginLeft: 0,
                width: 500
            },
            globalClassNames.imageBox
        ],
        imageBox: [
            {
                marginLeft: 0,
                minWidth: 500
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
        notificationsButton: [
            {
                marginLeft: 20
            },
            globalClassNames.notificationsButton
        ],
        outOfStockTotalContainer: [
            {
                fontSize: 40,
                marginLeft: 20,
                display: 'inline-block'
            },
            globalClassNames.outOfStockTotalContainer
        ],
        notificationMessage: [
            {
                fontSize: 30,
                paddingTop: 5,
                marginLeft: 20,
                display: 'inline-block',
                backgroundColor: '#c7e0f4'
            },
            globalClassNames.notificationMessage
        ],
        notificationsSummary: [
            {
                minHeight: 50,
                width: 500
            },
            globalClassNames.notificationsSummary
        ],
        notificationsSummaryText: [
            {
                width: 480,
                minHeight: 30,
                marginLeft: 0,
                padding: 10,
                backgroundColor: '#c7e0f4'
            },
            globalClassNames.notificationsSummaryText,
            theme.fonts.large
        ],
        carouselHead: [
            theme.fonts.xxLarge,
            {
                marginLeft: 20,
                textAlign: 'left'
            },
            globalClassNames.carouselOosHead
        ],
        carouselOosHead: [
            theme.fonts.xxLarge,
            {
                marginLeft: 20,
                marginBottom: 15,
                display: 'inline-block'
            },
            globalClassNames.carouselOosHead
        ],
        subComponentStyles: { }
    };
};

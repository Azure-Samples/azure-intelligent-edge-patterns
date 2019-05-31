import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

import { Image, Stack, StackItem, PrimaryButton, Label, Coachmark, DirectionalHint, TeachingBubbleContent, MessageBar, MessageBarType, classNamesFunction } from "office-ui-fabric-react";
import { styled } from "@uifabric/utilities";
import ItemsCarousel from 'react-items-carousel';

// Hooks components
import useInterval from "../../components/Hooks/useInterval.jsx";

// Import sub-components
import { imageEventsContainer } from '../../api/DataContainers/imageEventsContainer';

// Import the components styles
import { getStyles } from "./MonitoringSlider.styles.jsx";

// function to create classNames for each element with the need of a className
const getClassNames = classNamesFunction();

// Process the styles to create the components classNmes
const MonitoringSlider = styled(
    MonitoringSliderBase,
    getStyles,
    undefined,
    {
        scope: "MonitoringSlider"
    }
);



function MonitoringSliderBase(props) {
    const { className, styles, theme } = props;
    const edgeDevice = "retail-onsite-dbe-edge";

    const classNames = getClassNames(styles, { theme, className }); // after className add any other props from IComponentStyleProps example disabled, etc
    const { subComponentStyles } = classNames;

    // Data handlers
    const { isLoading, imgSrc, capturetime, newOutOfStockItems, isError, reload } = imageEventsContainer(edgeDevice);

    const initFrames = () => {
        return (<img key={0} className={classNames.imageBox} src={"MsBuild2019.jpg"} />)
    }

    // Hooks
    const [isServiceRunning, setIsServiceRunning] = useState(false);
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    const [isServiceNotificationVisible, setIsServiceNotificationVisible] = useState(false);
    const [imageLoadState, setImageLoadState] = useState(2);
    const [imageUrl, setImageUrl] = useState(""); // Set default image
    const [delayService, setDelayService] = useState(500);  // This sets the refresh time for grabbing the image events and get last image
    const [delayNotification, setDelayNotification] = useState(3000);  // This sets the auti-dismiss timer for the notifications
    const [outOfStock, setOutOfStock] = useState({ current: 0, total: 0 });
    const [imageNotification, setImageNotification] = useState(0);
    const [children, setChildren] = useState([]);
    const [childrenOos, setChildrenOss] = useState([]);
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const [activeItemOssIndex, setActiveItemOssIndex] = useState(0);

    // Interval to fetch image events an refresh image
    useInterval(() => {
        if (isServiceRunning) {
            reload();
        }
    }, isServiceRunning ? delayService : null)

    // Timer to auto-dismiss notification for service start/stop
    useInterval(() => {
        if (isServiceNotificationVisible) {
            setIsServiceNotificationVisible(false)
        }
    }, isServiceNotificationVisible ? delayNotification : null)

    // Timer to auto-dismiss notification for image events
    useInterval(() => {
        if (isNotificationVisible) {
            setIsNotificationVisible(false)
        }
    }, isNotificationVisible ? delayNotification : null)

    // Handlers

    const stackTokens = { childrenGap: 5 };

    const getChildren = (imageSrcUrl, key, outOfStockItems, captureTime) => {
        return (
            <div key={key}>
                <div className={classNames.notificationsSummary} style={{ backgroundColor: outOfStockItems > 0 ? '#ffd154' : '#c7e0f4' }}>
                    <div className={classNames.notificationMessage} style={{ backgroundColor: outOfStockItems > 0 ? '#ffd154' : '#c7e0f4' }}>
                        <b>Out of stock: {outOfStockItems}</b>
                    </div>
                </div>
                <img
                    className={classNames.imageBox}
                    src={imageSrcUrl}
                />
                <div className={classNames.notificationsSummaryText}>
                    <b>Captute time: {captureTime.substring(11,23)}</b>
                </div>
            </div>
        );
    }

    const getOssChildren = (imageSrcUrl, key, outOfStockItems, captureTime) => {
        return (
            <div key={key}>
                <div className={classNames.notificationsSummary} style={{ backgroundColor: '#ff0000' }}>
                    <div className={classNames.notificationMessage} style={{ backgroundColor: '#ff0000', color: '#ffffff' }}>
                        <b>Out of stock: {outOfStockItems}</b>
                    </div>
                </div>
                <img
                    className={classNames.imageBox}
                    src={imageSrcUrl}
                />
                <div className={classNames.notificationsSummaryText}>
                    <b>Capture time: {captureTime.substring(11, 23)}</b>
                </div>
            </div>
        );
    }

    //Use Effect handlers
    useEffect(() => {
        if (imageUrl !== imgSrc) {
            setImageUrl(imgSrc);
            if (imgSrc !== "") {
                let nOutofStock = 0;
                if (outOfStock.current !== newOutOfStockItems) {
                    nOutofStock = newOutOfStockItems;
                    setOutOfStock({ current: newOutOfStockItems, total: outOfStock.total + newOutOfStockItems });
                }
                let childrenItems = children;
                let currentActiveIndex = children.length;
                if (childrenItems.length > 6) {
                    childrenItems.shift();
                }
                const newItem = getChildren(imgSrc, currentActiveIndex, outOfStock.current, capturetime);
                childrenItems.push(newItem);
                setChildren(childrenItems);
                setActiveItemIndex(currentActiveIndex);

                if (nOutofStock > 0) {
                    let childrenOssItems = childrenOos;
                    currentActiveIndex = childrenOssItems.length;
                    const newOssItem = getOssChildren(imgSrc, currentActiveIndex, nOutofStock, capturetime);
                    childrenOssItems.push(newOssItem);
                    setChildrenOss(childrenOssItems);
                    setActiveItemOssIndex(currentActiveIndex);
                }
                
                
            }
        }
    }, [imgSrc]);

    useEffect(() => {
        setIsServiceNotificationVisible(!isServiceNotificationVisible);
        setOutOfStock({ current: 0, total: 0 });
        setActiveItemIndex(0);
        setActiveItemOssIndex(0);
        setChildren([]);
        setChildrenOss([]);
    }, [isServiceRunning]);

    useEffect(() => {
        if (isServiceRunning) {
            setImageNotification("There is a problem connecting to the backend, please try again...");
            setIsNotificationVisible(true);
        }
    }, [isError]);

    // Set position of "latest frame" caption
    let alignLatestFrameCaption = 'right';
    if (children.length < 2) alignLatestFrameCaption = 'left';
    if (children.length === 2) alignLatestFrameCaption = 'center';

    return (
        <div className={classNames.root}>
            <Stack horizontal tokens={stackTokens} padding={10} className={classNames.root}>
                <Stack.Item grow={3} className={styles.item}>
                    <h2 className={classNames.title}>Monitoring</h2>
                </Stack.Item>
                <Stack.Item grow align="center" className={styles.item}>
                    <PrimaryButton
                        data-automation-id="test"
                        disabled={false}
                        checked={false}
                        text={isServiceRunning ? "Stop" : "Start"}
                        onClick={() => setIsServiceRunning(!isServiceRunning)}
                        allowDisabledFocus={true}
                    />
                </Stack.Item>
            </Stack>
            <div className={classNames.imageFrame}>
                <div className={classNames.outOfStockTotalContainer}>
                    <b>Total Out of Stock: {outOfStock.total}</b>
                </div>
                <div className={classNames.notificationContainer}>
                    {isNotificationVisible && (
                        <>
                            <MessageBar messageBarType={MessageBarType.error} isMultiline={false} onDismiss={() => setIsNotificationVisible(!isNotificationVisible)} dismissButtonAriaLabel="Close">
                                <b>{imageNotification}</b>
                            </MessageBar>
                        </>
                    )}
                    {isServiceNotificationVisible && (
                        <>
                            <MessageBar messageBarType={MessageBarType.info} isMultiline={false} onDismiss={() => setIsServiceNotificationVisible(!isServiceNotificationVisible)} dismissButtonAriaLabel="Close">
                                {isServiceRunning ? "Image detection service has been started" : "Image detection service has been stopped"}
                            </MessageBar>
                        </>
                    )}
                </div>
                <div className={classNames.carouselContainer}>
                    <div className={classNames.carouselHead} style={{ textAlign: alignLatestFrameCaption }}>
                        <b>Latest frame</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                    <ItemsCarousel
                        // Placeholder configurations
                        //enablePlaceholder={isServiceRunning ? null: true }
                        //numberOfPlaceholderItems={isServiceRunning ? 0 : 3}
                        //minimumPlaceholderTime={isServiceRunning ? 0 : 1}
                        //placeholderItem={< img className={classNames.imageBox} src={"MsBuild2019.jpg"} />}

                        // Carousel configurations
                        numberOfCards={3}
                        gutter={12}
                        showSlither={true}
                        firstAndLastGutter={true}
                        freeScrolling={false}

                        // Active item configurations
                        //requestToChangeActive={this.changeActiveItem}
                        activeItemIndex={activeItemIndex}
                        activePosition={'center'}

                        chevronWidth={24}
                        rightChevron={'>'}
                        leftChevron={'<'}
                        outsideChevron={false}
                    >
                        {children}
                    </ItemsCarousel>
                </div>
                <div className={classNames.carouselOosContainer}>
                    <div className={classNames.carouselOosHead}>
                        Past Out of Stock items
                    </div>
                    <ItemsCarousel
                        // Placeholder configurations
                        //enablePlaceholder={isServiceRunning ? null: true }
                        //numberOfPlaceholderItems={isServiceRunning ? 0 : 3}
                        //minimumPlaceholderTime={isServiceRunning ? 0 : 1}
                        //placeholderItem={< img className={classNames.imageBox} src={"MsBuild2019.jpg"} />}

                        // Carousel configurations
                        numberOfCards={3}
                        gutter={12}
                        showSlither={true}
                        firstAndLastGutter={true}
                        freeScrolling={false}

                        // Active item configurations
                        //requestToChangeActive={this.changeActiveItem}
                        activeItemIndex={activeItemOssIndex}
                        activePosition={'center'}

                        chevronWidth={24}
                        rightChevron={'>'}
                        leftChevron={'<'}
                        outsideChevron={false}
                    >
                        {childrenOos}
                    </ItemsCarousel>
                </div>
            </div>
        </div>
    );
}

MonitoringSliderBase.propTypes = {
    className: PropTypes.string
};

export default MonitoringSlider;
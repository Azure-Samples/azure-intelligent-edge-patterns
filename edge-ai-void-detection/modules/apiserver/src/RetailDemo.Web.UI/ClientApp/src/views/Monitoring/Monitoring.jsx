import React, { useState, useEffect } from "react";

// used for making the prop types of this component
import PropTypes from "prop-types";

import { Image, Stack, StackItem, PrimaryButton, Label, Coachmark, DirectionalHint, TeachingBubbleContent, MessageBar, MessageBarType, classNamesFunction } from "office-ui-fabric-react";
import { styled } from "@uifabric/utilities";

// Hooks components
import useInterval from "../../components/Hooks/useInterval.jsx";

// Import sub-components
import { imageEventsContainer } from '../../api/DataContainers/imageEventsContainer';

// Import the components styles
import { getStyles } from "./Monitoring.styles.jsx";

// function to create classNames for each element with the need of a className
const getClassNames = classNamesFunction();

// Process the styles to create the components classNmes
const Monitoring = styled(
    MonitoringBase,
    getStyles,
    undefined,
    {
        scope: "Monitoring"
    }
);



function MonitoringBase(props) {
    const { className, styles, theme } = props;
    const edgeDevice = "retail-onsite-dbe-edge";

    const classNames = getClassNames(styles, { theme, className }); // after className add any other props from IComponentStyleProps example disabled, etc
    const { subComponentStyles } = classNames;

    // Data handlers
    const { isLoading, imgSrc, newOutOfStockItems, capturetime, isError, reload } = imageEventsContainer(edgeDevice);

    // Hooks
    const [isServiceRunning, setIsServiceRunning] = useState(false);
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    const [isServiceNotificationVisible, setIsServiceNotificationVisible] = useState(false);
    const [imageLoadState, setImageLoadState] = useState(2);
    const [imageUrl, setImageUrl] = useState("MsBuild2019.jpg"); // Set default image
    const [delayService, setDelayService] = useState(250);  // This sets the refresh time for grabbing the image events and get last image
    const [delayNotification, setDelayNotification] = useState(3000);  // This sets the auti-dismiss timer for the notifications
    const [outOfStock, setOutOfStock] = useState({ current: 0, total: 0});
    const [imageNotification, setImageNotification] = useState(0);

    // Interval to fetch image events an refresh image
    useInterval(() => {
        if (isServiceRunning) {
            reload();
            console.log("MonitoringBase PING "); //TODO: remove
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

    //Use Effect handlers
    useEffect(() => {
        if (imageUrl !== imgSrc) {
            setImageUrl(imgSrc);
        }
    }, [imgSrc]);

    useEffect(() => {
        if (newOutOfStockItems !== outOfStock.current) {
            //setImageNotification("Out of stock notification: " + newOutOfStockItems + " more items have been detected as out of stock"); //Uncomment to enable pop notification
            setOutOfStock({ current: newOutOfStockItems, total: outOfStock.total + newOutOfStockItems });
            //setIsNotificationVisible(true); //Uncomment to enable pop notification
        }
    }, [newOutOfStockItems]);

    useEffect(() => {
        setIsServiceNotificationVisible(!isServiceNotificationVisible);
        if (!isServiceNotificationVisible) {
            setImageUrl("MsBuild2019.jpg");
            setOutOfStock({ current: 0, total: 0 });
        }
    }, [isServiceRunning]);

    useEffect(() => {
        if (isServiceRunning) {
            setImageNotification("There is a problem connecting to the backend, please try again...");
            setIsNotificationVisible(true);
        }
    }, [isError]);

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
                <div className={classNames.notificationsSummary} style={{ backgroundColor: outOfStock.current > 0 ? '#ffd154' : '#f3f2f1' }}>
                    <div className={classNames.notificationMessage} style={{ backgroundColor: outOfStock.current > 0 ? '#ffd154' : '#f3f2f1' }}>
                        <b>Total Out of stock: {outOfStock.current}</b>
                    </div>
                </div>
                <img
                    className={classNames.imageBox}
                    src={imageUrl}
                />
                <div className={classNames.notificationsSummaryText}>
                    <b>Capture time: {capturetime.substring(11, 23)}</b>
                </div>
            </div>
        </div>
    );
}

MonitoringBase.propTypes = {
    className: PropTypes.string
};

export default Monitoring;
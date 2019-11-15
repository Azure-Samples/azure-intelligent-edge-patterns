###
### Original code by Adrian Rosebrock, PyImageSearch: https://www.pyimagesearch.com/2018/08/13/opencv-people-counter/
###

from pyimagesearch.centroidtracker import CentroidTracker
from pyimagesearch.trackableobject import TrackableObject
from imutils.video import VideoStream
from imutils.video import FPS
import numpy as np
import imutils
import os, time, logging, enum
import dlib
import cv2

from messaging.iotmessenger import IoTCountMessenger
from utils.direction import *

from detection.detectors import DetectorCV, DetectorOnnx

logging.basicConfig(format='%(asctime)s  %(levelname)-10s %(message)s', datefmt="%Y-%m-%d-%H-%M-%S",
    level=logging.INFO)

def main(args, total=0):

    WIDTH = 300
    HEIGHT = 300

    try:
        # direction going in
        in_direction = MoveDirection(args["direction"].lower())
    except:
        raise ValueError("Only 'up' or 'down', 'left', 'right' directions are supported")

    centroid_idx = get_horiz_vert(in_direction).value
    is_visual = args["visual"]

    # mask used to indicate the "in" direction
    if is_visual:
        mask = np.zeros((HEIGHT,WIDTH,3)).astype('uint8')
        w = WIDTH // 2
        h = HEIGHT // 2

        if in_direction == MoveDirection.LEFT:
            mask[:, :w, 2] = 255
        elif in_direction == MoveDirection.RIGHT:
            mask[:, w:, 2] = 255
        elif in_direction == MoveDirection.DOWN:
            mask[h:, :, 2] = 255
        else:
            mask[:h, :, 2] = 255
    
    # store or ignore the count we receive in the reset request
    store_count = args['set_count']

    if args["debug"]:
        logging.info("Please attach a debugger to port 5680")
        import ptvsd
        ptvsd.enable_attach(('0.0.0.0', 5680))
        ptvsd.wait_for_attach()
        ptvsd.break_into_debugger()

    if args["id"] is None:
        raise ValueError("id must be specified")        

    global running, sess

    # load our serialized model from disk
    logging.info("loading model...")

    detector_type = args["detector"]
    if detector_type == "opencv":
        detector = DetectorCV(args["model"], args["prototxt"],  confidence_thresh=args["confidence"])
    elif detector_type == "onnx":
        detector = DetectorOnnx(args["model"])
    else:
        raise ValueError(f"Unkonwn detector: {args['detector']}. Use 'opencv' or 'onnx'")

    is_rtsp = args["input"] is not None and args["input"].startswith("rtsp://")

    # if a video path was not supplied, grab a reference to the webcam
    logging.info("starting video stream...")
    if not args.get("input", False):
        vs = VideoStream(src=0).start()
        time.sleep(2.0)

    # otherwise, grab a reference to the video file
    else:
        if(not is_rtsp and not os.path.exists(args["input"])):
            raise FileNotFoundError(args["input"])

        vs = cv2.VideoCapture(args["input"])
        if is_rtsp:
            vs.set(cv2.CAP_PROP_BUFFERSIZE, 600)

    # initialize the video writer (we'll instantiate later if need be)
    writer = None

    # initialize the frame dimensions (we'll set them as soon as we read
    # the first frame from the video)
    W = None
    H = None

    # instantiate our centroid tracker, then initialize a list to store
    # each of our dlib correlation trackers, followed by a dictionary to
    # map each unique object ID to a TrackableObject
    centroidTracker = CentroidTracker(maxDisappeared=40, maxDistance=50)
    trackers = []
    trackableObjects = {}

    # initialize the total number of frames processed thus far, along
    # with the total number of objects that have moved either up or down
    totalFrames = 0
    totalDown = total if store_count and (in_direction == MoveDirection.DOWN or in_direction == MoveDirection.RIGHT) else 0
    totalUp = total if store_count and (in_direction == MoveDirection.UP or in_direction == MoveDirection.LEFT) else 0

    # report counts from this camera
    messageEvery = args["report_count"]

    # start the frames per second throughput estimator
    fps = FPS().start()

    # loop over frames from the video stream
    while True:
        # grab the next frame and handle if we are reading from either
        # VideoCapture or VideoStream
        frame = vs.read()
        frame = frame[1] if args.get("input", False) else frame

        # if we are viewing a video and we did not grab a frame then we
        # have reached the end of the video
        if messenger.should_reset() or (args["input"] is not None and frame is None):
            logging.debug("We are DONE!")
            break

        # resize the frame to have a maximum width of 500 pixels (the
        # less data we have, the faster we can process it), then convert
        # the frame from BGR to RGB for dlib
        frame = cv2.resize(frame, (WIDTH, HEIGHT), interpolation=cv2.INTER_LINEAR)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # if the frame dimensions are empty, set them
        if W is None or H is None:
            (H, W) = frame.shape[:2]
            # count the object when it's crossing either mid-height or mid-width
            crossingDimension = get_dir_dimension(in_direction, W, H) // 2

        # if we are supposed to be writing a video to disk, initialize
        # the writer
        if args["output"] is not None and writer is None:
            fourcc = cv2.VideoWriter_fourcc(*"MJPG")
            writer = cv2.VideoWriter(args["output"], fourcc, 30,
                (W, H), True)

        # initialize the current status along with our list of bounding
        # box rectangles returned by either (1) our object detector or
        # (2) the correlation trackers
        status = "Waiting"
        rects = []

        # check to see if we should run a more computationally expensive
        # object detection method to aid our tracker
        if totalFrames % args["skip_frames"] == 0:
            # set the status and initialize our new set of object trackers
            status = "Detecting"
            trackers = []
            detections = detector.detect(frame)

            for startX, startY, endX, endY in detections:
                # construct a dlib rectangle object from the bounding
                # box coordinates and then start the dlib correlation
                # tracker
                cv2.rectangle(frame, (startX, startY), (endX, endY), (255, 0, 0), 2)

                tracker = dlib.correlation_tracker()
                rect = dlib.rectangle(startX, startY, endX, endY)
                tracker.start_track(rgb, rect)

                # add the tracker to our list of trackers so we can
                # utilize it during skip frames
                trackers.append(tracker)

        # otherwise, we should utilize our object *trackers* rather than
        # object *detectors* to obtain a higher frame processing throughput
        else:
            # loop over the trackers
            for tracker in trackers:
                # set the status of our system to be 'tracking' rather
                # than 'waiting' or 'detecting'
                status = "Tracking"
                cv2.rectangle(frame, (startX, startY), (endX, endY), (255, 0, 0), 2)

                # update the tracker and grab the updated position
                tracker.update(rgb)
                pos = tracker.get_position()

                # unpack the position object
                startX = int(pos.left())
                startY = int(pos.top())
                endX = int(pos.right())
                endY = int(pos.bottom())

                # add the bounding box coordinates to the rectangles list
                rects.append((startX, startY, endX, endY))

        # draw a horizontal line in the center of the frame -- once an
        # object crosses this line we will determine whether they were
        # moving 'up' or 'down'
        if is_visual:
            if get_horiz_vert(in_direction) == CountDirection.VERTICAL:
                cv2.line(frame, (0, H // 2), (W, H // 2), (0, 255, 255), 2)
            else:
                cv2.line(frame, (W // 2, 0), (W // 2, H), (0, 255, 255), 2)

        # use the centroid tracker to associate the (1) old object
        # centroids with (2) the newly computed object centroids
        objects = centroidTracker.update(rects)

        # loop over the tracked objects
        for (objectID, centroid) in objects.items():
            # check to see if a trackable object exists for the current
            # object ID
            trackableObject = trackableObjects.get(objectID, None)

            if trackableObject is None:
                trackableObject = TrackableObject(objectID, centroid)

            # otherwise, there is a trackable object so we can utilize it
            # to determine direction
            else:
                # where have we seen it last?
                xy = trackableObject.centroids[-1][centroid_idx]
                # see if we need to count it. 
                # we count iff the centroid crossed the mid-line since its last known position
                direction = get_trigger_count(xy, centroid[centroid_idx], crossingDimension)

                trackableObject.centroids.append(centroid)

                # if the direction is negative (indicating the object
                # is moving up/left) AND the centroid is above the center
                # line, count the object
                if direction < 0:
                    totalUp += 1

                # if the direction is positive (indicating the object
                # is moving down/right) AND the centroid is below the
                # center line, count the object
                elif direction > 0:
                    totalDown += 1

            # store the trackable object in our dictionary
            trackableObjects[objectID] = trackableObject

            # draw both the ID of the object and the centroid of the
            # object on the output frame
            if is_visual:
                text = "ID {}".format(objectID)
                cv2.putText(frame, text, (centroid[0] - 10, centroid[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                cv2.circle(frame, (centroid[0], centroid[1]), 4, (0, 255, 0), -1)

        # up or down counting - based on what we have parameterized
        total = totalDown - totalUp
        if in_direction == MoveDirection.UP or in_direction == MoveDirection.LEFT:
            total = -total

        messenger.update_count(total)

        if totalFrames % messageEvery == 0:
            # messenger has been initialized with resettableCount
            messenger.send_count()

        if is_visual:
            # construct a tuple of information we will be displaying on the
            # frame
            up, down = get_cur_direction_names(in_direction)

            info = [
                (up, totalUp),
                (down, totalDown),
                ("Total", total),
                ("Status", status),
            ]

            # loop over the info tuples and draw them on our frame
            for (i, (k, v)) in enumerate(info):
                text = "{}: {}".format(k, v)
                cv2.putText(frame, text, (10, H - ((i * 20) + 20)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        # check to see if we should write the frame to disk
        if writer is not None:
            writer.write(frame)

        if is_visual:
            img = cv2.addWeighted(frame, 0.8, mask, 0.2, 0)
            # show the output frame
            cv2.imshow("Frame", img)
            key = cv2.waitKey(1) & 0xFF

            # if the `q` key was pressed, break from the loop
            # and completely stop running
            if key == ord("q"):
                running = False
                break

        # increment the total number of frames processed thus far and
        # then update the FPS counter
        totalFrames += 1
        fps.update()

    # stop the timer and display FPS information
    fps.stop()
    logging.info("elapsed time: {:.2f}".format(fps.elapsed()))
    logging.info("approx. FPS: {:.2f}".format(fps.fps()))

    # check to see if we need to release the video writer pointer
    if writer is not None:
        writer.release()

    # if we are not using a video file, stop the camera video stream
    if not args.get("input", False):
        vs.stop()

    # otherwise, release the video file pointer
    else:
        vs.release()

if __name__ == "__main__":
    import cmdline.cmd_args as counter_args

    args = vars(counter_args.parse_counter_args())
    store_count = args['set_count']
    
    # passed down to the messenger so we can manipulate the count from outside
    messenger = IoTCountMessenger(args["id"], ResettableCount(store_count), debug=args["debug"], debug_no_iot=args["visual"])

    running = True
    sess = None
    total = 0

    while(running):    
        # this will block our loop and spin its own
        main(args, total)

        # we received a reset message
        total = messenger.reset()
        time.sleep(0.5)
    

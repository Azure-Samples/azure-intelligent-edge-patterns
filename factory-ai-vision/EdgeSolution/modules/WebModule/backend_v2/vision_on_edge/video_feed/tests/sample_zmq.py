import base64
import threading

import cv2
import zmq

context = zmq.Context()
sender = context.socket(zmq.PUB)
sender.bind("tcp://*:5555")

camera = cv2.VideoCapture(0)  # init the camera


def run():
    def worker():
        while True:
            try:
                (grabbed, frame) = camera.read()  # grab the current frame
                frame = cv2.resize(frame, (640, 480))  # resize the frame
                encoded, buffer = cv2.imencode(".jpg", frame)
                sender.send_multipart([bytes("1", "utf-8"), buffer.tobytes()])

            except KeyboardInterrupt:
                camera.release()
                cv2.destroyAllWindows()
                print("\n\nBye bye\n")
                break

    threading.Thread(target=worker).start()


if __name__ == "__main__":
    run()

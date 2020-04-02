
from threading import Thread
import sys
import cv2
from queue import Queue
 
# This class reads all the video frames in a separate thread and always has the 
# keeps only the latest frame in its queue to be grabbed by another thread
class VideoStream(object):

      def __init__(self, path, queueSize=15):
          self.stream = cv2.VideoCapture(path)
          self.stopped = False
          self.Q = Queue(maxsize=queueSize)

      def start(self):
          # start a thread to read frames from the video stream
          t = Thread(target=self.update, args=())
          t.daemon = True
          t.start()
          return self

      def update(self):
          try:
              while True:
                if self.stopped:
                   return
                if not self.Q.full():
                   (grabbed, frame) = self.stream.read()

                   # if the `grabbed` boolean is `False`, then we have
                   # reached the end of the video file
                   if not grabbed:
                    #Uncomment to stop on end
                      #self.stop()
                      #return               
                    #print('no video RESETTING FRAMES TO 0 TO RUN IN LOOP')
                    self.stream.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                    
                   self.Q.put(frame)

                   #Clean the queue to keep only the latest frame
                   while self.Q.qsize() > 1:
                         self.Q.get()

          except Exception as e:
                 print("got error: "+str(e))
      def read(self):
          return self.Q.get()
      
      def more(self):
          return self.Q.qsize() > 0
 
      def stop(self):
          self.stopped = True

      def __exit__(self, exception_type, exception_value, traceback):
          self.stream.release()

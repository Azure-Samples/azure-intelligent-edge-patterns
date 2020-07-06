
# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

from threading import Thread
import sys
import cv2
from queue import Queue
 
# This class reads all the video frames in a separate thread and always has the 
# keeps only the latest frame in its queue to be grabbed by another thread
class VideoStream(object):

      def __init__(self, path, queueSize=15):
          self.path = path
          print("Reading frames from path:: " + path)
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
                   print("Exiting..from stopped")
                   return
                if not self.Q.full():
                   (grabbed, frame) = self.stream.read()
                   #print("value of grabbed is :: " + str(grabbed))
                   # if the `grabbed` boolean is `False`, then we have
                   if "sample_video" in self.path :
                       if not grabbed:
                            print('no video RESETTING FRAMES TO 0 TO RUN IN LOOP')
                            self.stream.set(cv2.CAP_PROP_POS_FRAMES, 0)
                            continue
                            #print("Video path not able to grab frames returning...")
                            #self.stop()
                            #return            
                   elif not grabbed:
                    #Uncomment to stop on end
                      print("not able to grab frames returning...")
                      self.stop()
                      return             
                      
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

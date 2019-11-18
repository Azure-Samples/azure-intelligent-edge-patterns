###
### Original code by Adrian Rosebrock, PyImageSearch: https://www.pyimagesearch.com/2018/08/13/opencv-people-counter/
###


class TrackableObject:
	def __init__(self, objectID, centroid):
		# store the object ID, then initialize a list of centroids
		# using the current centroid
		self.objectID = objectID
		self.centroids = [centroid]
#
# Run this like so:
# 
# $ python runtest_infer3.py
#

import requests
import time

#eg http://51.141.178.47:5001/score
scoring_uri = 'http://<replace with yout edge device ip address>:5001/score'
print("scoring_uri is {}".format(scoring_uri))

#downloading labels for imagenet that resnet model was trained on
#classes_entries = requests.get("https://raw.githubusercontent.com/Lasagne/Recipes/master/examples/resnet50/imagenet_classes.txt").text.splitlines()
classes_entries = open('imagenet_classes.txt','rb').read().splitlines()

test_sample1 = open('snowleopardgaze.jpg', 'rb').read()
print("test_sample1 size is {}".format(len(test_sample1)))

test_sample2 = open('taco.jpg', 'rb').read()
print("test_sample2 size is {}".format(len(test_sample2)))

t0= time.clock()

# Set the content type
headers = {'Content-Type': 'application/json'}

for i in range(0,10):
    try:
        # Make the request
        if i % 2 == 0:
            resp = requests.post(scoring_uri, test_sample1, headers=headers)
        else:
            resp = requests.post(scoring_uri, test_sample2, headers=headers)

        print("{}: ".format(i)+ " Found a :: " + classes_entries[int(resp.text.strip("[]")) - 1] )

    except KeyError as e:
        print(str(e))

t1 = time.clock() - t0
print("Time elapsed: {} seconds".format(t1)) # CPU seconds elapsed (floating point)

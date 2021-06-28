#
# Run this like so:
# 
# $ python runtest_infer.py
#

import requests

#eg http://51.141.178.47:5001/score
scoring_uri = 'http://<replace with yout edge device ip address>:5001/score'
print("scoring_uri is {}".format(scoring_uri))

#downloading labels for imagenet that resnet model was trained on
classes_entries = requests.get("https://raw.githubusercontent.com/Lasagne/Recipes/master/examples/resnet50/imagenet_classes.txt").text.splitlines()

test_sample = open('snowleopardgaze.jpg', 'rb').read()
print("test_sample size is {}".format(len(test_sample)))

# Set the content type
headers = {'Content-Type': 'application/json'}

try:
    # Make the request
    resp = requests.post(scoring_uri, test_sample, headers=headers)

    print("Found a :: " + classes_entries[int(resp.text.strip("[]")) - 1] )

except KeyError as e:
    print(str(e))
    
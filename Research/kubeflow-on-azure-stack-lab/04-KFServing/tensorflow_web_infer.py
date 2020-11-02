from PIL import Image
import numpy as np
import tensorflow as tf
import requests
import json

sz=(224,224)
myimagefilename = 'grace_hopper.jpg'

# You need to put the host and port according to what you deployed in your system
# eg. http://51.141.178.47:5001/score
scoring_uri = 'http://<INGRESS_HOST>:<INGRESS_PORT>/v1/models/custom-model:predict'

try:
    labels_path = tf.keras.utils.get_file(
      'ImageNetLabels.txt',
      'https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt')
    imagenet_labels = np.array(open(labels_path).read().splitlines())
    np.set_printoptions(threshold=np.inf)
    print(f"imagenet_labels: {imagenet_labels}")

    # Creating the json using PIL
    pil_im = Image.open(myimagefilename,'r')
    pil_out = pil_im.resize(sz)
    pil_out.save('resized_image.jpg')
    test_sample_via_pil = "{\"instances\":[{\"input_1\":" + str(np.array(pil_out).tolist()) + "}]}"
    # print(test_sample)
    ## We can check that we get the image back if we wanted to
    # imgX = Image.fromarray(np.array(pil_out), 'RGB')
    # imgX.save('resized_image_from_array.png')

    # Creating the json using keras pre-procesing
    file2 = tf.keras.utils.get_file(
        "bowtie2.jpg",
        "https://storage.googleapis.com/download.tensorflow.org/example_images/grace_hopper.jpg"
        )
    img2 = tf.keras.preprocessing.image.load_img(file2, target_size=[224, 224])
    x2 = tf.keras.preprocessing.image.img_to_array(img2)
    x2 = tf.keras.applications.mobilenet.preprocess_input(
                    x2[tf.newaxis,...])
    # we can save it as a .npy, for model_cli
    np.save("mybowtie2.npy",x2)
    myx2str = str(x2.tolist())[1:-1]
    test_sample2 = "{\"instances\":[{\"input_1\":" + myx2str + "}]}"
    print(test_sample2)

    print(f"scoring_uri is {scoring_uri}")
    # Set the content type
    headers = {'Content-Type': 'application/json',
            'Host': 'custom-model.kfserving-test.example.com'}
    # Make the request
    resp = requests.post(scoring_uri, test_sample2, headers=headers)
    result_test_s = resp.text.strip("[]")
    print(f"result_test_s: \"{result_test_s}\"")

    result = json.loads(result_test_s)
    result_test = result["predictions"]
    print(f"result_test: {result_test}")

    decoded_test = np.argsort(result_test)[0,::-1][:5]
    print("Result for test image: ", decoded_test)
    decoded_test_labeled = imagenet_labels[decoded_test]
    print("                       ", decoded_test_labeled)

except KeyError as e:
    print(str(e))

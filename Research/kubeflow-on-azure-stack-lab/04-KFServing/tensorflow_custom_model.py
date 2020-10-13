#
# Based on demos at TensorFlow guide:
# https://www.tensorflow.org/guide/saved_model
#
import os
import tempfile

from matplotlib import pyplot as plt
import numpy as np
import tensorflow as tf

print('TensorFlow version: {}'.format(tf.__version__))
tmpdir = "build_models"

physical_devices = tf.config.experimental.list_physical_devices('GPU')
if physical_devices:
    tf.config.experimental.set_memory_growth(physical_devices[0], True)

file = tf.keras.utils.get_file(
    "grace_hopper.jpg",
    "https://storage.googleapis.com/download.tensorflow.org/example_images/grace_hopper.jpg")
img = tf.keras.preprocessing.image.load_img(file, target_size=[224, 224])
plt.imshow(img)
plt.axis('off')
x = tf.keras.preprocessing.image.img_to_array(img)
x = tf.keras.applications.mobilenet.preprocess_input(
    x[tf.newaxis,...])

labels_path = tf.keras.utils.get_file(
    'ImageNetLabels.txt',
    'https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt')
imagenet_labels = np.array(open(labels_path).read().splitlines())

pretrained_model = tf.keras.applications.MobileNet()
result_before_save = pretrained_model(x)

### our own image, a template how we should be pre-processing input for the inference to work
file2 = tf.keras.utils.get_file(
            "bowtie.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Bill_Nye_with_trademark_blue_lab_coat_and_bowtie.jpg/319px-Bill_Nye_with_trademark_blue_lab_coat_and_bowtie.jpg"
            )
img2 = tf.keras.preprocessing.image.load_img(file2, target_size=[224, 224])
x2 = tf.keras.preprocessing.image.img_to_array(img2)
x2 = tf.keras.applications.mobilenet.preprocess_input(
            x2[tf.newaxis,...])
np.save("mybowtie.npy",x2)

result_test = pretrained_model(x2)
decoded_test = np.argsort(result_test)[0,::-1][:5]+1
decoded_test_labeled = imagenet_labels[np.argsort(result_test)[0,::-1][:5]+1]
print("Result for test image: ", decoded_test)
print("                       ", decoded_test_labeled)
###

decoded = np.argsort(result_before_save)[0,::-1][:5]+1
decoded_labeled = imagenet_labels[np.argsort(result_before_save)[0,::-1][:5]+1]
print("Result before saving: ", decoded)
print("                      ", decoded_labeled)


mobilenet_save_path = os.path.join(tmpdir, "mobilenet/1/")
tf.saved_model.save(pretrained_model, mobilenet_save_path)


loaded = tf.saved_model.load(mobilenet_save_path)
print("list(loaded.signatures.keys(): ", list(loaded.signatures.keys()))  # ["serving_default"]
print("mobilenet_save_path is ", mobilenet_save_path)

infer = loaded.signatures["serving_default"]
print("infer. structured_outputs: ", infer.structured_outputs)

labeling = infer(tf.constant(x))[pretrained_model.output_names[0]]

decoded = imagenet_labels[np.argsort(labeling)[0,::-1][:5]+1]

print("Result after saving and loading: ", decoded)

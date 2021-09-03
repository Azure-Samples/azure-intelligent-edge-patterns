import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


image_id_input = tf.keras.initializers.Constant(0.0)(shape=(1, 256))

detected_classes_input_i32 = keras.Input(shape=(256), batch_size=1, name='detected_classes', dtype='int32')
detected_classes_input = tf.cast(detected_classes_input_i32, tf.float32)
detected_scores_input = keras.Input(shape=(256),  batch_size=1, name='detected_scores')
detected_boxes_input = keras.Input(shape=(256, 4), batch_size=1, name='detected_boxes')


x_image_id = layers.Reshape(( 1, 256, 1))(image_id_input)[:,:,:200,:]
x_classes = layers.Reshape((  1, 256, 1))(detected_classes_input)[:,:,:200,:]
x_scores = layers.Reshape(( 1, 256, 1))(detected_scores_input)[:,:,:200,:]
x_boxes = layers.Reshape(( 1, 256, 4))(detected_boxes_input)[:,:,:200,:]


output = layers.Concatenate(name='detection_out')([x_image_id, x_classes, x_scores, x_boxes])


model = keras.Model(
        inputs=[detected_classes_input_i32, detected_scores_input, detected_boxes_input],
        outputs=[output])

#from IPython import embed; embed()

#model.save('convert_ws/cv_post2')
model.save('cv_post')

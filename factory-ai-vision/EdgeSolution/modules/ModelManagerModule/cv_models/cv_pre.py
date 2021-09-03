import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


image = keras.Input(shape=(3, 416, 416), batch_size=1, name='image', dtype='float32')

rgb_image = tf.reverse(image, axis=[1])

normalizer = tf.keras.initializers.Constant(1.0/256)(shape=(1, 3, 416, 416))

output = keras.layers.Multiply(name='image_out')([rgb_image, normalizer])

model = keras.Model(inputs=[image], outputs=[output])


from IPython import embed; embed()
model.save('cv_pre')

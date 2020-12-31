import numpy as np
import os
import pickle
import tarfile
import tensorflow as tf

def _process_batch(buf):
    d = pickle.loads(buf, encoding='bytes')
    imgs = np.reshape(d[b'data'], (10000, 32, 32, 3), 'F').transpose([0, 2, 1, 3])
    labels = np.array(d[b'labels'])
    return imgs, labels


def load_dataset(path, global_batch_size, num_workers, worker_index):
    train_data = []
    test_data = []

    with tarfile.open(os.path.join(path, 'cifar-10', 'cifar-10-python.tar.gz'), mode='r:gz') as tar:
        for i in range(1, 6):
            buf = tar.extractfile(f'cifar-10-batches-py/data_batch_{i}').read()
            train_data.append(_process_batch(buf))

        buf = tar.extractfile('cifar-10-batches-py/test_batch').read()
        test_data.append(_process_batch(buf))

    train_images, train_labels = zip(*train_data)
    train_images, train_labels = np.concatenate(train_images, axis=0), np.concatenate(train_labels, axis=0)
    test_images, test_labels = test_data[0]

    train_data = train_images, train_labels
    test_data = test_images, test_labels

    with tf.device('/cpu:0'):
        augmenter = tf.keras.Sequential([
            tf.keras.layers.experimental.preprocessing.RandomFlip('horizontal'),
            tf.keras.layers.experimental.preprocessing.RandomTranslation(0.125, 0.125),
            tf.keras.layers.experimental.preprocessing.RandomRotation(0.05),
            tf.keras.layers.experimental.preprocessing.RandomContrast(0.1),
        ])

    train_ds = tf.data.Dataset.from_tensor_slices(train_data) \
        .shard(num_workers, worker_index) \
        .shuffle(len(train_data)) \
        .repeat() \
        .batch(global_batch_size // num_workers) \
        .map(lambda x, y: (augmenter(x, training=True), y), num_parallel_calls=4, deterministic=False) \
        .prefetch(256)

    test_ds = tf.data.Dataset.from_tensor_slices(test_data) \
        .shard(num_workers, worker_index) \
        .shuffle(len(test_data)) \
        .repeat() \
        .batch(global_batch_size // num_workers) \
        .prefetch(256)

    return train_ds, test_ds

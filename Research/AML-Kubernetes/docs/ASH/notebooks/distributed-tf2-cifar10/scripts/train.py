import argparse
from azureml.core.run import Run
import cifar10_utils as ds_utils
import json
import os
import ps_hack
import tensorflow as tf
from tensorflow.keras.activations import swish, softmax
from tensorflow.keras.callbacks import Callback
from tensorflow.keras.layers import BatchNormalization, Conv2D, Dense, Dropout, GlobalMaxPool2D, Input, MaxPool2D
from tensorflow.keras.losses import SparseCategoricalCrossentropy
from tensorflow.keras.metrics import sparse_categorical_accuracy
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import SGD
from tensorflow.keras.optimizers.schedules import PiecewiseConstantDecay


def conv_bn_block(x, filters, activation=None):
    c1 = Conv2D(filters, 3, padding='same', use_bias=False)(x)
    b1 = BatchNormalization()(c1)
    a1 = activation(b1) if activation is not None else b1

    return a1


def downsampling_residual_block(x, inner_dim, unit_func, unit_func_args, n_repeats):
    ds1 = Conv2D(inner_dim, 1, padding='same', use_bias=False)(x)
    b1 = BatchNormalization()(ds1)
    y = b1
    for _ in range(n_repeats):
        y = unit_func(y, *unit_func_args)
    
    filters = tf.keras.backend.int_shape(x)[-1]
    us1 = Conv2D(filters, 1, padding='same')(y)

    return us1 + x


def create_model():
    x = Input(shape=(32, 32, 3), name='image_in', dtype=tf.float32)

    b0 = BatchNormalization()(x)
    c0 = conv_bn_block(b0, 64, swish)

    c1 = conv_bn_block(c0, 128, swish)
    p1 = MaxPool2D()(c1)
    r1 = downsampling_residual_block(p1, 64, conv_bn_block, (64, swish), 2)

    c2 = conv_bn_block(r1, 256, swish)
    p2 = MaxPool2D()(c2)
    r2 = downsampling_residual_block(p2, 128, conv_bn_block, (128, swish), 2)

    c3 = conv_bn_block(r2, 512, swish)
    p3 = MaxPool2D()(c3)
    r3 = downsampling_residual_block(p3, 256, conv_bn_block, (256, swish), 2)

    c4 = conv_bn_block(r3, 1024, swish)
    p4 = GlobalMaxPool2D()(c4)

    h1 = Dense(100, activation=swish)(p4)
    y_pred = Dense(10, activation=softmax)(h1)

    boundaries = [512, 9728, 14336, 18432]
    multipliers = [0.5, 1.0, 0.5, 0.25, 0.125]
    lr = PiecewiseConstantDecay(boundaries, [args.alpha_init * m for m in multipliers])

    model = Model(inputs=[x], outputs=[y_pred])
    
    model.compile(
        optimizer=SGD(learning_rate=lr, momentum=0.8, nesterov=True),
        loss=SparseCategoricalCrossentropy(),
        metrics=[sparse_categorical_accuracy])

    return model


class RunLogCallback(Callback):
    def __init__(self, run):
        self.run = run
    
    def on_epoch_end(self, epoch, logs=None):
        self.run.log('Training loss', logs['loss'])
        self.run.log('Training accuracy', logs['sparse_categorical_accuracy'])
        self.run.log('Learning rate', self.model.optimizer.lr(self.model.optimizer.iterations.numpy()).numpy())
        self.run.log('Validation loss', logs['val_loss'])
        self.run.log('Validation accuracy', logs['val_sparse_categorical_accuracy'])

    def on_epoch_begin(self, epoch, logs=None):
        print('epoch begin', epoch)
        self.run.log('epoch begin', epoch)

    def on_train_batch_begin(self, batch, logs=None):
        print('batch begin', batch)
        self.run.log('batch_log begin', batch)

    def on_train_batch_end(self, batch, logs=None):
        print('batch end', batch)
        self.run.log('batch_log end', batch)

def main():
    strategy = tf.distribute.MultiWorkerMirroredStrategy(
        communication_options=tf.distribute.experimental.CommunicationOptions(
            implementation=tf.distribute.experimental.CollectiveCommunication.AUTO))

    with strategy.scope():
        train_ds, test_ds = ds_utils.load_dataset(args.dataset_path, args.global_batch_size, num_workers, worker_index)
        run = Run.get_context()


        # with tf.device('/gpu:0'):
        #     model = create_model()

        #with tf.device('/cpu:0'):
        model = create_model()

        '''
        if worker_index == 0:
            tf.keras.utils.plot_model(model, 'model.png', show_dtype=True, show_shapes=True, dpi=300)
            run.log_image('model', 'model.png')
        '''

        print("calling model.fit ()")
        model.fit(
            train_ds,
            epochs=args.epochs,
            steps_per_epoch=args.batches_per_epoch,
            verbose=2,
            #callbacks=[RunLogCallback(run)] if worker_index == 0 else [],
            callbacks=[RunLogCallback(run)],
            validation_data=test_ds,
            validation_steps=args.batches_per_epoch)

        save_to_outputs(model)

def save_to_outputs(model):
    model_name, model_version = "outputs", "001"
    model_path = os.path.join(model_name, model_version)
    tf.saved_model.save(model, model_path)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset-path', type=str, required=True)
    parser.add_argument('--epochs', type=int, default=40)
    parser.add_argument('--batches-per-epoch', type=int, default=256)
    parser.add_argument('--global-batch-size', type=int, default=256)
    parser.add_argument('--alpha-init', type=float, default=0.001)

    args = parser.parse_args()

    try:
        ps_hack.convert_ps_nodes_to_workers()
        tf_config = json.loads(os.environ['TF_CONFIG'])
        num_workers = len(tf_config['cluster']['worker'])
        worker_index = tf_config['task']['index']
    except KeyError:
        num_workers = 1
        worker_index = 0
    
    print(f'worker {worker_index} ({num_workers} total workers)')
    tf.data.experimental.DistributeOptions.auto_shard_policy = tf.data.experimental.AutoShardPolicy.OFF

    main()

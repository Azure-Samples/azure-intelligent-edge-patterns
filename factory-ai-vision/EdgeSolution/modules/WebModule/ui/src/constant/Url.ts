enum Url {
  ROOT = '/',

  HOME = '/home',
  HOME_GET_STARTED = '/home/getStarted',
  HOME_CUSTOMIZE = '/home/customize',

  IMAGES = '/images',
  IMAGES_DETAIL = '/images/:id',

  PARTS = '/parts',
  PARTS_DETAIL = '/parts/detail',

  CAMERAS = '/cameras',
  CAMERAS_DETAIL = '/cameras/detail',

  MODELS = '/models',
  MODELS_CV_MODEL = '/models/:id/:key',
  MODELS_CV_DETAIL_BASICS = '/models/:id/basics',
  MODELS_CV_DETAIL_TRAINING_IMAGES = '/models/:id/trainingImages',

  MODELS_OBJECTS = '/models/detail/objects',

  CASCADES = '/cascades',
  CASCADES_DETAIL = '/cascades/:id',
  CASCADES_CREATE = '/cascades/create',

  DEPLOYMENT = '/deployment',
}

export default Url;

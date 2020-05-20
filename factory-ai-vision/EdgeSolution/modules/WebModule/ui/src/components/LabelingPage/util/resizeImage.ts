import { Size2D } from '../../../store/labelingPage/labelingPageTypes';

const getResizeImageFunction = (defaultSize: Size2D) => (size: Size2D): [Size2D, number] => {
  if (size.width !== 0) {
    if (size.width > size.height) {
      const scaleX = defaultSize.width / size.width;

      return [{ width: defaultSize.width, height: size.height * scaleX }, scaleX];
    }
    const scaleY = defaultSize.height / size.height;

    return [{ height: defaultSize.height, width: size.width * scaleY }, scaleY];
  }
  return [defaultSize, 1];
};

export default getResizeImageFunction;

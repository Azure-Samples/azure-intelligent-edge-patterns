import { Size2D } from '../../../store/type';

// Simulate css object-fit properties
export enum CanvasFit {
  Contain,
  Cover,
}

const resizeImageFunction = (defaultSize: Size2D, fit: CanvasFit, size: Size2D): [Size2D, number] => {
  const conditionCheck = (width, height) => {
    if (fit === CanvasFit.Contain) return width > height;
    return width < height;
  };

  if (size.width !== 0) {
    if (conditionCheck(size.width, size.height)) {
      const scaleX = defaultSize.width / size.width;

      return [{ width: defaultSize.width, height: size.height * scaleX }, scaleX];
    }
    const scaleY = defaultSize.height / size.height;

    return [{ height: defaultSize.height, width: size.width * scaleY }, scaleY];
  }
  return [defaultSize, 1];
};

export default resizeImageFunction;

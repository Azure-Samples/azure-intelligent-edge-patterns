import { useState, useEffect, useRef } from 'react';

type ImageState = {
  image: any;
  status: string;
  size: { width: number; height: number };
};
const defaultState: ImageState = {
  image: undefined,
  status: 'loading',
  size: { width: 0, height: 0 },
};

const usePrevious = <T>(value: T): T => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const useImage = (url: string, crossOrigin: string): [any, string, { width: number; height: number }] => {
  const [imageState, setImageState] = useState<ImageState>(defaultState);
  const { image, status, size } = imageState;

  const prevUrl = usePrevious<string>(url);

  useEffect(() => {
    if (!url) return;

    const img = document.createElement('img');

    if (url !== prevUrl) {
      setImageState((prev) => ({ ...prev, image: prev.image, status: 'loading' }));
    }

    const onload = (): void => {
      setImageState({
        image: img,
        status: 'loaded',
        size: { width: img.width, height: img.height },
      });
    };

    const onerror = (): void => {
      setImageState((prev) => ({ ...prev, image: undefined, status: 'failed' }));
    };

    img.addEventListener('load', onload);
    img.addEventListener('error', onerror);
    if (crossOrigin) img.crossOrigin = crossOrigin;

    img.src = url;

    return (): void => {
      img.removeEventListener('load', onload);
      img.removeEventListener('error', onerror);
    };
  }, [url, crossOrigin, prevUrl]);

  // return array because it it better to use in case of several useImage hooks
  // const [background, backgroundStatus] = useImage(url1);
  // const [patter] = useImage(url2);
  return [image, status, size];
};

export default useImage;

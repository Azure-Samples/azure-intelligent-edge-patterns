import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Flex, Text, Image } from '@fluentui/react-northstar';

interface ImageLinkProps {
  to?: string;
  imgSrc?: string;
  defaultSrc?: string;
  label?: string;
  imgPadding?: string;
  width: string;
  height?: string;
}
const ImageLink: FC<ImageLinkProps> = ({
  to = '',
  imgSrc,
  defaultSrc,
  label = '',
  imgPadding = '10px',
  width = '100px',
  height = '100px',
}) => {
  return (
    <Flex column styles={{ width }}>
      {to === '' ? (
        <div style={{ height }}>
          <Image
            src={imgSrc ?? defaultSrc}
            styles={{ padding: imgPadding, width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      ) : (
        <Link to={to}>
          <div style={{ height }}>
            <Image
              src={imgSrc ?? defaultSrc}
              styles={{ padding: imgPadding, width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </Link>
      )}
      <Text align="center">{label}</Text>
    </Flex>
  );
};

export default ImageLink;

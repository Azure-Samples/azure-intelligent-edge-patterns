import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Flex, FlexItem, Text, Image } from '@fluentui/react-northstar';

interface ImageLinkProps {
  to: string;
  imgSrc?: string;
  defaultSrc?: string;
  label?: string;
  imgPadding?: string;
  width: string;
  height?: string;
}
const ImageLink: FC<ImageLinkProps> = ({
  to,
  imgSrc,
  defaultSrc,
  label = '',
  imgPadding = '10px',
  width = '100px',
  height = '100px',
}) => {
  return (
    <Flex column styles={{ width }}>
      <Link to={to}>
        <FlexItem styles={{ height }}>
          <Image src={imgSrc ?? defaultSrc} fluid styles={{ padding: imgPadding }} />
        </FlexItem>
      </Link>
      <Text align="center">{label}</Text>
    </Flex>
  );
};

export default ImageLink;

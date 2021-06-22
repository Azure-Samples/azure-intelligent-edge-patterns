import React from 'react';
import { Dialog, Flex, Loader, ErrorIcon, Text, AcceptIcon } from '@fluentui/react-northstar';

export enum Status {
  None,
  Loading,
  Success,
  Failed,
}

export const LoadingDialog = ({
  status = Status.None,
  errorMessage = '',
  onConfirm = () => {},
}): JSX.Element => {
  const getContent = (): JSX.Element => {
    switch (status) {
      case Status.Loading:
        return <Loader label="Loading" size="largest" />;
      case Status.Failed:
        return (
          <>
            <ErrorIcon size="largest" />
            <Text error>{errorMessage}</Text>
          </>
        );
      case Status.Success:
        return (
          <>
            <AcceptIcon size="largest" style={{ color: 'green' }} />
            <Text success>Success</Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      styles={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      confirmButton={status !== Status.Loading && 'Confirm'}
      onConfirm={onConfirm}
      open={status !== Status.None}
      content={
        <>
          <Flex hAlign="center" column>
            {getContent()}
          </Flex>
        </>
      }
    />
  );
};

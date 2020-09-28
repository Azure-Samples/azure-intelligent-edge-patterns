import React, { useState } from 'react';
import {
  Card,
  CloseIcon,
  Button,
  CardHeader,
  Flex,
  CardBody,
  Text,
  Loader,
  ComponentEventHandler,
  ButtonProps,
} from '@fluentui/react-northstar';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Notification } from '../reducers/type';
import { deleteNotification } from '../action/creators/notificationActionCreators';
import { mainTheme } from '../themes/mainTheme';

export const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const onDelete: ComponentEventHandler<ButtonProps> = async (evt): Promise<void> => {
    evt.stopPropagation();
    setLoading(true);
    try {
      await dispatch(deleteNotification(notification.id));
    } catch (e) {
      alert(e);
      // Set loading to false only in catch because if success, the component will be unmount.
      // Setting a state in a unmount component is a no-op in React
      setLoading(false);
    }
  };

  return (
    <Card
      styles={{
        height: '',
        border: mainTheme.siteVariables.colorScheme.brand.border,
        cursor: 'pointer',
        width: '280px',
      }}
      onClick={(): void => history.push(notification.linkTo)}
    >
      <Card.TopControls>
        {loading ? (
          <Loader size="smallest" />
        ) : (
          <Button icon={<CloseIcon />} text iconOnly title="Close" onClick={onDelete} />
        )}
      </Card.TopControls>
      <CardHeader>
        <Flex gap="gap.small">
          <Flex column>
            <Text content={notification.title} weight="bold" />
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>{notification.content}</CardBody>
    </Card>
  );
};

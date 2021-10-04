import React, { useCallback } from 'react';
import { Link } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

import { Url } from '../constant';

export const CreateProjectDialog: React.FC = () => {
  const history = useHistory();

  const onDirectModelPage = useCallback(() => {
    history.push(Url.MODELS);
  }, [history]);

  return <Link onClick={onDirectModelPage}>{'Go to models >'}</Link>;
};

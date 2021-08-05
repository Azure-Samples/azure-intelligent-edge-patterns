import React, { useState, useEffect } from 'react';
import { CommandBar, ICommandBarItemProps, getTheme, Stack, Label } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import AddPanel from '../components/Models/Panel/AddPanel';
import ModelDashboard from '../components/Models/Dashboard';
import { getParts } from '../store/partSlice';

import ModelContainer from '../components/Models/ModelContainer';

export const Models = () => {
  // return (
  //   <>
  //     <Stack styles={{ root: { height: '100%', padding: '32px 16px', overflowY: 'auto' } }}>
  //       <Label styles={{ root: { fontSize: '18px', lineHeight: '24px' } }}>Models</Label>
  //       <Stack tokens={{ childrenGap: '65px' }}>
  //         <CommandBar styles={{ root: { marginTop: '24px' } }} items={newCommandBarItems} />
  //         <ModelDashboard onOpen={() => setIsOpen(true)} onPanelTypeChange={setModelType} />
  //       </Stack>
  //     </Stack>
  //     <AddPanel isOpen={isOpen} modelType={modelType} onDissmiss={() => setIsOpen(false)} />
  //   </>
  // );
  return <ModelContainer />;
};

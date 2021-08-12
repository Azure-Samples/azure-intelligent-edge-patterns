import React, { useState, useCallback } from 'react';
import { Stack, ActionButton, Icon, Link, mergeStyleSets, SearchBox } from '@fluentui/react';
import { useSelector } from 'react-redux';

import {
  trainingProjectIsPredictionModelFactory,
  TrainingProject,
} from '../../../store/trainingProjectSlice';

import ModelSideBar from './Sidebar/Model';
import TransformSidleBar from './Sidebar/Transform';
import ExportSideBar from './Sidebar/Export';

interface Props {
  trainingProjectList: TrainingProject[];
  // transformList: TrainingProject[];
  // exportList: TrainingProject[];
}

const getClasses = () =>
  mergeStyleSets({
    root: {},
    sidebarWrapper: { borderBottom: '1px solid #C8C6C4', padding: '0 16px 10px' },
    searchBox: { width: '180px', marginTop: '20px' },
    manageModels: { marginTop: '25px' },
  });

export default (props: Props) => {
  const { trainingProjectList } = props;

  // const trainingProjectIsPredictionModelSelector = trainingProjectIsPredictionModelFactory();
  // const modelList = useSelector(trainingProjectIsPredictionModelSelector);

  const modelList = trainingProjectList.filter((project) => project.node_type === 'model');
  const transformList = trainingProjectList.filter((project) => project.node_type === 'custom');
  const exportList = trainingProjectList.filter((project) => project.node_type === 'export');

  // console.log('modelList', modelList);

  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isTransformOpen, setIsTransformOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const classes = getClasses();

  // const onDragStart = useCallback((event, nodeType, selectId) => {
  //   event.dataTransfer.setData('application/reactflow', nodeType);
  //   event.dataTransfer.setData('cardCategory', 'model');
  //   event.dataTransfer.setData('id', selectId);
  //   event.dataTransfer.effectAllowed = 'move';
  // }, []);

  return (
    <aside
      style={{
        borderRight: '1px solid #eee',
        background: '#fff',
        height: '730px',
        overflowY: 'auto',
      }}
    >
      <Stack styles={{ root: classes.sidebarWrapper }}>
        <SearchBox styles={{ root: classes.searchBox }} placeholder="Search" />

        <Stack horizontal verticalAlign="center">
          <Icon iconName={isModelOpen ? 'ChevronDown' : 'ChevronUp'} />

          <ActionButton
            text="Models"
            iconProps={{ iconName: 'ModelingView' }}
            onClick={() => setIsModelOpen((prev) => !prev)}
          />
        </Stack>
        {isModelOpen && (
          <div>
            <Stack tokens={{ childrenGap: 16 }}>
              {modelList.map((model, id) => (
                <ModelSideBar key={id} model={model} type="model" />
              ))}
            </Stack>
            <Link styles={{ root: classes.manageModels }}>Manage Models</Link>
          </div>
        )}
      </Stack>

      <Stack styles={{ root: classes.sidebarWrapper }}>
        <Stack horizontal verticalAlign="center">
          <Icon iconName={isTransformOpen ? 'ChevronDown' : 'ChevronUp'} />
          <ActionButton
            text="Transform"
            iconProps={{ iconName: 'TransitionEffect' }}
            onClick={() => setIsTransformOpen((prev) => !prev)}
          />
        </Stack>
        {isTransformOpen && (
          <div>
            <Stack tokens={{ childrenGap: 16 }}>
              {transformList.map((transform, id) => (
                <ModelSideBar key={id} model={transform} type="custom" />
              ))}
            </Stack>
          </div>
        )}
      </Stack>

      <Stack styles={{ root: classes.sidebarWrapper }}>
        <Stack horizontal verticalAlign="center">
          <Icon iconName={isExportOpen ? 'ChevronDown' : 'ChevronUp'} />
          <ActionButton
            text="Export"
            iconProps={{ iconName: 'CloudImportExport' }}
            onClick={() => setIsExportOpen((prev) => !prev)}
          />
        </Stack>
        {isExportOpen && (
          <div>
            <Stack tokens={{ childrenGap: 16 }}>
              {exportList.map((model, id) => (
                <ModelSideBar key={id} model={model} type="export" />
              ))}
            </Stack>
          </div>
        )}
      </Stack>
      {/* <div className="dndnode output" onDragStart={(event) => onDragTransform(event, 'model')} draggable>
        Model Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragExport(event, 'model')} draggable>
        Model Node
      </div> */}
    </aside>
  );
};

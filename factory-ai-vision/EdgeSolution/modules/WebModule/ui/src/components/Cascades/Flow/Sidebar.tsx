import React, { useState } from 'react';
import { Stack, ActionButton, Icon, Link, mergeStyleSets, SearchBox } from '@fluentui/react';

import { TrainingProject } from '../../../store/trainingProjectSlice';

import SideBardCard from './Sidebar/SideBar';

interface Props {
  modelList: TrainingProject[];
}

const getClasses = () =>
  mergeStyleSets({
    root: {},
    sidebarWrapper: { borderBottom: '1px solid #C8C6C4', padding: '0 16px 10px' },
    searchBox: { width: '180px', marginTop: '20px' },
    manageModels: { marginTop: '25px' },
  });

export default (props: Props) => {
  const { modelList } = props;

  const modelNodeList = modelList.filter((model) =>
    ['openvino_model', 'customvision_model'].includes(model.nodeType),
  );
  const transformList = modelList.filter((model) => model.nodeType === 'openvino_library');
  const exportModel = modelList.find((model) => model.nodeType === 'sink');

  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isTransformOpen, setIsTransformOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const classes = getClasses();

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
              {modelNodeList.map((model, id) => (
                <SideBardCard key={id} model={model} type="openvino_model" />
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
                <SideBardCard key={id} model={transform} type="openvino_library" />
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
              <SideBardCard type="sink" model={exportModel} />
            </Stack>
          </div>
        )}
      </Stack>
    </aside>
  );
};

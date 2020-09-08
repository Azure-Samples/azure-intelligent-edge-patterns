import React, { useState } from 'react';

import { TopNav } from './TopNav';
import { LeftNav } from './LeftNav';
import { SettingPanel } from './SettingPanel';

export const MainLayout: React.FC = ({ children }) => {
  const [settingOpen, setsettingOpen] = useState(false);
  const closeSettingPanel = () => setsettingOpen(false);

  return (
    <main
      style={{
        height: '100vh',
        display: 'grid',
        gridTemplateRows: '48px auto',
        gridTemplateColumns: '210px auto',
      }}
    >
      <nav style={{ gridRow: '1 / span 1', gridColumn: '1 / span 2' }}>
        <TopNav onSettingClick={() => setsettingOpen((prev) => !prev)} />
      </nav>
      <nav style={{ gridRow: '2 / span 1', gridColumn: '1 / span 1' }}>
        <LeftNav />
      </nav>
      <div
        style={{
          gridRow: '2 / span 1',
          gridColumn: '2 / span 1',
          overflowY: 'scroll',
          position: 'relative',
        }}
      >
        {children}
        <SettingPanel isOpen={settingOpen} onDismiss={closeSettingPanel} />
      </div>
    </main>
  );
};

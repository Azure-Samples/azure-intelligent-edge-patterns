import React from 'react';
import { TopNav } from './TopNav';
import { LeftNav } from './LeftNav';

export const MainLayout: React.FC = ({ children }) => {
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
        <TopNav />
      </nav>
      <nav style={{ gridRow: '2 / span 1', gridColumn: '1 / span 1' }}>
        <LeftNav />
      </nav>
      <div style={{ gridRow: '2 / span 1', gridColumn: '2 / span 1', overflowY: 'scroll' }}>{children}</div>
    </main>
  );
};

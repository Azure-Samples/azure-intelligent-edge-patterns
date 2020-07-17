import React from 'react';

type BadgeProps = {
  count: number;
};

/**
 * A small red badge on the top-right of the child
 */
export const Badge: React.FC<BadgeProps> = ({ children, count = 0 }) => {
  if (count <= 0) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div
        style={{
          textAlign: 'center',
          verticalAlign: 'middle',
          lineHeight: '20px',
          height: '20px',
          minWidth: '20px',
          padding: '0px 5px',
          fontSize: '12px',
          fontWeight: 'bold',
          backgroundColor: 'red',
          color: 'white',
          borderRadius: '10px',
          position: 'absolute',
          right: -5,
          top: -5,
        }}
      >
        {count > 9 ? '9+' : count}
      </div>
    </div>
  );
};

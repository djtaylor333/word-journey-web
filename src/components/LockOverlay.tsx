// Lock overlay for VIP and Android-only features
import React from 'react';

export interface LockOverlayProps {
  message: string;
}

export const LockOverlay: React.FC<LockOverlayProps> = ({ message }) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    fontSize: '1.2em',
    pointerEvents: 'none',
  }}>
    <span style={{ background: 'rgba(0,0,0,0.7)', padding: '1em', borderRadius: '8px' }}>{message}</span>
  </div>
);

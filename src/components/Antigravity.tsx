"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import AntigravityInner from './AntigravityInner';

interface AntigravityProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  color?: string;
  autoAnimate?: boolean;
}

const Antigravity: React.FC<AntigravityProps> = (props) => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <Canvas camera={{ position: [0, 0, 50], fov: 35 }}>
      <AntigravityInner {...props} />
    </Canvas>
  </div>
);

export default Antigravity;

"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import AntigravityParticles from './AntigravityParticles';

const AntigravityInteractive = (props: any) => (
    <div className="absolute inset-0 pointer-events-none z-0">
        <Canvas camera={{ position: [0, 0, 50], fov: 35 }}>
            <AntigravityParticles {...props} />
        </Canvas>
    </div>
);

export default AntigravityInteractive;

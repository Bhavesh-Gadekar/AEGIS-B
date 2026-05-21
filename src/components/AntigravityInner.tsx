"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface AntigravityInnerProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  lerpSpeed?: number;
  color?: string;
  autoAnimate?: boolean;
  particleVariance?: number;
  rotationSpeed?: number;
  depthFactor?: number;
  pulseSpeed?: number;
  particleShape?: string;
  fieldStrength?: number;
}

const AntigravityInner: React.FC<AntigravityInnerProps> = ({
  count = 280,
  magnetRadius = 6,
  ringRadius = 7,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 1.0,
  lerpSpeed = 0.05,
  color = "#5227FF",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = "capsule",
  fieldStrength = 10
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = Math.random() * ringRadius + magnetRadius;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      temp.push([x, y, z]);
    }
    return temp;
  }, [count, magnetRadius, ringRadius]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const time = state.clock.getElapsedTime();
    const dummy = new THREE.Object3D();

    particles.forEach((particle, i) => {
      const [x, y, z] = particle;
      
      let newX = x;
      let newY = y;
      let newZ = z;

      if (autoAnimate) {
        const theta = Math.atan2(y, x);
        const waveOffset = Math.sin(time * waveSpeed + i * 0.1) * waveAmplitude;
        const pulseOffset = Math.sin(time * pulseSpeed + i * 0.05) * particleVariance;
        
        newX = x + Math.cos(theta + time * rotationSpeed) * waveOffset;
        newY = y + Math.sin(time * waveSpeed + i * 0.1) * waveOffset;
        newZ = z + pulseOffset * depthFactor;
      }

      const scaleFactor = Math.max(0, Math.min(1, 1 - Math.sqrt(newX * newX + newY * newY + newZ * newZ) / (ringRadius * 2)));
      const finalScale = scaleFactor * (0.8 + Math.sin(time * pulseSpeed) * 0.2 * particleVariance) * particleSize;
      
      dummy.position.set(newX, newY, newZ);
      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </instancedMesh>
  );
};

export default AntigravityInner;

'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  focusedTarget: {
    position: [number, number, number];
    lookAt: [number, number, number];
  } | null;
  isExploring: boolean;
}

export default function CameraController({
  focusedTarget,
  isExploring,
}: CameraControllerProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 6, 18));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const autoRotateAngle = useRef(0);

  // Default camera position
  useEffect(() => {
    if (!isExploring) return;
    camera.position.set(0, 6, 18);
    camera.lookAt(0, 0, 0);
  }, [camera, isExploring]);

  useFrame((state, delta) => {
    if (!isExploring) return;

    if (focusedTarget) {
      // Move to focused course position
      targetPos.current.set(...focusedTarget.position);
      targetLookAt.current.set(...focusedTarget.lookAt);
    } else {
      // Auto-rotate exploration
      autoRotateAngle.current += delta * 0.08;
      const radius = 18;
      const height = 6;
      targetPos.current.set(
        Math.sin(autoRotateAngle.current) * radius,
        height + Math.sin(autoRotateAngle.current * 0.5) * 1.5,
        Math.cos(autoRotateAngle.current) * radius
      );
      targetLookAt.current.set(0, 0, 0);
    }

    // Smooth interpolation
    camera.position.lerp(targetPos.current, focusedTarget ? 0.03 : 0.01);
    currentLookAt.current.lerp(targetLookAt.current, focusedTarget ? 0.03 : 0.01);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

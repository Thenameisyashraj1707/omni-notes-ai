
import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, useTexture } from '@react-three/drei'
import * as THREE from 'three'

const MovingParticles = () => {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 1000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 15
    positions[i3 + 1] = (Math.random() - 0.5) * 15
    positions[i3 + 2] = (Math.random() - 0.5) * 15

    colors[i3] = Math.random() * 0.5 + 0.5
    colors[i3 + 1] = Math.random() * 0.5 + 0.5
    colors[i3 + 2] = Math.random() * 0.5 + 0.5
  }

  useFrame((state) => {
    if (!particlesRef.current) return
    const t = state.clock.getElapsedTime() * 0.1
    particlesRef.current.rotation.x = Math.sin(t * 0.3) * 0.3
    particlesRef.current.rotation.y = Math.sin(t * 0.2) * 0.3
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

const GlowingSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.2
    meshRef.current.rotation.y += 0.005
    meshRef.current.rotation.z += 0.002
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -3]}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshBasicMaterial color="#6366f1" wireframe={true} transparent opacity={0.5} />
    </mesh>
  )
}

export const AnimatedBackground: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`}>
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <color attach="background" args={['#05071b']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={50} depth={50} count={1000} factor={4} />
        <MovingParticles />
        <GlowingSphere />
      </Canvas>
    </div>
  )
}

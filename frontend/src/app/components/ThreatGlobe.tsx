import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

// Interface for a threat point
interface Threat {
  id: string;
  lat: number;
  lng: number;
  type: string;
  intensity: number;
}

// Helper to convert lat/lng to 3D coordinates
const getCoordinates = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

// Threat Point Component
const ThreatPoint = ({ threat, radius }: { threat: Threat; radius: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => getCoordinates(threat.lat, threat.lng, radius), [threat.lat, threat.lng, radius]);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    // Pulse animation
    if (pulseRef.current) {
      pulseRef.current.scale.x += delta * 2;
      pulseRef.current.scale.y += delta * 2;
      pulseRef.current.scale.z += delta * 2;

      const material = pulseRef.current.material as THREE.MeshBasicMaterial;
      material.opacity -= delta * 0.5;

      if (pulseRef.current.scale.x > 3) {
        pulseRef.current.scale.set(1, 1, 1);
        material.opacity = 0.8;
      }
    }
  });

  return (
    <group position={position}>
      {/* Core Dot */}
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.04 * threat.intensity, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Pulsing Glow */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.05 * threat.intensity, 16, 16]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Tooltip on Hover */}
      {hovered && (
        <Html distanceFactor={10} position={[0, 0, 0.1]} center>
          <div className="bg-slate-900/90 border border-red-500/50 text-white text-xs px-3 py-2 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.5)] backdrop-blur-sm pointer-events-none whitespace-nowrap z-50">
            <div className="font-bold text-red-400 mb-1">Threat Detected</div>
            <div>Type: {threat.type}</div>
            <div className="text-slate-400 text-[10px] mt-1">
              Lat: {threat.lat.toFixed(2)}, Lng: {threat.lng.toFixed(2)}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Earth/Globe Component
const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05; // Slow rotation
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.06; // Clouds rotate slightly faster
    }
  });

  return (
    <group>
      {/* Base Planet */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          color="#1e1b4b" // Dark indigo
          emissive="#1e1b4b"
          emissiveIntensity={0.2}
          shininess={50}
        />
      </mesh>

      {/* Wireframe Overlay for Cyberpunk look */}
      <mesh rotation={[0, 0, 0]}>
         <sphereGeometry args={[2.01, 32, 32]} />
         <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshPhongMaterial
          color="#818cf8"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// Main Scene Component
const Scene = ({ threats }: { threats: Threat[] }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={2} color="#4f46e5" />

      {/* Rotating Group containing Earth and Threats */}
      <group>
        <Earth />
        {threats.map((threat) => (
          <ThreatPoint key={threat.id} threat={threat} radius={2.02} />
        ))}
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Container Component
export default function ThreatGlobe() {
  const [threats, setThreats] = useState<Threat[]>([]);

  // Generate random threats periodically
  useEffect(() => {
    const generateThreat = () => {
      const newThreat: Threat = {
        id: Math.random().toString(36).substr(2, 9),
        lat: Math.random() * 140 - 70, // -70 to 70
        lng: Math.random() * 360 - 180, // -180 to 180
        type: ['Phishing', 'Malware', 'DDoS', 'Data Breach', 'Ransomware'][Math.floor(Math.random() * 5)],
        intensity: Math.random() * 1.5 + 0.5, // 0.5 to 2.0
      };

      setThreats((prev) => {
        const updated = [...prev, newThreat];
        // Keep only last 15 threats to avoid clutter
        if (updated.length > 15) return updated.slice(updated.length - 15);
        return updated;
      });
    };

    // Initial threats
    for(let i=0; i<5; i++) generateThreat();

    const interval = setInterval(generateThreat, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden relative bg-slate-950 border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-indigo-400 font-bold tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          GLOBAL THREAT MONITOR
        </h3>
        <p className="text-slate-500 text-xs mt-1">Live active connections</p>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none flex justify-between text-[10px] text-slate-500 tracking-widest font-mono">
        <div>STATUS: ONLINE</div>
        <div>SYS_NODE: ALPHA_9</div>
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <fog attach="fog" args={['#020617', 4, 10]} />
        <Scene threats={threats} />
      </Canvas>
    </div>
  );
}

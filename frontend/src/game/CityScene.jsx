
import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Building({ position, color, height = 5, variant = 0 }) {
  const width = 5;
  const depth = 5.5;
  const front = position[0] < 0 ? 1 : -1;

  return (
    <group position={position}>
      {/* Main building */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height + 0.12, 0]} castShadow>
        <boxGeometry args={[width + 0.25, 0.25, depth + 0.25]} />
        <meshStandardMaterial color="#E7B98C" />
      </mesh>

      {/* Front windows */}
      {Array.from({ length: Math.max(1, Math.floor(height / 1.7)) })
        .map((_, floor) =>
          [-1.25, 1.25].map((offset, index) => (
            <mesh
              key={`${floor}-${index}`}
              position={[
                front * (width / 2 + 0.025),
                1.3 + floor * 1.55,
                offset,
              ]}
              castShadow
            >
              <boxGeometry args={[0.08, 0.85, 0.75]} />
              <meshStandardMaterial
                color={variant % 2 ? "#174C69" : "#24546B"}
                metalness={0.25}
                roughness={0.3}
              />
            </mesh>
          ))
        )}

      {/* Shop sign */}
      {variant % 2 === 0 && (
        <mesh position={[front * 2.56, 1.2, 0]}>
          <boxGeometry args={[0.18, 0.65, 3.8]} />
          <meshStandardMaterial color="#E89B27" />
        </mesh>
      )}

      {/* Entrance */}
      <mesh position={[front * 2.56, 0.85, 0]}>
        <boxGeometry args={[0.1, 1.7, 0.9]} />
        <meshStandardMaterial color="#69432F" />
      </mesh>
    </group>
  );
}

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 2.2, 7]} />
        <meshStandardMaterial color="#765037" />
      </mesh>

      <mesh position={[0, 2.8, 0]} castShadow>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshStandardMaterial color="#32864A" flatShading />
      </mesh>

      <mesh position={[0.65, 2.6, 0.2]}>
        <icosahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#459B51" flatShading />
      </mesh>
    </group>
  );
}

function StreetLight({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 5, 8]} />
        <meshStandardMaterial color="#55565A" />
      </mesh>

      <mesh position={[0.5, 4.9, 0]}>
        <boxGeometry args={[1.1, 0.13, 0.3]} />
        <meshStandardMaterial
          color="#F6DDA1"
          emissive="#E4B76A"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function Player({ movement }) {
  const player = useRef();
  const body = useRef();
  const leftArm = useRef();
  const rightArm = useRef();
  const leftLeg = useRef();
  const rightLeg = useRef();
  const animationBlend = useRef(0);

  const { camera } = useThree();

  const keys = useRef({});
  const walkTime = useRef(0);
  const currentSpeed = useRef(0);
  const cameraLook = useRef(new THREE.Vector3(0, 1.2, -1.5));

  useEffect(() => {
    const down = (event) => {
      keys.current[event.code] = true;
    };

    const up = (event) => {
      keys.current[event.code] = false;
    };

    const clearKeys = () => {
      keys.current = {};
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clearKeys);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clearKeys);
    };
  }, []);

  useFrame((_, delta) => {
    if (!player.current) return;

    const key = keys.current;

    let x =
      (key.KeyD || key.ArrowRight ? 1 : 0) -
      (key.KeyA || key.ArrowLeft ? 1 : 0) +
      (movement?.x || 0);

    let z =
      (key.KeyS || key.ArrowDown ? 1 : 0) -
      (key.KeyW || key.ArrowUp ? 1 : 0) +
      (movement?.z || 0);

    const moving = Math.abs(x) + Math.abs(z) > 0.05;
    const running = Boolean(key.ShiftLeft || key.ShiftRight);

    const length = Math.sqrt(x * x + z * z);

    if (length > 1) {
      x /= length;
      z /= length;
    }

    // Walking and running speed
    const speed = running ? 8 : 4.5;

    const targetSpeed = moving ? speed : 0;

    currentSpeed.current = THREE.MathUtils.damp(
      currentSpeed.current,
      targetSpeed,
      10,
      delta
    );

    // Character movement with road boundaries
    const nextX = THREE.MathUtils.clamp(
      player.current.position.x + x * currentSpeed.current * delta,
      -4.35,
      4.35
    );

    const nextZ = THREE.MathUtils.clamp(
      player.current.position.z + z * currentSpeed.current * delta,
      -45,
      45
    );

    player.current.position.x = nextX;
    player.current.position.z = nextZ;

    // Smooth character turning
    if (moving) {
      const targetRotation = Math.atan2(x, z);

      player.current.rotation.y = THREE.MathUtils.damp(
        player.current.rotation.y,
        targetRotation,
        12,
        delta
      );
    }

    // Walking and running animation
    const animationSpeed = running ? 13 : 8;

    if (moving) {
      walkTime.current += delta * animationSpeed;
    }

    const gait = moving ? Math.sin(walkTime.current) : 0;

    animationBlend.current = THREE.MathUtils.damp(
      animationBlend.current,
      moving ? 1 : 0,
      8,
      delta
    );

    const animationAmount = animationBlend.current;

    if (leftArm.current && rightArm.current) {
      const swing = gait * 0.55 * animationAmount;

      leftArm.current.rotation.x = swing;
      rightArm.current.rotation.x = -swing;
    }

    if (leftLeg.current && rightLeg.current) {
      const legSwing = gait * 0.65 * animationAmount;

      leftLeg.current.rotation.x = -legSwing;
      rightLeg.current.rotation.x = legSwing;
    }

    // Natural body movement and idle breathing
    if (body.current) {
      const bob = moving
        ? Math.abs(gait) * (running ? 0.12 : 0.07)
        : Math.sin(walkTime.current * 1.5) * 0.015;

      body.current.position.y = THREE.MathUtils.damp(
        body.current.position.y,
        bob,
        12,
        delta
      );
    }

    // Smooth third-person camera
    const cameraTarget = new THREE.Vector3(
      player.current.position.x,
      player.current.position.y + 5,
      player.current.position.z + 8
    );

    camera.position.lerp(
      cameraTarget,
      1 - Math.exp(-5 * delta)
    );

    const lookTarget = new THREE.Vector3(
      player.current.position.x,
      player.current.position.y + 1.2,
      player.current.position.z - 1.5
    );

    cameraLook.current.lerp(
      lookTarget,
      1 - Math.exp(-7 * delta)
    );

    camera.lookAt(cameraLook.current);
  });

  return (
    <group ref={player} position={[0, 0, 0]}>
      <group ref={body}>
        {/* Torso */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.8, 4, 12]} />
          <meshStandardMaterial
            color="#F2E7D5"
            roughness={0.85}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 2.15, 0]} castShadow>
          <sphereGeometry args={[0.3, 20, 20]} />
          <meshStandardMaterial color="#C58E70" />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 2.36, 0]}>
          <sphereGeometry
            args={[0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial color="#292321" />
        </mesh>

        {/* Left arm */}
        <group ref={leftArm} position={[-0.43, 1.7, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.55, 4, 8]} />
            <meshStandardMaterial color="#F2E7D5" />
          </mesh>
        </group>

        {/* Right arm */}
        <group ref={rightArm} position={[0.43, 1.7, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.55, 4, 8]} />
            <meshStandardMaterial color="#F2E7D5" />
          </mesh>
        </group>
      </group>

      {/* Left leg */}
      <group ref={leftLeg} position={[-0.18, 0.85, 0]}>
        <mesh position={[0, -0.34, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.5, 4, 8]} />
          <meshStandardMaterial color="#34445A" />
        </mesh>

        <mesh position={[0, -0.7, -0.1]} castShadow>
          <boxGeometry args={[0.3, 0.18, 0.48]} />
          <meshStandardMaterial color="#E8E0D4" />
        </mesh>
      </group>

      {/* Right leg */}
      <group ref={rightLeg} position={[0.18, 0.85, 0]}>
        <mesh position={[0, -0.34, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.5, 4, 8]} />
          <meshStandardMaterial color="#34445A" />
        </mesh>

        <mesh position={[0, -0.7, -0.1]} castShadow>
          <boxGeometry args={[0.3, 0.18, 0.48]} />
          <meshStandardMaterial color="#E8E0D4" />
        </mesh>
      </group>
    </group>
  );
}

function Crosswalk() {
  return (
    <group position={[0, 0.035, -13]}>
      {Array.from({ length: 10 }).map((_, index) => (
        <mesh
          key={index}
          position={[-4.3 + index * 0.95, 0, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.48, 0.025, 1.8]} />
          <meshStandardMaterial color="#F4F1E9" />
        </mesh>
      ))}
    </group>
  );
}

function CityWorld({ movement }) {
  const buildings = [
    [-10, 0, -7, "#E6B99B", 6],
    [-10, 0, -16, "#E9C7A6", 5],
    [-10, 0, -25, "#D88972", 7],
    [-10, 0, 4, "#D7A17F", 5],
    [10, 0, -7, "#E8C4A3", 6],
    [10, 0, -16, "#D68B70", 7],
    [10, 0, -25, "#E5C2A0", 5],
    [10, 0, 4, "#D9A68D", 6],
  ];

  return (
    <>
      <color attach="background" args={["#9CC9E0"]} />
      <fog attach="fog" args={["#C5D8D9", 35, 85]} />

      <ambientLight intensity={1.5} />

      <directionalLight
        position={[-8, 15, 10]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#C7BDA7" />
      </mesh>

      {/* Road */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial color="#343641" roughness={0.95} />
      </mesh>

      {/* Pavements */}
      {[-6.3, 6.3].map((x) => (
        <mesh
          key={x}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.04, 0]}
          receiveShadow
        >
          <planeGeometry args={[2.6, 100]} />
          <meshStandardMaterial color="#D9D0BB" />
        </mesh>
      ))}

      {/* Kerbs */}
      {[-5.05, 5.05].map((x) => (
        <mesh position={[x, 0.1, 0]} key={x}>
          <boxGeometry args={[0.25, 0.2, 100]} />
          <meshStandardMaterial color="#F4BF21" />
        </mesh>
      ))}

      {/* Road lane markings */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[0, 0.025, -45 + i * 5]}>
          <boxGeometry args={[0.12, 0.025, 2]} />
          <meshStandardMaterial color="#F5F3E9" />
        </mesh>
      ))}

      <Crosswalk />

      {/* Buildings */}
      {buildings.map(([x, y, z, color, height], index) => (
        <Building
          key={index}
          position={[x, y, z]}
          color={color}
          height={height}
          variant={index}
        />
      ))}

      {/* Trees */}
      {[-24, -12, 0, 12, 24].map((z) => (
        <Tree key={`left-${z}`} position={[-7.5, 0, z]} />
      ))}

      {[-20, -8, 4, 16].map((z) => (
        <Tree key={`right-${z}`} position={[7.5, 0, z]} />
      ))}

      {/* Streetlights */}
      {[-22, -4, 14].map((z) => (
        <StreetLight key={`light-${z}`} position={[-5.8, 0, z]} />
      ))}

      <Player movement={movement} />
    </>
  );
}

export default function CityScene({ movement }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 5, 8], fov: 55 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <CityWorld movement={movement} />
    </Canvas>
  );
}
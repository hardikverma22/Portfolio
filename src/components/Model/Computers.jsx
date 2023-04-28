import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import CanvasLoader from "./Loader";

const Model = ({ isMobile, isLandscape, isInView }) => {
  const { scene, animations } = useGLTF("./bitcoin/scene.gltf");

  const mixer = useRef();
  const [action, setAction] = useState();
  const meshRef = useRef();

  useEffect(() => {
    if (scene) {
      mixer.current = new THREE.AnimationMixer(scene);
      const newAction = mixer.current.clipAction(animations[0]);
      setAction(newAction);
    }
  }, [scene, animations]);

  useEffect(() => {
    if (scene && action) {
      if (isInView) {
        action.setLoop(THREE.LoopRepeat);
        action.play();
      } else action.stop();
    }
  }, [scene, isInView, action]);

  useFrame((state, delta) => {
    if (mixer.current && action) {
      mixer.current.update(delta);
      meshRef.current.material.color.set("black");
    }

    // Rotate the model around the Y-axis
    if (scene) {
      scene.rotation.y = Math.sin(state.clock.elapsedTime) * 0.06;
    }
  });

  return (
    <mesh ref={meshRef} position-y={isMobile ? -3 : 0}>
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight
        position={[30, 100, 10]}
        angle={0.12}
        penumbra={1}
        intensity={3}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={15} color="blue" />
      <group position-y={-0.5}>
        <primitive
          object={scene}
          scale={isMobile ? (isLandscape ? 0.7 : 0.8) : 1}
          position={
            isMobile
              ? isLandscape
                ? [0, 1, 0]
                : [0.5, 4, 0]
              : isLandscape
              ? [0, -2, 0]
              : [0, -2, 0]
          }
          rotation={[0, -10, 0]}
        />
      </group>
    </mesh>
  );
};

const ModelCanvas = ({ isLandscape, isInView }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Add a listener for changes to the screen size
    const mediaQuery = window.matchMedia("(max-width: 1090px)");

    // Set the initial value of the `isMobile` state variable
    setIsMobile(mediaQuery.matches);

    // Define a callback function to handle changes to the media query
    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Remove the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <Canvas
      frameloop={isInView ? "always" : "never"}
      shadows
      dpr={[1, 2]}
      camera={{
        position: [10, 5, 20],
        fov: 25,
      }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 3}
          minPolarAngle={Math.PI / 3}
        />
        <Model
          isMobile={isMobile}
          isLandscape={isLandscape}
          isInView={isInView}
        />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default ModelCanvas;

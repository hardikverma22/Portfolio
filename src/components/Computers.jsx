import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, Text, useGLTF } from "@react-three/drei";
import CanvasLoader from "./Loader";

const Computers = ({ isMobile, isMediumScreen }) => {
  const computer = useGLTF("./desktop_pc/scene.gltf");
  console.log({ isMobile: isMobile, isMediumScreen: isMediumScreen });

  const [position, setPosition] = useState([(0, 0.8, -0.7)]);
  const [scale, setScale] = useState(1.5);

  useEffect(() => {
    console.log({ isMobile: isMobile, isMediumScreen: isMediumScreen });
    if (isMobile) setScale(1.5);
    else setScale(0.6);

    if (isMobile) setPosition([0, -3, -2.5]);
    if (isMediumScreen) setPosition([0, 0.8, -0.7]);
    else setPosition([0, -1.25, -0.7]);
  }, [isMobile, isMediumScreen]);

  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />
      <primitive
        object={computer.scene}
        scale={scale}
        position={position}
        rotation={[-0.01, -0.2, -0.1]}
      />
    </mesh>
  );
};

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);

  useEffect(() => {
    // Add a listener for changes to the screen size
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    const mediaQueryForResizing = window.matchMedia("(max-width: 1200px)");

    setIsMediumScreen(mediaQueryForResizing.matches);
    // Set the initial value of the `isMobile` state variable
    setIsMobile(mediaQuery.matches);

    // Define a callback function to handle changes to the media query
    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    const handleMediaQueryForResizingChange = (event) => {
      setIsMediumScreen(event.matches);
    };

    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    mediaQueryForResizing.addEventListener(
      "change",
      handleMediaQueryForResizingChange
    );

    // Remove the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
      mediaQueryForResizing.removeEventListener(
        "change",
        handleMediaQueryForResizingChange
      );
    };
  }, []);

  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, 2]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <Text
          scale={[0.5, 0.4, 1]}
          color="black" // default
          anchorX="center" // default
          anchorY="middle" // default
          rotation={[0.0, 1, 0.0]}
          position={[-1.9, 0, 0]}
        >
          Drag To Rotate
        </Text>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Computers isMobile={isMobile} isMediumScreen={isMediumScreen} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default ComputersCanvas;

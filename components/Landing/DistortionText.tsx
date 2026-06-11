"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Custom shader definition
const DistortionShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform float uVelocity;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Distance from mouse position
      vec2 mouseToUv = uv - uMouse;
      float dist = length(mouseToUv);
      
      // Warping distortion
      if (dist < 0.45) {
        float strength = 1.0 - (dist / 0.45);
        strength = smoothstep(0.0, 1.0, strength);
        
        // Purely dynamic movement-based warp (no static base warp to prevent stationary wiggle)
        float warpStrength = uVelocity * 12.0;
        uv -= mouseToUv * strength * warpStrength;
        
        // Distort with a wave relative to time, scaled purely by velocity
        float waveAmt = uVelocity * 0.6;
        uv.x += sin(uv.y * 14.0 + uTime * 4.0) * strength * waveAmt;
        uv.y += cos(uv.x * 14.0 + uTime * 4.0) * strength * waveAmt;
      }
      
      // Chromatic misalignment (Main color #662222, Shadow offset #6B3F69)
      // Chromatic offset scaling purely with velocity
      float offsetAmt = (uVelocity * 0.7) * (1.0 - smoothstep(0.0, 0.45, dist));
      
      vec2 redOffset = vec2(offsetAmt * 0.7, -offsetAmt * 0.3);
      vec2 purpleOffset = vec2(-offsetAmt * 0.9, offsetAmt * 0.6);
      
      float maskMain = texture2D(uTexture, uv).a;
      float maskRed = texture2D(uTexture, uv + redOffset).a;
      float maskPurple = texture2D(uTexture, uv + purpleOffset).a;
      
      // Colors
      vec3 colorMain = vec3(0.4, 0.133, 0.133);        // #662222
      vec3 colorPurple = vec3(0.42, 0.247, 0.412);    // #6B3F69
      
      // Blend offset masks to simulate misalignment ink layer order
      float mainAlpha = max(maskMain, maskRed);
      vec4 colPurple = vec4(colorPurple, maskPurple * 0.85);
      vec4 colMain = vec4(colorMain, mainAlpha);
      
      vec4 finalColor = mix(colPurple, colMain, colMain.a);
      
      // Keep background transparent where there is no ink text
      if (finalColor.a < 0.01) {
        discard;
      }
      
      gl_FragColor = finalColor;
    }
  `
};

function TextPlane({ texture, aspectRatio }: { texture: THREE.Texture; aspectRatio: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  // Mouse tracking targets
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const shaderMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const velocity = useRef(0);

  // Monitor mouse movements over canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate cursor position in relative texture space (0,0 bottom left to 1,1 top right)
      const rect = window.document.getElementById("webgl-title-container")?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height; // invert y for WebGL
      
      targetMouse.current.set(
        Math.max(0, Math.min(1, x)),
        Math.max(0, Math.min(1, y))
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!materialRef.current) return;

    // React much faster: interpolation factor changed from 0.06 to 0.18
    const prevMouse = shaderMouse.current.clone();
    shaderMouse.current.x += (targetMouse.current.x - shaderMouse.current.x) * 0.18;
    shaderMouse.current.y += (targetMouse.current.y - shaderMouse.current.y) * 0.18;

    // Calculate current velocity based on interpolation distance
    const currentVelocity = prevMouse.distanceTo(shaderMouse.current);
    // Smooth/decay velocity to prevent sudden jumps
    velocity.current += (currentVelocity - velocity.current) * 0.15;

    // Update shader uniforms
    materialRef.current.uniforms.uMouse.value.copy(shaderMouse.current);
    materialRef.current.uniforms.uVelocity.value = velocity.current;
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[10, 10 / aspectRatio]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        vertexShader={DistortionShader.vertexShader}
        fragmentShader={DistortionShader.fragmentShader}
        uniforms={{
          uTexture: { value: texture },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uVelocity: { value: 0 },
          uTime: { value: 0 }
        }}
      />
    </mesh>
  );
}

export default function DistortionText() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [aspectRatio, setAspectRatio] = useState(4);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Draw text to offscreen canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // First measure the text to size the canvas exactly edge-to-edge
      ctx.font = "900 240px 'Helvetica Neue', Helvetica, Arial, sans-serif";
      ctx.letterSpacing = "4px";
      const metrics = ctx.measureText("SNIPECV");
      const textWidth = Math.ceil(metrics.width);
      const textHeight = 240;

      // Tight crop sizing
      canvas.width = textWidth + 16; 
      canvas.height = textHeight + 80;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw SNIPECV Title text centered
      ctx.fillStyle = "#662222";
      ctx.font = "900 240px 'Helvetica Neue', Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "4px";
      ctx.fillText("SNIPECV", canvas.width / 2, canvas.height / 2 + 10);
      
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      setAspectRatio(canvas.width / canvas.height);
      setTexture(tex);
    }
  }, []);

  if (!mounted || !texture) {
    return (
      <div className="text-[#662222] font-sans font-black tracking-widest text-[5rem] sm:text-[8rem] md:text-[10rem] select-none leading-none">
        SNIPECV
      </div>
    );
  }

  return (
    <div 
      id="webgl-title-container" 
      className="relative w-full max-w-[500px] h-[100px] sm:h-[120px] flex items-center justify-center select-none"
    >
      <Canvas 
        orthographic 
        camera={{ 
          left: -5, 
          right: 5, 
          top: 5 / aspectRatio, 
          bottom: -5 / aspectRatio, 
          near: 0.1, 
          far: 1000 
        }}
        style={{ pointerEvents: "none" }}
      >
        <TextPlane texture={texture} aspectRatio={aspectRatio} />
      </Canvas>
    </div>
  );
}

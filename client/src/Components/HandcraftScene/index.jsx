import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HandcraftScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5e6d3); // Warm beige background
    scene.fog = new THREE.Fog(0xf5e6d3, 10, 50);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd4a3, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffaa44, 0.5, 100);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Create handcraft items (geometric shapes representing craft items)
    const craftItems = [];
    const colors = [0x8b6f47, 0xa0826d, 0x6d4a2e, 0x9d7a5a, 0x7a5a3a]; // Earth tones

    // Create pottery/vase shapes
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.CylinderGeometry(
        0.3 + Math.random() * 0.2,
        0.2 + Math.random() * 0.2,
        0.8 + Math.random() * 0.5,
        8
      );
      const material = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        roughness: 0.8,
        metalness: 0.1,
      });
      const item = new THREE.Mesh(geometry, material);
      
      item.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 3 - 1,
        (Math.random() - 0.5) * 10
      );
      item.rotation.y = Math.random() * Math.PI * 2;
      item.castShadow = true;
      item.receiveShadow = true;
      
      // Add rotation speed
      item.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        floatSpeed: 0.01 + Math.random() * 0.01,
        floatAmplitude: 0.1 + Math.random() * 0.2,
        initialY: item.position.y,
      };
      
      scene.add(item);
      craftItems.push(item);
    }

    // Create wooden planks/boards
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BoxGeometry(
        1 + Math.random() * 0.5,
        0.1,
        0.5 + Math.random() * 0.3
      );
      const material = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        roughness: 0.9,
        metalness: 0.05,
      });
      const plank = new THREE.Mesh(geometry, material);
      
      plank.position.set(
        (Math.random() - 0.5) * 12,
        Math.random() * 2 - 1,
        (Math.random() - 0.5) * 12
      );
      plank.rotation.set(
        Math.random() * 0.2,
        Math.random() * Math.PI * 2,
        Math.random() * 0.2
      );
      plank.castShadow = true;
      plank.receiveShadow = true;
      
      plank.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        floatSpeed: 0.008 + Math.random() * 0.008,
        floatAmplitude: 0.08 + Math.random() * 0.15,
        initialY: plank.position.y,
      };
      
      scene.add(plank);
      craftItems.push(plank);
    }

    // Create decorative spheres (beads, buttons)
    for (let i = 0; i < 12; i++) {
      const geometry = new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        roughness: 0.7,
        metalness: 0.2,
      });
      const bead = new THREE.Mesh(geometry, material);
      
      bead.position.set(
        (Math.random() - 0.5) * 15,
        Math.random() * 4 - 2,
        (Math.random() - 0.5) * 15
      );
      bead.castShadow = true;
      bead.receiveShadow = true;
      
      bead.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        floatSpeed: 0.012 + Math.random() * 0.01,
        floatAmplitude: 0.15 + Math.random() * 0.2,
        initialY: bead.position.y,
      };
      
      scene.add(bead);
      craftItems.push(bead);
    }

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8dcc6,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      // Animate craft items
      craftItems.forEach((item) => {
        // Rotation
        item.rotation.y += item.userData.rotationSpeed;
        item.rotation.x += item.userData.rotationSpeed * 0.5;

        // Floating animation
        item.position.y =
          item.userData.initialY +
          Math.sin(frame * item.userData.floatSpeed) *
            item.userData.floatAmplitude;

        // Gentle drift
        item.position.x += Math.sin(frame * 0.005) * 0.001;
        item.position.z += Math.cos(frame * 0.005) * 0.001;
      });

      // Camera gentle movement
      camera.position.x = Math.sin(frame * 0.1) * 0.5;
      camera.position.y = 2 + Math.sin(frame * 0.15) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      craftItems.forEach((item) => {
        item.geometry.dispose();
        item.material.dispose();
      });
      ground.geometry.dispose();
      ground.material.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />;
};

export default HandcraftScene;


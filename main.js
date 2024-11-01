import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


renderer.setSize(window.innerWidth, window.innerHeight);

// Create icosahedron geometry
const geometry = new THREE.IcosahedronGeometry(2, 50, 50);

const material = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec2 vUv;
    varying float vNoise;

    // Classic Perlin 3D Noise by Stefan Gustavson
    vec4 permute(vec4 x) {
        return mod(((x*34.0)+1.0)*x, 289.0);
    }
    vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
    }
    vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
    }

    float snoise(vec3 v) { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        // Permutations
        i = mod(i, 289.0 ); 
        vec4 p = permute( permute( permute( 
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        // Gradients
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }
    
    uniform float uTime;

    varying float vElevation;

    
    void main() {
   vUv = uv;  
   vec4 modelPosition=modelViewMatrix*vec4(position,1.);
   float elevation=snoise(position*.6+uTime*.5)*.3;
   vElevation=elevation;
   modelPosition.xyz+=normal*elevation;
   vec4 projectedPosition=projectionMatrix*modelPosition;
   gl_Position=projectedPosition;
    }
  `,

  fragmentShader: `
  varying vec2 vUv;
varying float vNoise;
varying float vElevation;
uniform float uColorChange;



void main() {
    
    // Create a gradient based on UV coordinates and noise
    // vec3 color1 = vec3(1., 0.5569, 0.702);
    vec4 c1 = vec4(1., 0.8235, 0.8824, 1.);
    vec4 c2 = vec4(1.,.6706,.7804,1.);

   vec4 c3 = vec4(0.9333, 0.8275, 0.7373, 1.0);
    vec4 c4 = vec4(0.902, 0.8725, 0.6824, 1.0);


    float v=smoothstep(-.14,.14,vElevation);
    vec4 colorred = mix(c1,c2,v);
    vec4 coloryellow = mix(c3,c4,v);

    vec4 final = mix(colorred,coloryellow,uColorChange);
    gl_FragColor = final;
}
`,

  uniforms: {
    uTime: { value: 0 },
    uColorChange: { value: 0 }
  }
});

// Create mesh and add to scene
const icosahedron = new THREE.Mesh(geometry, material);
icosahedron.position.y = -2.5;
scene.add(icosahedron);

// Position camera
camera.position.z = 3;



var tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".landing",
    start: "top top",
    end: "bottom center",
    scrub: 2,
    // markers: true,
  }
});

tl.to(
  icosahedron.position,
  {
    y: 0,
    z: -2,
    ease: "power2.inOut",
  },
  "a"
)
  .to(
    material.uniforms.uColorChange,
    {
      value: 1,
      ease: "power2.inOut",
    },
    "a"
  )
  .to(
    ".landing h1",
    {
      opacity: 0,
    },
    "a"
  )
  .to(".landing p", {
    opacity: 1,
  })
  .to(".landing button", {
    opacity: 1,
  });



const clock = new THREE.Clock();
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  //  icosahedron.rotation.x += 0.01;
  //  icosahedron.rotation.y += 0.01;
  // Update controls
  // controls.update();

  // Update time uniform
  material.uniforms.uTime.value = clock.getElapsedTime();

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

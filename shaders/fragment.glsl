
  varying vec2 vUv;
varying float vNoise;
varying float vElevation;

void main() {


    // Create a gradient based on UV coordinates and noise
    vec4 color1 = vec3(0.9608, 0.5137, 0.9765); // Dark blue
    vec4 color2 = vec3(0.8588, 0.7882, 0.8588); // Pink-red

    vec4 c3 = vec4(0.9333, 0.8275, 0.7373, 1.0);
    vec4 c4 = vec4(0.902, 0.7725, 0.6824, 1.0);


    float v = smoothstep(.1,.9,vElevation);
    // Mix colors based on UV and noise
    vec4 finalColor = mix(color1, color2, vUv.y + vNoise);
    
    // Add some subtle pulsing
    finalColor *= 0.8 + 0.2 * sin(vUv.x * 10.0);
    
    gl_FragColor = vec4(finalColor, 1.0);
}

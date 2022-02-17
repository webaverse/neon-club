import * as THREE from 'three'

const glsl = (x) => x

const neonClubEmissiveVertexShader = `
    ${THREE.ShaderChunk.common}
    varying vec2 vUv;
    uniform vec2 uResolution;
    uniform float uTime;

    ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
    void main() {
      vUv = uv;
      vec3 newPosition = position;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;

      gl_Position = projectedPosition;
      ${THREE.ShaderChunk.logdepthbuf_vertex}
    }
  `

const neonClubEmissiveFragmentShader = `
  precision highp float;
  precision highp int;
  #define PI 3.1415926535897932384626433832795
  ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform vec3 uMood;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uBeat;

  #define tau 6.2831853
    
 
  float circ(vec2 p) {
    float r = length(p);
    r = log(sqrt(r));
    return abs(mod(r * 4., tau) - 3.14) * 3. + .2;
  
  }

  // #define SRGB_TO_LINEAR(c) pow((c), vec3(2.2))
  // #define LINEAR_TO_SRGB(c) pow((c), vec3(1.0 / 2.2))
  // #define SRGB(r, g, b) SRGB_TO_LINEAR(vec3(float(r), float(g), float(b)) / 255.0)
  
  // const vec3 COLOR0 = SRGB(255, 0, 0) ;
  // const vec3 COLOR1 = SRGB(10, 80, 255) ;
  
  // // Gradient noise from Jorge Jimenez's presentation:
  // // http://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare
  // float gradientNoise(in vec2 uv) {
  //   const vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
  //   return fract(magic.z * fract(dot(uv, magic.xy)));
  // }


  void main() {
    // vec2 a = vec2(0.); // First gradient point.
    // vec2 b = gl_FragCoord.xy; // Second gradient point.
  
    //   // Calculate interpolation factor with vector projection.
    // vec2 ba = b - a;
    // float t = dot(gl_FragCoord.xy - a, ba) / dot(ba, ba);
    //   // Saturate and apply smoothstep to the factor.
    // t = smoothstep(0.0, 1.0, clamp(t, 0.0, 1.0));
    //   // Interpolate.
    // vec3 gradiantColor = mix(COLOR0, COLOR1, t)*3.;
  
    //   // Convert color from linear to sRGB color space (=gamma encode).
    // gradiantColor = LINEAR_TO_SRGB(gradiantColor);
  
    //   // Add gradient noise to reduce banding.
    // gradiantColor += (1.0 / 255.0) * gradientNoise(gl_FragCoord.xy) - (0.5 / 255.0);
  
    vec2 p = vec2(vUv.x - 0.5, vUv.y - 0.5);

    float rz = vUv.x + 1.;
  
        //rings
    p /= exp(mod(uTime/10000., 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679));
    // p /= exp(mod(1.2 , 3.14159 ));
    rz /= pow(abs((0. - circ(p))), .5);
  
    // rz = mix(1., rz , clamp(abs(sin(uTime/100.)) , 0.,.25));
    // vec3 col = vec3(.2 + uBeat / 2000., 0.4, 1.) / rz;
    // vec3 col = gradiantColor / rz;
    vec3 moodColor = uMood;
    vec3 col = moodColor * rz * 3.;
    gl_FragColor = vec4(col , 1.);
  ${THREE.ShaderChunk.logdepthbuf_fragment}
  }
`

export {
  neonClubEmissiveVertexShader,
  neonClubEmissiveFragmentShader,
}

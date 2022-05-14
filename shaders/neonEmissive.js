import * as THREE from 'three'

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

  void main() {
    float time = uTime/1000.;
    vec2 p = vec2(vUv.x - 0.5, vUv.y - 0.5);

    float rz = vUv.x + 1.;
  
    //rings
    p /= exp(mod(time, 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679));
    // p /= exp(mod(1.2 , 3.14159 ));
    rz /= pow(abs((0. - circ(p))), .5);
    vec3 moodColor = uMood;
    vec3 col = moodColor * rz * 4.;
    col.r += uBeat/8.;
    col.g += uBeat/10.;
    col.b += uBeat/9.;
    gl_FragColor = vec4(col , 1.);
  ${THREE.ShaderChunk.logdepthbuf_fragment}
  }
`

export { neonClubEmissiveVertexShader, neonClubEmissiveFragmentShader }

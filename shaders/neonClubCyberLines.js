import * as THREE from 'three'

const neonClubCyberLinesVertex = `
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

const neonClubCyberLinesFragment = `
  precision highp float;
  precision highp int;
  #define PI 3.1415926535897932384626433832795
  ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform vec3 uMood;
  uniform sampler2D uTexture;
  uniform sampler2D uBeatMap1;
  uniform sampler2D uBeatMap2;
  uniform float uTime;
  uniform float uBeat1;
  uniform float uBeat2;

  #define tau 6.2831853

  float circ(vec2 p) {
    float r = length(p);
    r = log(sqrt(r));
    return abs(mod(r * 4., tau) - 3.14) * 3. + .2;
  
  }
  
  void main() {
    float time = uTime/500.;
    vec2 uv = vUv;
    // uv *= 2.;
    vec4 texture1 = vec4(texture2D(uTexture, uv));
    vec4 texture2 = vec4(texture2D(uBeatMap1, uv));
    vec4 texture3 = vec4(texture2D(uBeatMap2, uv));
    vec2 p = vec2(vUv.x - 0.5, vUv.y - 0.5);

    float rz = vUv.x + 1.;
  
    //rings
    p /= exp(mod(time, 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679));
    // p /= exp(mod(1.2 , 3.14159 ));
    rz /= pow(abs((0. - circ(p))), .5);
    vec3 moodColor = uMood;
    vec3 col = moodColor * rz * 2.;
    col *= texture1.a;
    // if(uBeat1 <= 0.33 && uBeat1 > 0.){
    //   col += texture2.r;
    // }
    // if(uBeat1 <= 0.66 && uBeat1 > 0.33){
    //   col += texture2.g;
    // }
    // if(uBeat1 <= 1. && uBeat1 > 0.66){
    //   col += texture2.b;
    // }
    // if(uBeat2 <= 0.33 && uBeat2 > 0.){
    //   col += texture3.r;
    // }
    // if(uBeat2 <= 0.66 && uBeat2 > 0.33){
    //   col += texture3.g;
    // }
    // if(uBeat2 <= 1. && uBeat2 > 0.66){
    //   col += texture3.b;
    // }
    gl_FragColor = vec4(col , 1.) ;
  ${THREE.ShaderChunk.logdepthbuf_fragment}
  }
`

export { neonClubCyberLinesVertex, neonClubCyberLinesFragment }

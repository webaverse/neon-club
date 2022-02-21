import * as THREE from 'three'

const masterPieceParticlesVertex = `
      ${THREE.ShaderChunk.common}
      varying vec2 vUv;
      varying vec3 vPattern;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uBeat;
      uniform float uSize;
      uniform sampler2D uTexture;
      


${THREE.ShaderChunk.logdepthbuf_pars_vertex}
void main() {

  vec3 newPosition = position;
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.);
  // gl_Position = projectedPosition;
  gl_PointSize = uSize * fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  ${THREE.ShaderChunk.logdepthbuf_vertex}
}
    `

const masterPieceParticlesFragment = `
  precision highp float;
  precision highp int;
  #define PI 3.1415926535897932384626433832795
  ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
  varying vec3 vPattern;
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uBeat;
  uniform sampler2D uTexture;
  
  void main() {
    vec3 t = vec3(0.2784, 0.5529, 0.9137) / vec3(0.3765, 0.6118, 0.4863) / 5. * vec3(texture2D(uTexture, vUv));
    t/=2.;
    t.r += uBeat/6.;
    t.g += uBeat/7.;
    t.b += uBeat/8.;
    t *= 0.25,distance(vUv , vec2(0.5))-0.25;
    vec3 col = vec3(pow(1. - distance(gl_PointCoord, vec2(.5)), 10.)) * t;

    gl_FragColor = vec4(col, 1.);
  // gl_FragColor = vec4(vec3(pow(1. - distance(gl_PointCoord, vec2(.5)) , 10.))  * vec3(0.2784, 0.5529, 0.9137) / vec3(0.3765, 0.6118, 0.4863)/5. * vec3(texture2D(uTexture , vUv)) ,1.);
  ${THREE.ShaderChunk.logdepthbuf_fragment}
  }
`

export { masterPieceParticlesVertex, masterPieceParticlesFragment }

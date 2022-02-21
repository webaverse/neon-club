import * as THREE from 'three'

const neonParticlesVertexShader = `
      ${THREE.ShaderChunk.common}
      varying vec2 vUv;
      varying vec3 vPattern;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uBeat;
      uniform float uSize;
      uniform sampler2D uTexture;
      
      // #define PI 3.14159265358979
      #define MOD3 vec3(.1031,.11369,.13787)
      
      vec3 hash33(vec3 p3) {
        p3 = fract(p3 * MOD3);
        p3 += dot(p3, p3.yxz + 19.19);
        return -1.0 + 2.0 * fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
      }
      
      float pnoise(vec3 p) {
        vec3 pi = floor(p);
        vec3 pf = p - pi;
      
        vec3 w = pf * pf * (3. - 2.0 * pf);
      
        return mix(mix(mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))), dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))), w.x), mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))), dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))), w.x), w.z), mix(mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))), dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))), w.x), mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))), dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))), w.x), w.z), w.y);
      }
      
      const mat2 myt = mat2(.12121212, .13131313, -.13131313, .12121212);
      const vec2 mys = vec2(1e4, 1e6);
      
      vec2 rhash(vec2 uv) {
        uv *= myt;
        uv *= mys;
        return fract(fract(uv / mys) * uv);
      }
      
      vec3 hash(vec3 p) {
        return fract(sin(vec3(dot(p, vec3(1.0, 57.0, 113.0)), dot(p, vec3(57.0, 113.0, 1.0)), dot(p, vec3(113.0, 1.0, 57.0)))) *
          43758.5453);
      }
      
      float vornoi1D(const in vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
      
        float id = 0.0;
        vec2 res = vec2(100.0);
        for(int k = -1; k <= 1; k++) {
          for(int j = -1; j <= 1; j++) {
            for(int i = -1; i <= 1; i++) {
              vec3 b = vec3(float(i), float(j), float(k));
              vec3 r = vec3(b) - f + hash(p + b);
              float d = dot(r, r);
      
              float cond = max(sign(res.x - d), 0.0);
              float nCond = 1.0 - cond;
      
              float cond2 = nCond * max(sign(res.y - d), 0.0);
              float nCond2 = 1.0 - cond2;
      
              id = (dot(p + b, vec3(1.0, 2.0, 3.0)) * cond) + (id * nCond);
              res = vec2(d, res.x) * cond + res * nCond;
      
              res.y = cond2 * d + nCond2 * res.y;
            }
          }
        }
      
        return res.y;
      }
      vec3 vornoi3D(const in vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
      
        float id = 0.0;
        vec2 res = vec2(100.0);
        for(int k = -1; k <= 1; k++) {
          for(int j = -1; j <= 1; j++) {
            for(int i = -1; i <= 1; i++) {
              vec3 b = vec3(float(i), float(j), float(k));
              vec3 r = vec3(b) - f + hash(p + b);
              float d = dot(r, r);
      
              float cond = max(sign(res.x - d), 0.0);
              float nCond = 1.0 - cond;
      
              float cond2 = nCond * max(sign(res.y - d), 0.0);
              float nCond2 = 1.0 - cond2;
      
              id = (dot(p + b, vec3(1.0, 2.0, 3.0)) * cond) + (id * nCond);
              res = vec2(d, res.x) * cond + res * nCond;
      
              res.y = cond2 * d + nCond2 * res.y;
            }
          }
        }
      
        return vec3(sqrt(res), abs(id));
      }
      
      mat2 get2dRotateMatrix(float _angle) {
        return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
      }
      
      #define tau 6.2831853
      
      mat2 makem2(in float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat2(c, -s, s, c);
      }
      float noise(in vec2 x) {
        return texture(uTexture, x * .01).x;
      }
      
      float fbm(in vec2 p) {
        float z = 2.;
        float rz = 0.;
        vec2 bp = p;
        for(float i = 1.; i < 6.; i++) {
          rz += abs((noise(p) - 0.5) * 2.) / z;
          z = z * 2.;
          p = p * 2.;
        }
        return rz;
      }
      
      float dualfbm(in vec2 p) {
          //get two rotated fbm calls and displace the domain
        vec2 p2 = p * .7;
        vec2 basis = vec2(fbm(p2 - uTime * 1.6), fbm(p2 + uTime * 1.7));
        basis = (basis - .5) * .2;
        p += basis;
      
        //coloring
        return fbm(p * makem2(uTime * 0.2));
      }
      
      float circ(vec2 p) {
        float r = length(p);
        r = log(sqrt(r));
        return abs(mod(r * 4., tau) - 3.14) * 3. + .2;
      
      }
      
       float random2d(vec2 coord){
          return fract(sin(dot(coord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

${THREE.ShaderChunk.logdepthbuf_pars_vertex}
void main() {
  float angle1 = sin(position.y * 2.) * 2. * sin(uTime/100000000.*uBeat);
  vec3 newPosition = position;
  newPosition.xz += fract(sin(dot(uv, vec2(12.9898, 78.233))) * 10.) / 4.;
  newPosition.xz *= get2dRotateMatrix(angle1);
  float angle2 = sin(newPosition.z) * 2.;
  newPosition.xy *= get2dRotateMatrix(angle2);
  newPosition.y += uBeat;
  vUv = uv;

  vec2 p = uv;

  float rz = dualfbm(uv);
  p /= exp(mod(uTime * 10., 3.14159));
  rz *= pow(abs((0.1 - circ(p ))), .9);
  // newPosition *= rz;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  // projectedPosition.xz = modelViewMatrix.xz * rotateMatrix;
  // vPattern =  vec3(1. - step(.5 , distance(gl_PointCoord, vec2(.5))));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.);
  // gl_Position = projectedPosition;
  gl_PointSize = uSize * fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  // gl_PointSize *= 1. / -viewPosition.z;
  ${THREE.ShaderChunk.logdepthbuf_vertex}
}
    `

const neonParticlesFragmentShader = `
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
    float circ =pow(1. - distance(gl_PointCoord, vec2(.5)), 10.);
    vec3 col = circ * t;
    // if(uBeat >= 0.3) {
    //   col.r += 0.008 ;
    // }
    // if(uBeat >= 0.175 && uBeat <= 0.2) {
    //   col.r += 0.008 ;
    // }
    // if(uBeat >= 0.19 && uBeat <= 0.22) {
    //   col.r += 0.008 ;
    // }
    // col.r += sin(uBeat*1000.)/100.;
    // col.r += uBeat/10. ;
    // gl_FragColor = vec4(col, circ);

    gl_FragColor = vec4(col, 1.);
  // gl_FragColor = vec4(vec3(pow(1. - distance(gl_PointCoord, vec2(.5)) , 10.))  * vec3(0.2784, 0.5529, 0.9137) / vec3(0.3765, 0.6118, 0.4863)/5. * vec3(texture2D(uTexture , vUv)) ,1.);
  ${THREE.ShaderChunk.logdepthbuf_fragment}
  }
`

export { neonParticlesVertexShader, neonParticlesFragmentShader }

import * as THREE from 'three'


const cloudVertex = ``



const cloudFragment =`
${THREE.ShaderChunk.logdepthbuf_pars_fragment}
void main(){
    uniform vec2 uResolution;
    uniform float uTime;
    vec3 col = (1.0, 1.0, 1.0);


    gl_FragColor = vec4(col, 1.);
}
${THREE.ShaderChunk.logdepthbuf_fragment}
`


export { cloudFragment, cloudVertex }
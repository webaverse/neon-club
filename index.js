/* eslint-disable arrow-parens */
/* eslint-disable semi */
/* eslint-disable object-curly-spacing */
/* eslint-disable linebreak-style */
import * as THREE from 'three'
import metaversefile from 'metaversefile'
import { getRenderer, getComposer, camera } from '../../renderer'
import { Earthquake } from './passes/Earthquake'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import {
  neonClubEmissiveFragmentShader,
  neonClubEmissiveVertexShader,
} from './shaders/neonEmissive'
import {
  neonParticlesFragmentShader,
  neonParticlesVertexShader,
} from './shaders/neonParticles'

import {
  createAudio,
  getAudio,
  getThreshold,
  logMood,
  updateBeatFrequencies,
  updateMoodArray,
} from './audio'

const { useApp, useLoaders, useFrame, useCleanup, usePhysics } = metaversefile

const baseUrl = import.meta.url.replace(/(\/)[^\/\/]*$/, '$1')

let beatFactor

let physicsIds = []
let emasiveArray = []
let neonClubEmissiveMaterial
let neonClubCyberLinesMaterial
let elapsedTime

export default (e) => {
  const app = useApp()
  app.name = 'visualizer'

  // const scene = useScene()
  const composer = getComposer()
  const physics = usePhysics()
  const gl = getRenderer()
  gl.outputEncoding = THREE.sRGBEncoding
  const disposeMaterial = (obj) => {
    if (obj.material) {
      obj.material.dispose()
    }
  }
  app.traverse(disposeMaterial)
  neonClubEmissiveMaterial = new THREE.ShaderMaterial({
    vertexShader: neonClubEmissiveVertexShader,
    fragmentShader: neonClubEmissiveFragmentShader,
    vertexColors: true,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uMood: { value: new THREE.Vector3(0.3, 0.5, 1) },
      uBeat: { value: 0 },
      uTexture: { value: null },
    },
  })

  const loadModel = (params) => {
    return new Promise((resolve, reject) => {
      const { gltfLoader } = useLoaders()
      const { dracoLoader } = useLoaders()

      gltfLoader.setDRACOLoader(dracoLoader)

      gltfLoader.load(params.filePath + params.fileName, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            // checking if the child is a wall
            if (
              child.material.name === 'Wall' ||
              child.material.name === 'Wall.001' ||
              child.material.name === 'Wall 2'
            ) {
              neonClubCyberLinesMaterial = child.material
              const emissiveMap = new THREE.TextureLoader().load(
                baseUrl + 'textures/wall_Emissive.png'
              )
              emissiveMap.wrapS = emissiveMap.wrapT = THREE.RepeatWrapping
              emissiveMap.flipY = false
              neonClubCyberLinesMaterial.emissiveIntensity = 0.4
              neonClubCyberLinesMaterial.emissive = new THREE.Color('#e4ecf7')
              neonClubCyberLinesMaterial.emissiveMap = emissiveMap
            }

            const physicsId = physics.addGeometry(child)
            physicsIds.push(physicsId)

            if (child.material.name === 'emasive') {
              emasiveArray.push(child)
            }
            emasiveArray.forEach((child) => {
              child.material = neonClubEmissiveMaterial
              child.layers.toggle(BLOOM_SCENE)
            })
          }
        })
        resolve(gltf.scene)
      })
    })
  }

  const neonClubInfo = {
    fileName: 'neonclub_interior_V1_dream.glb',
    filePath: '/',
  }
  const neonClub = loadModel(neonClubInfo)

  Promise.all([neonClub]).then((values) => {
    values.forEach((model) => {
      app.add(model)
    })
  })

  const neonParticles = new THREE.Points(
    new THREE.BoxBufferGeometry(1, 1, 1, 200, 200),
    new THREE.ShaderMaterial({
      vertexShader: neonParticlesVertexShader,
      fragmentShader: neonParticlesFragmentShader,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      // wireframe:true,
      transparent: true,
      // side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uBeat: { value: 0.5 },
        uResolution: { value: new THREE.Vector2() },
        uTexture: { value: null },
        uSize: { value: 15 * gl.getPixelRatio() },
      },
    })
  )

  new THREE.TextureLoader().load(
    'https://res.cloudinary.com/dqakam2xt/image/upload/v1618858417/large_vtj9je.jpg',
    (texture) => {
      neonParticles.material.uniforms.uTexture.value = texture
      neonClubEmissiveMaterial.uniforms.uTexture.value = texture
    }
  )

  neonParticles.position.set(-0.008638, 135.57, 6.5135)
  // app.add(neonParticles)

  // effects
  const renderScene = new RenderPass(app, camera)
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,
    0.4,
    0.4
  )
  const bloomComposer = new EffectComposer(gl)
  bloomComposer.renderToScreen = false
  bloomComposer.addPass(renderScene)
  bloomComposer.addPass(bloomPass)
  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: `
      varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}
      `,
      fragmentShader: `
      uniform sampler2D baseTexture;
			uniform sampler2D bloomTexture;
			varying vec2 vUv;
			void main() {
				gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
			}
      `,
    }),
    'baseTexture'
  )
  const earthquakePass = new Earthquake()
  composer.addPass(earthquakePass)
  composer.addPass(finalPass)

  // selective bloom

  const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
  const materials = {}
  const ENTIRE_SCENE = 0
  const BLOOM_SCENE = 1
  const bloomLayer = new THREE.Layers()
  bloomLayer.set(BLOOM_SCENE)

  const darkenNonBloomed = (obj) => {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      materials[obj.uuid] = obj.material
      obj.material = darkMaterial
    }
  }
  const restoreMaterial = (obj) => {
    if (materials[obj.uuid]) {
      obj.material = materials[obj.uuid]
      delete materials[obj.uuid]
    }
  }

  const renderBloom = (mask) => {
    if (mask === true) {
      app.traverse(darkenNonBloomed)
      bloomComposer.render()
      app.traverse(restoreMaterial)
    } else {
      camera.layers.set(BLOOM_SCENE)
      bloomComposer.render()
      camera.layers.set(ENTIRE_SCENE)
    }
  }

  // creating audio with space bar click
  const audioTrackInformation = {
    source: baseUrl + 'tracks/music.wav',
    autoPlay: true,
  }
  document.body.onkeyup = (e) => {
    if (e.code === 'Space') {
      createAudio(audioTrackInformation)
    }
  }

  useFrame(({ timestamp }) => {
    elapsedTime = timestamp
    const threshold = getThreshold()
    updateMoodArray()
    logMood()
    if (neonClub) {
      neonClubEmissiveMaterial.uniforms.uTime.value = elapsedTime / 100
      neonClubEmissiveMaterial.uniforms.uBeat.value = beatFactor
      const moodChanger = (threshold + 1) / 900
      const moodChangerColor = [
        moodChanger + 0.1,
        0.3 + moodChanger / 10,
        Math.abs(0.8 - moodChanger),
      ]
      if (neonClubCyberLinesMaterial) {
        neonClubCyberLinesMaterial.emissiveIntensity = 0.5 - moodChanger / 10
        neonClubCyberLinesMaterial.emissive = new THREE.Color(
          ...moodChangerColor
        )
        neonClubCyberLinesMaterial.needsUpdate = true
      }
      neonClubEmissiveMaterial.uniforms.uMood.value = new THREE.Vector3(
        ...moodChangerColor
      )
      console.log(moodChanger)
    }
    // shaking the scene with beat
    earthquakePass.factor = beatFactor / 2100

    beatFactor = updateBeatFrequencies()
    renderBloom(true)
  })
  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId)
    }
  })

  return app
}

import { checkArrayEqualElements } from '../utils'

let audio = {}
let audioHasBeenCreated = false
let source
let volumeControl
let analyzer
let audioContext
let audioContextHasBeenInitialized = false
let mood = 'silence'
let moodArray = []
let threshold = 10

// audio

const setupAudioContext = (audio) => {
  if (audioContextHasBeenInitialized) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  } else {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    source = audioContext.createMediaElementSource(audio)
    volumeControl = audioContext.createGain()
    analyzer = audioContext.createAnalyser()
    source.connect(volumeControl)
    analyzer.connect(audioContext.destination)
    volumeControl.connect(analyzer)
    audioContextHasBeenInitialized = true
  }
}

export const createAudio = ({ source, volume, autoPlay, currentTime }) => {
  if (!audioHasBeenCreated) {
    audio = new Audio()
    console.log('Audio is created')
    // audio.src =
    //   'https://res.cloudinary.com/musixdevelop/video/upload/track-audios/Sad.mp3'
    // audio.src =
    // "https://res.cloudinary.com/musixdevelop/video/upload/track-audios/DontLetMeDown.mp3"
    // audio.src = '/Ping 2.mp3'
    // audio.src = '/vocals.wav'
    audio.src = source
    audio.currentTime = currentTime || 0
    audio.volume = volume || 1
    audio.crossOrigin = 'anonymous'
    document.body.appendChild(audio)
    setupAudioContext(audio)
    if (autoPlay) {
      audio.play()
    }
    audioHasBeenCreated = true
  }
}
export const getAudioFrequencies = (freqData) => {
  // let frequency = freqData[20]

  // let threshold = 50 // vocals
  // let threshold = 5 // beat
  let freqDataActive = []

  // if (Math.abs(threshold - lastThreshold) > 30) {
  //   accelerator = 2
  // } else {
  //   accelerator = 1
  // }

  //   lastThreshold = threshold

  for (let i = 0; i < freqData.length; i++) {
    freqDataActive.push(freqData[i])
    if (freqData[i] === 0 && i !== 0) {
      threshold = i - 1
      break
    }
  }

  let average
  let sum = 0
  // let stageNumber = freqDataActive.length
  let startingPoint = 0
  let stageNumber = freqDataActive.length
  for (let i = startingPoint; i < stageNumber; i++) {
    sum += freqDataActive[i]
    if (i == stageNumber - 1) {
      average = sum / stageNumber
    }
  }

  if (threshold == 0) {
    mood = 'silence'
  }
  if (threshold < 0 && threshold <= 50) {
    mood = 'superLow'
  }
  if (threshold < 50 && threshold <= 100) {
    mood = 'low'
  }
  if (threshold < 100 && threshold <= 150) {
    mood = 'mid'
  }
  if (threshold < 150 && threshold <= 200) {
    mood = 'high'
  }
  if (threshold < 200) {
    mood = 'superHigh'
  }

  const frequency = freqData[Math.round(10)]

  // let frequency = (average * 255) / 150 * 3
  // console.log(average)
  return frequency > 200 ? frequency / 0.5 : frequency / 1.5
  // beatFactor = frequency > 140 ? frequency / 0.5 : frequency / 1.5
}

export const updateMoodArray = () => {
  moodArray.push(mood)
}

export const logMood = () => {
  if (checkArrayEqualElements(moodArray)) {
    // console.log(lastTen)
    // currentMood = moodArray.slice(-1)[0]
    // console.log(moodArray.slice(-1)[0])
  }
  moodArray = []
}

export const getAudio = ({ createOnCall }) => {
  if (createOnCall && !audio) {
    createAudio()
  }
  return audio
}

export const getThreshold = () => {
  return threshold
}

export const updateBeatFrequencies = () => {
  if (analyzer) {
    const freqData = new Uint8Array(analyzer.frequencyBinCount)
    analyzer.getByteFrequencyData(freqData)
    return getAudioFrequencies(freqData)
  }
}

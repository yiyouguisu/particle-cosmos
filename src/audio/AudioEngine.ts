export class AudioEngine {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private enabled = true
  private eventTimer: ReturnType<typeof setTimeout> | null = null
  private melodyTimer: ReturnType<typeof setTimeout> | null = null
  private lastMelodyNote = -1
  private noiseBuffer: AudioBuffer | null = null
  private reverbSend: GainNode | null = null

  init(): void {
    if (this.context) {
      // Context exists but may be suspended — always try to resume on user gesture
      this.context.resume()
      return
    }

    try {
      this.context = new AudioContext()
      // Always call resume — on some browsers the context starts suspended
      // even within user gesture handlers. Calling resume() is a no-op if already running.
      this.context.resume()

      this.masterGain = this.context.createGain()
      this.masterGain.gain.value = 0
      this.masterGain.connect(this.context.destination)

      this.createNoiseBuffer()
      this.buildReverb()
      this.startAmbient()
    } catch {
      this.context = null
    }
  }

  private createNoiseBuffer(): void {
    if (!this.context) return
    const sr = this.context.sampleRate
    const len = sr * 4 // 4 seconds to reduce audible looping
    this.noiseBuffer = this.context.createBuffer(1, len, sr)
    const d = this.noiseBuffer.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  }

  private createNoise(): AudioBufferSourceNode | null {
    if (!this.context || !this.noiseBuffer) return null
    const s = this.context.createBufferSource()
    s.buffer = this.noiseBuffer
    s.loop = true
    return s
  }

  // Soft-clip waveshaper: adds odd harmonics for warmth
  private createWaveshaper(): WaveShaperNode | null {
    if (!this.context) return null
    const ws = this.context.createWaveShaper()
    const n = 256
    const curve = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1
      curve[i] = Math.tanh(x * 1.5)
    }
    ws.curve = curve
    ws.oversample = '2x'
    return ws
  }

  // Multi-tap feedback delay network for spatial depth
  private buildReverb(): void {
    if (!this.context || !this.masterGain) return

    this.reverbSend = this.context.createGain()
    this.reverbSend.gain.value = 1.0

    const taps = [
      { time: 0.41, fb: 0.35, lpFreq: 2200 },
      { time: 0.67, fb: 0.30, lpFreq: 1800 },
      { time: 1.09, fb: 0.22, lpFreq: 1400 },
      { time: 1.73, fb: 0.15, lpFreq: 1000 },
    ]

    for (const tap of taps) {
      const delay = this.context.createDelay(3.0)
      delay.delayTime.value = tap.time

      const lp = this.context.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = tap.lpFreq
      lp.Q.value = 0.5

      const fb = this.context.createGain()
      fb.gain.value = tap.fb

      this.reverbSend.connect(delay)
      delay.connect(lp)
      lp.connect(fb)
      fb.connect(delay)
      lp.connect(this.masterGain)
    }

    // Dry pass-through
    const dry = this.context.createGain()
    dry.gain.value = 0.7
    this.reverbSend.connect(dry)
    dry.connect(this.masterGain)
  }

  private startAmbient(): void {
    if (!this.context || !this.masterGain) return

    const now = this.context.currentTime

    this.startFmDrone(now)
    this.startResonantTexture(now)
    this.startSubBass(now)
    this.scheduleCosmicEvent()
    this.scheduleMelodyNote()

    // Fade in over 5 seconds
    this.masterGain.gain.setValueAtTime(0, now)
    this.masterGain.gain.linearRampToValueAtTime(
      this.enabled ? 0.35 : 0,
      now + 5,
    )
  }

  // === FM Drone: 3 voices with detuned unison ===
  // FM synthesis creates rich, evolving timbres — carrier frequency is
  // modulated by another oscillator, and an LFO slowly sweeps the
  // modulation depth so the timbre continuously morphs.
  private startFmDrone(now: number): void {
    if (!this.context || !this.masterGain) return

    const voices = [
      { freq: 55, modRatio: 1.0, depthRange: [20, 80], cycleSec: 70, vol: 0.06, lp: 500, detune: 5 },
      { freq: 82.5, modRatio: 2.0, depthRange: [10, 60], cycleSec: 55, vol: 0.04, lp: 600, detune: 4 },
      { freq: 220, modRatio: 3.0, depthRange: [15, 100], cycleSec: 45, vol: 0.015, lp: 900, detune: 6 },
    ]

    for (const v of voices) {
      // FM modulator
      const mod = this.context.createOscillator()
      mod.type = 'sine'
      mod.frequency.value = v.freq * v.modRatio

      // Modulation depth (Hz deviation on carrier)
      const modGain = this.context.createGain()
      const depthCenter = (v.depthRange[0] + v.depthRange[1]) / 2
      const depthSwing = (v.depthRange[1] - v.depthRange[0]) / 2
      modGain.gain.value = depthCenter

      // LFO sweeps mod depth → timbre evolves over time
      const depthLfo = this.context.createOscillator()
      depthLfo.type = 'sine'
      depthLfo.frequency.value = 1 / v.cycleSec
      const depthLfoScale = this.context.createGain()
      depthLfoScale.gain.value = depthSwing
      depthLfo.connect(depthLfoScale)
      depthLfoScale.connect(modGain.gain)

      mod.connect(modGain)
      depthLfo.start(now)
      mod.start(now)

      // Slow drift on modulator pitch for extra organic movement
      const modDrift = this.context.createOscillator()
      modDrift.type = 'sine'
      modDrift.frequency.value = 1 / 90
      const modDriftScale = this.context.createGain()
      modDriftScale.gain.value = 0.5
      modDrift.connect(modDriftScale)
      modDriftScale.connect(mod.frequency)
      modDrift.start(now)

      // 3 detuned carriers (unison spread) per voice
      const detunes = [-v.detune, 0, v.detune]
      for (const dt of detunes) {
        const carrier = this.context.createOscillator()
        carrier.type = 'sine'
        carrier.frequency.value = v.freq
        carrier.detune.value = dt

        // FM connection: modulator → carrier frequency
        modGain.connect(carrier.frequency)

        const lp = this.context.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = v.lp
        lp.Q.value = 0.7

        const ws = this.createWaveshaper()

        const gain = this.context.createGain()
        gain.gain.value = v.vol / 3

        carrier.connect(lp)
        if (ws) {
          lp.connect(ws)
          ws.connect(gain)
        } else {
          lp.connect(gain)
        }
        gain.connect(this.masterGain)
        carrier.start(now)
      }
    }
  }

  // === Resonant Texture: noise through harmonically-tuned filter bank ===
  // Instead of raw white noise, noise is shaped through multiple resonant
  // bandpass filters tuned to harmonic intervals, creating "tonal noise"
  // that sounds like cosmic radiation with pitch content.
  private startResonantTexture(now: number): void {
    if (!this.context || !this.masterGain) return

    const noise = this.createNoise()
    if (!noise) return

    const filters = [
      { freq: 110, drift: 0.008 },  // A2
      { freq: 165, drift: 0.012 },  // E3
      { freq: 220, drift: 0.010 },  // A3
      { freq: 330, drift: 0.015 },  // E4
    ]

    for (const f of filters) {
      const bp = this.context.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = f.freq
      bp.Q.value = 12

      // Slow frequency drift keeps the texture alive
      const driftLfo = this.context.createOscillator()
      driftLfo.type = 'sine'
      driftLfo.frequency.value = f.drift
      const driftScale = this.context.createGain()
      driftScale.gain.value = f.freq * 0.08
      driftLfo.connect(driftScale)
      driftScale.connect(bp.frequency)
      driftLfo.start(now)

      const gain = this.context.createGain()
      gain.gain.value = 0.008

      noise.connect(bp)
      bp.connect(gain)
      gain.connect(this.masterGain)
    }

    noise.start(now)
  }

  // === Sub Bass: triangle wave with waveshaper harmonics ===
  // Triangle wave has richer harmonics than sine. Waveshaper adds more.
  // D1 (36.7Hz) — perfect fifth below A1, harmonically related to the drone.
  private startSubBass(now: number): void {
    if (!this.context || !this.masterGain) return

    const osc = this.context.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = 36.7

    const ws = this.createWaveshaper()

    // Slow amplitude modulation
    const ampLfo = this.context.createOscillator()
    ampLfo.type = 'sine'
    ampLfo.frequency.value = 0.025
    const ampScale = this.context.createGain()
    ampScale.gain.value = 0.03
    ampLfo.connect(ampScale)

    const gain = this.context.createGain()
    gain.gain.value = 0.07
    ampScale.connect(gain.gain)

    const lp = this.context.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 120
    lp.Q.value = 0.7

    // Gentle pitch drift
    const pitchLfo = this.context.createOscillator()
    pitchLfo.type = 'sine'
    pitchLfo.frequency.value = 0.01
    const pitchScale = this.context.createGain()
    pitchScale.gain.value = 0.15
    pitchLfo.connect(pitchScale)
    pitchScale.connect(osc.frequency)

    if (ws) {
      osc.connect(ws)
      ws.connect(lp)
    } else {
      osc.connect(lp)
    }
    lp.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    ampLfo.start(now)
    pitchLfo.start(now)
  }

  // === Cosmic Events: FM bell tones ===
  // FM synthesis with inharmonic ratios creates metallic, bell-like timbres.
  // The modulation depth decays over time, so the timbre starts complex
  // and simplifies into a pure tone — like a bell ringing out.
  private scheduleCosmicEvent(): void {
    if (!this.context || !this.enabled) {
      this.eventTimer = null
      return
    }

    const delay = 5000 + Math.random() * 15000 // 5-20s
    this.eventTimer = setTimeout(() => {
      this.fireCosmicBell()
      this.scheduleCosmicEvent()
    }, delay)
  }

  private fireCosmicBell(): void {
    if (!this.context || !this.reverbSend || !this.enabled) return

    const now = this.context.currentTime
    const freq = 300 + Math.random() * 1200 // 300-1500Hz
    // Inharmonic ratios produce bell-like metallic quality
    const ratios = [1.4, 2.0, 2.76, 3.5]
    const ratio = ratios[Math.floor(Math.random() * ratios.length)]

    const mod = this.context.createOscillator()
    mod.type = 'sine'
    mod.frequency.value = freq * ratio

    const modGain = this.context.createGain()
    modGain.gain.setValueAtTime(freq * 2, now)
    modGain.gain.exponentialRampToValueAtTime(1, now + 3)

    const carrier = this.context.createOscillator()
    carrier.type = 'sine'
    carrier.frequency.value = freq

    mod.connect(modGain)
    modGain.connect(carrier.frequency)

    const env = this.context.createGain()
    env.gain.setValueAtTime(0, now)
    env.gain.linearRampToValueAtTime(0.025, now + 0.02)
    env.gain.exponentialRampToValueAtTime(0.001, now + 3.5)

    const pan = this.context.createStereoPanner()
    pan.pan.value = (Math.random() - 0.5) * 1.2

    carrier.connect(env)
    env.connect(pan)
    pan.connect(this.reverbSend)

    mod.start(now)
    carrier.start(now)
    mod.stop(now + 3.5)
    carrier.stop(now + 3.5)

    // Cleanup
    carrier.onended = () => {
      mod.disconnect()
      modGain.disconnect()
      carrier.disconnect()
      env.disconnect()
      pan.disconnect()
    }
  }

  // === Generative Melody: phrase-based pentatonic melody ===
  // Instead of isolated notes, plays short melodic phrases (3-7 notes)
  // with tight timing so they form recognizable melodic lines.
  // Phrases are separated by longer silences.
  private readonly melodyScale = [
    // A minor pentatonic across 3 octaves
    220.00, 261.63, 293.66, 329.63, 392.00,   // octave 3
    440.00, 523.25, 587.33, 659.25, 783.99,   // octave 4
    880.00, 1046.50, 1174.66,                  // octave 5
  ]

  private scheduleMelodyNote(): void {
    if (!this.context || !this.enabled) {
      this.melodyTimer = null
      return
    }

    // Gap between phrases: 6-15s
    const gap = 6000 + Math.random() * 9000
    this.melodyTimer = setTimeout(() => {
      this.playPhrase()
      this.scheduleMelodyNote()
    }, gap)
  }

  private pickNextNote(): number {
    const scale = this.melodyScale
    if (this.lastMelodyNote < 0) {
      this.lastMelodyNote = 3 + Math.floor(Math.random() * 5)
      return scale[this.lastMelodyNote]
    }

    const maxStep = Math.random() < 0.7 ? 2 : 4
    const step = Math.ceil(Math.random() * maxStep) * (Math.random() < 0.5 ? -1 : 1)
    let next = this.lastMelodyNote + step
    next = Math.max(0, Math.min(scale.length - 1, next))
    if (next === this.lastMelodyNote) {
      next = Math.min(next + 1, scale.length - 1)
    }
    this.lastMelodyNote = next
    return scale[next]
  }

  private playPhrase(): void {
    if (!this.context || !this.reverbSend || !this.enabled) return

    const noteCount = 3 + Math.floor(Math.random() * 5) // 3-7 notes per phrase
    const phrasePan = (Math.random() - 0.5) * 0.6 // phrase drifts from one stereo region
    let time = this.context.currentTime

    for (let i = 0; i < noteCount; i++) {
      const freq = this.pickNextNote()

      // Varied rhythm within phrase: short and longer notes mixed
      const isLong = Math.random() < 0.3
      const noteDur = isLong ? 1.8 + Math.random() * 1.2 : 0.6 + Math.random() * 0.8
      // Time gap to next note: tighter for short notes, more breath for long
      const gap = isLong ? 0.8 + Math.random() * 0.6 : 0.3 + Math.random() * 0.4

      this.emitNote(freq, time, noteDur, phrasePan + (Math.random() - 0.5) * 0.3)

      // 15% chance: add a harmony note (third or fifth above)
      if (Math.random() < 0.15) {
        const harmonySteps = Math.random() < 0.5 ? 2 : 3
        const hIdx = Math.min(this.lastMelodyNote + harmonySteps, this.melodyScale.length - 1)
        this.emitNote(this.melodyScale[hIdx], time + 0.05, noteDur * 0.8, phrasePan + 0.15)
      }

      time += noteDur * 0.5 + gap // next note starts as current one is still ringing
    }
  }

  private emitNote(freq: number, startAt: number, dur: number, panVal: number): void {
    if (!this.context || !this.reverbSend) return

    // FM with gentle modulation
    const mod = this.context.createOscillator()
    mod.type = 'sine'
    mod.frequency.value = freq * 2.01

    const modGain = this.context.createGain()
    modGain.gain.setValueAtTime(freq * 0.5, startAt)
    modGain.gain.exponentialRampToValueAtTime(freq * 0.03, startAt + dur * 0.8)

    const carrier = this.context.createOscillator()
    carrier.type = 'sine'
    carrier.frequency.value = freq

    mod.connect(modGain)
    modGain.connect(carrier.frequency)

    // Envelope: quick attack, sustain, smooth release
    const env = this.context.createGain()
    const attack = 0.04
    const release = dur * 0.4
    env.gain.setValueAtTime(0, startAt)
    env.gain.linearRampToValueAtTime(0.035, startAt + attack)
    env.gain.setValueAtTime(0.035, startAt + dur - release)
    env.gain.exponentialRampToValueAtTime(0.001, startAt + dur)

    const pan = this.context.createStereoPanner()
    pan.pan.value = Math.max(-1, Math.min(1, panVal))

    carrier.connect(env)
    env.connect(pan)
    pan.connect(this.reverbSend)

    mod.start(startAt)
    carrier.start(startAt)
    mod.stop(startAt + dur + 0.1)
    carrier.stop(startAt + dur + 0.1)

    carrier.onended = () => {
      mod.disconnect()
      modGain.disconnect()
      carrier.disconnect()
      env.disconnect()
      pan.disconnect()
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (this.masterGain && this.context) {
      if (enabled) {
        this.context.resume()
        this.masterGain.gain.cancelScheduledValues(this.context.currentTime)
        this.masterGain.gain.setValueAtTime(
          this.masterGain.gain.value,
          this.context.currentTime,
        )
        this.masterGain.gain.linearRampToValueAtTime(
          0.35,
          this.context.currentTime + 0.5,
        )
      } else {
        // Immediately silence and suspend — stops all audio processing
        this.masterGain.gain.cancelScheduledValues(this.context.currentTime)
        this.masterGain.gain.setValueAtTime(0, this.context.currentTime)
        this.context.suspend()
      }
    }

    if (enabled && !this.eventTimer) {
      this.scheduleCosmicEvent()
    } else if (!enabled && this.eventTimer) {
      clearTimeout(this.eventTimer)
      this.eventTimer = null
    }

    if (enabled && !this.melodyTimer) {
      this.scheduleMelodyNote()
    } else if (!enabled && this.melodyTimer) {
      clearTimeout(this.melodyTimer)
      this.melodyTimer = null
    }
  }

  resume(): void {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume()
    }
  }
}

// Singleton
export const audioEngine = new AudioEngine()

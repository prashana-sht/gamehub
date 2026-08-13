import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["muteButton"]

  connect() {
    this.muted = localStorage.getItem("arcade_muted") === "true"
    this.updateMuteIcon()
  }

  toggleMute() {
    this.muted = !this.muted
    localStorage.setItem("arcade_muted", this.muted)
    this.updateMuteIcon()
  }

  updateMuteIcon() {
    if (this.muteButtonTarget) {
      this.muteButtonTarget.innerText = this.muted ? "🔇 SOUND: OFF" : "🔊 SOUND: ON"
    }
  }

  get audioCtx() {
    if (!this._audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this._audioCtx = new AudioContext()
    }
    if (this._audioCtx.state === 'suspended') {
      this._audioCtx.resume()
    }
    return this._audioCtx
  }

  playTone(freq, type = 'square', duration = 0.1, gainVal = 0.15) {
    if (this.muted) return
    try {
      const ctx = this.audioCtx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(gainVal, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch (e) {
      console.warn("AudioContext error", e)
    }
  }

  playLaser() {
    if (this.muted) return
    try {
      const ctx = this.audioCtx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch (e) {}
  }

  playClick() {
    this.playTone(440, 'sine', 0.05, 0.1)
  }

  playScore() {
    this.playTone(660, 'triangle', 0.08, 0.15)
    setTimeout(() => this.playTone(880, 'triangle', 0.1, 0.15), 60)
  }

  playLevelUp() {
    if (this.muted) return
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'square', 0.15, 0.2), idx * 100)
    })
  }

  playGameOver() {
    if (this.muted) return
    const notes = [400, 350, 300, 220]
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.25, 0.2), idx * 150)
    })
  }

  playDiceRoll() {
    if (this.muted) return
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(200 + Math.random() * 400, 'square', 0.04, 0.08), i * 40)
    }
  }
}

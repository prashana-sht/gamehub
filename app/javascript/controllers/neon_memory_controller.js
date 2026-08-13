import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "grid", "level", "score", "status",
    "startBtn", "overlay", "finalScore", "finalLevel"
  ]

  connect() {
    this.sequence = []
    this.userSequence = []
    this.isPlaying = false
    this.isShowingSequence = false
    this.level = 0
    this.score = 0
    this.maxCombo = 0
  }

  startGame() {
    this.sequence = []
    this.userSequence = []
    this.level = 0
    this.score = 0
    this.maxCombo = 0
    this.isPlaying = true

    if (this.hasOverlayTarget) this.overlayTarget.classList.add("hidden")
    if (this.hasStartBtnTarget) this.startBtnTarget.classList.add("hidden")

    this.nextRound()
  }

  nextRound() {
    this.level++
    this.userSequence = []
    if (this.hasLevelTarget) this.levelTarget.innerText = this.level
    if (this.hasStatusTarget) this.statusTarget.innerText = "WATCH THE PATTERN..."

    // Add random tile (0-8)
    const nextTile = Math.floor(Math.random() * 9)
    this.sequence.push(nextTile)

    setTimeout(() => this.playSequence(), 800)
  }

  async playSequence() {
    this.isShowingSequence = true

    for (let i = 0; i < this.sequence.length; i++) {
      const tileIndex = this.sequence[i]
      await this.highlightTile(tileIndex, 400)
      await this.sleep(200)
    }

    this.isShowingSequence = false
    if (this.hasStatusTarget) this.statusTarget.innerText = "YOUR TURN! REPEAT SEQUENCE"
  }

  async handleTileClick(e) {
    if (!this.isPlaying || this.isShowingSequence) return

    const tileIdx = parseInt(e.currentTarget.dataset.tileIndex, 10)
    this.userSequence.push(tileIdx)

    this.playSound("playClick")
    await this.highlightTile(tileIdx, 250)

    const currentStep = this.userSequence.length - 1
    if (this.userSequence[currentStep] !== this.sequence[currentStep]) {
      // Wrong tile!
      this.gameOver()
      return
    }

    if (this.userSequence.length === this.sequence.length) {
      // Completed round!
      this.score += this.level * 100
      this.maxCombo = Math.max(this.maxCombo, this.level)
      if (this.hasScoreTarget) this.scoreTarget.innerText = this.score
      this.playSound("playScore")

      if (this.hasStatusTarget) this.statusTarget.innerText = "PERFECT! NEXT LEVEL..."
      setTimeout(() => this.nextRound(), 1000)
    }
  }

  async highlightTile(index, durationMs) {
    const tile = this.element.querySelector(`[data-tile-index="${index}"]`)
    if (!tile) return

    tile.classList.add("bg-cyan-400", "shadow-[0_0_30px_#06b6d4]", "scale-105")
    this.playToneForTile(index)

    await this.sleep(durationMs)
    tile.classList.remove("bg-cyan-400", "shadow-[0_0_30px_#06b6d4]", "scale-105")
  }

  gameOver() {
    this.isPlaying = false
    this.playSound("playGameOver")

    if (this.hasStatusTarget) this.statusTarget.innerText = "GAME OVER!"
    if (this.hasFinalScoreTarget) this.finalScoreTarget.innerText = this.score
    if (this.hasFinalLevelTarget) this.finalLevelTarget.innerText = this.level
    if (this.hasOverlayTarget) this.overlayTarget.classList.remove("hidden")

    this.submitScore()
  }

  async submitScore() {
    const playerId = localStorage.getItem("arcade_player_id") || "guest"
    try {
      await fetch("/games/neon_memory/submit_score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name='csrf-token']")?.content
        },
        body: JSON.stringify({
          player_id: playerId,
          score: this.score,
          max_combo: this.maxCombo,
          accuracy: 1.0,
          duration_seconds: this.level * 5
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  playToneForTile(idx) {
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33]
    const soundCtrl = this.application.getControllerForElementAndIdentifier(document.body, "sound")
    if (soundCtrl) {
      soundCtrl.playTone(frequencies[idx % frequencies.length], "sine", 0.2, 0.2)
    }
  }

  playSound(methodName) {
    const soundCtrl = this.application.getControllerForElementAndIdentifier(document.body, "sound")
    if (soundCtrl && typeof soundCtrl[methodName] === "function") {
      soundCtrl[methodName]()
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

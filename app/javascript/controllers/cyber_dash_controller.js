import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "timer", "score", "combo", "accuracy",
    "input", "targetContainer", "startBtn",
    "overlay", "finalScore", "finalCombo"
  ]

  connect() {
    this.wordsPool = [
      "SOLID_QUEUE", "SOLID_CACHE", "KAMAL", "RUBY_8", "TURBO_STREAM",
      "HOTWIRE", "ACTION_CABLE", "CYBER_DASH", "MATRIX", "PROPSHAFT",
      "BACKGROUND_JOB", "SQLITE3", "REDIS_KILLER", "THREAD_POOL", "SPEED_RUN",
      "PUBO_COP", "RAILS_NEO", "SYNTHWAVE", "HYPER_DRIVE", "SYSTEM_CHECK"
    ]
    this.resetGame()
  }

  resetGame() {
    this.isPlaying = false
    this.score = 0
    this.combo = 0
    this.maxCombo = 0
    this.hits = 0
    this.totalTyped = 0
    this.timeLeft = 30
    this.activeWords = []

    if (this.hasScoreTarget) this.scoreTarget.innerText = "0"
    if (this.hasComboTarget) this.comboTarget.innerText = "0x"
    if (this.hasAccuracyTarget) this.accuracyTarget.innerText = "100%"
    if (this.hasTimerTarget) this.timerTarget.innerText = "30s"
    if (this.hasTargetContainerTarget) this.targetContainerTarget.innerHTML = ""
  }

  startGame() {
    this.resetGame()
    this.isPlaying = true
    if (this.hasStartBtnTarget) this.startBtnTarget.classList.add("hidden")
    if (this.hasOverlayTarget) this.overlayTarget.classList.add("hidden")
    if (this.hasInputTarget) {
      this.inputTarget.disabled = false
      this.inputTarget.value = ""
      this.inputTarget.focus()
    }

    this.spawnInterval = setInterval(() => this.spawnWord(), 1000)
    this.timerInterval = setInterval(() => this.updateTimer(), 1000)

    this.playSound("playClick")
    this.spawnWord()
    this.spawnWord()
  }

  updateTimer() {
    this.timeLeft--
    if (this.hasTimerTarget) this.timerTarget.innerText = `${this.timeLeft}s`

    if (this.timeLeft <= 0) {
      this.endGame()
    }
  }

  spawnWord() {
    if (!this.isPlaying || this.activeWords.length >= 6) return

    const randomWord = this.wordsPool[Math.floor(Math.random() * this.wordsPool.length)]
    const wordId = `word_${Date.now()}_${Math.floor(Math.random()*1000)}`
    
    const wordObj = { id: wordId, word: randomWord }
    this.activeWords.push(wordObj)

    const el = document.createElement("div")
    el.id = wordId
    el.className = "inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800/90 border border-cyan-500/50 shadow-lg text-cyan-300 font-mono font-bold text-sm transform transition-all duration-300 animate-bounce-in cursor-pointer hover:border-cyan-400"
    el.innerHTML = `<span>⚡</span> <span>${randomWord}</span>`
    el.onclick = () => this.handleWordClick(randomWord, wordId)

    this.targetContainerTarget.appendChild(el)
  }

  handleInput(e) {
    if (!this.isPlaying) return
    const typed = this.inputTarget.value.trim().toUpperCase()

    const foundIndex = this.activeWords.findIndex(w => w.word === typed)
    if (foundIndex !== -1) {
      const matched = this.activeWords[foundIndex]
      this.destroyWord(matched.id, true)
      this.inputTarget.value = ""
    }
  }

  handleWordClick(word, id) {
    if (!this.isPlaying) return
    this.destroyWord(id, true)
    if (this.hasInputTarget) this.inputTarget.focus()
  }

  destroyWord(id, isSuccess) {
    const idx = this.activeWords.findIndex(w => w.id === id)
    if (idx !== -1) {
      this.activeWords.splice(idx, 1)
    }

    const el = document.getElementById(id)
    if (el) {
      el.classList.add("scale-125", "opacity-0", "bg-emerald-500")
      setTimeout(() => el.remove(), 200)
    }

    if (isSuccess) {
      this.hits++
      this.combo++
      if (this.combo > this.maxCombo) this.maxCombo = this.combo

      const comboMultiplier = 1 + Math.floor(this.combo / 3) * 0.5
      const points = Math.round(50 * comboMultiplier)
      this.score += points

      if (this.hasScoreTarget) this.scoreTarget.innerText = this.score
      if (this.hasComboTarget) this.comboTarget.innerText = `${this.combo}x`
      this.playSound("playLaser")
    } else {
      this.combo = 0
      if (this.hasComboTarget) this.comboTarget.innerText = "0x"
      this.playSound("playClick")
    }

    this.totalTyped++
    const accuracyVal = Math.round((this.hits / Math.max(1, this.totalTyped)) * 100)
    if (this.hasAccuracyTarget) this.accuracyTarget.innerText = `${accuracyVal}%`
  }

  endGame() {
    this.isPlaying = false
    clearInterval(this.spawnInterval)
    clearInterval(this.timerInterval)

    if (this.hasInputTarget) this.inputTarget.disabled = true
    if (this.hasFinalScoreTarget) this.finalScoreTarget.innerText = this.score
    if (this.hasFinalComboTarget) this.finalComboTarget.innerText = `${this.maxCombo}x`
    if (this.hasOverlayTarget) this.overlayTarget.classList.remove("hidden")

    this.playSound("playGameOver")
    this.submitScore()
  }

  async submitScore() {
    const playerId = localStorage.getItem("arcade_player_id") || "guest"
    const accuracyVal = parseFloat(((this.hits / Math.max(1, this.totalTyped))).toFixed(2))

    try {
      const resp = await fetch("/games/cyber_dash/submit_score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name='csrf-token']")?.content
        },
        body: JSON.stringify({
          player_id: playerId,
          score: this.score,
          max_combo: this.maxCombo,
          accuracy: accuracyVal,
          duration_seconds: 30 - this.timeLeft
        })
      })
      const data = await resp.json()
      console.log("Score submitted", data)
    } catch (e) {
      console.error("Error submitting score", e)
    }
  }

  playSound(methodName) {
    const soundCtrl = this.application.getControllerForElementAndIdentifier(document.body, "sound")
    if (soundCtrl && typeof soundCtrl[methodName] === "function") {
      soundCtrl[methodName]()
    }
  }
}

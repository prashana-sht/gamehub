import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "playerHp", "playerHpBar",
    "monsterName", "monsterHp", "monsterHpBar", "monsterAvatar",
    "diceResult", "combatLog", "score",
    "overlay", "finalScore", "victoryStatus"
  ]

  connect() {
    this.monsters = [
      { name: "Cyber Slime 🟢", hp: 45, maxHp: 45, atk: [5, 12] },
      { name: "Synth Golem 🤖", hp: 80, maxHp: 80, atk: [10, 20] },
      { name: "Omega Cyber Dragon 🐉", hp: 130, maxHp: 130, atk: [15, 30] }
    ]
    this.currentMonsterIdx = 0
    this.playerHp = 100
    this.playerMaxHp = 100
    this.score = 0
    this.turns = 0
    this.maxCombo = 0
    this.currentCombo = 0
  }

  startGame() {
    this.currentMonsterIdx = 0
    this.playerHp = 100
    this.score = 0
    this.turns = 0
    this.maxCombo = 0
    this.currentCombo = 0

    if (this.hasOverlayTarget) this.overlayTarget.classList.add("hidden")
    this.loadMonster(0)
    this.updatePlayerHpUI()
    this.log("⚔️ Battle started! Prepare your dice & cards!")
  }

  loadMonster(idx) {
    const m = this.monsters[idx]
    m.hp = m.maxHp
    if (this.hasMonsterNameTarget) this.monsterNameTarget.innerText = m.name
    if (this.hasMonsterHpTarget) this.monsterHpTarget.innerText = `${m.hp} / ${m.maxHp}`
    if (this.hasMonsterHpBarTarget) this.monsterHpBarTarget.style.width = "100%"
  }

  rollAttackDice() {
    if (this.playerHp <= 0 || !this.currentMonster) return
    this.playSound("playDiceRoll")

    const roll = Math.floor(Math.random() * 6) + 1
    const dmg = roll * 8 + Math.floor(this.score / 100)

    if (this.hasDiceResultTarget) this.diceResultTarget.innerText = `🎲 Rolled: ${roll} -> ${dmg} DMG!`
    
    this.damageMonster(dmg)
    this.checkTurnEnd()
  }

  playCriticalCard() {
    if (this.playerHp <= 0 || !this.currentMonster) return
    this.playSound("playLaser")

    const dmg = 35 + Math.floor(Math.random() * 20)
    if (this.hasDiceResultTarget) this.diceResultTarget.innerText = `💥 Critical Laser! ${dmg} DMG!`
    
    this.damageMonster(dmg)
    this.checkTurnEnd()
  }

  useHealCard() {
    if (this.playerHp <= 0) return
    this.playSound("playScore")

    const heal = 25 + Math.floor(Math.random() * 15)
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal)
    this.updatePlayerHpUI()
    this.log(`💖 Healed +${heal} HP!`)
    this.monsterAttack()
  }

  damageMonster(dmg) {
    const m = this.currentMonster
    m.hp = Math.max(0, m.hp - dmg)
    
    this.currentCombo++
    this.maxCombo = Math.max(this.maxCombo, this.currentCombo)

    this.score += dmg * 5
    if (this.hasScoreTarget) this.scoreTarget.innerText = this.score
    
    if (this.hasMonsterHpTarget) this.monsterHpTarget.innerText = `${m.hp} / ${m.maxHp}`
    if (this.hasMonsterHpBarTarget) {
      const pct = Math.round((m.hp / m.maxHp) * 100)
      this.monsterHpBarTarget.style.width = `${pct}%`
    }

    this.log(`🗡️ Hit ${m.name} for ${dmg} damage!`)

    if (m.hp <= 0) {
      this.log(`🏆 Defeated ${m.name}! +500 Bonus Score!`)
      this.score += 500
      this.playSound("playLevelUp")

      if (this.currentMonsterIdx < this.monsters.length - 1) {
        this.currentMonsterIdx++
        setTimeout(() => this.loadMonster(this.currentMonsterIdx), 1000)
      } else {
        this.victory()
      }
    }
  }

  checkTurnEnd() {
    if (this.currentMonster && this.currentMonster.hp > 0) {
      setTimeout(() => this.monsterAttack(), 800)
    }
  }

  monsterAttack() {
    const m = this.currentMonster
    if (!m || m.hp <= 0) return

    const [minAtk, maxAtk] = m.atk
    const enemyDmg = Math.floor(Math.random() * (maxAtk - minAtk + 1)) + minAtk

    this.playerHp = Math.max(0, this.playerHp - enemyDmg)
    this.updatePlayerHpUI()
    this.playSound("playClick")
    this.log(`👹 ${m.name} struck you for ${enemyDmg} damage!`)

    if (this.playerHp <= 0) {
      this.gameOver()
    }
  }

  updatePlayerHpUI() {
    if (this.hasPlayerHpTarget) this.playerHpTarget.innerText = `${this.playerHp} / ${this.playerMaxHp}`
    if (this.hasPlayerHpBarTarget) {
      const pct = Math.round((this.playerHp / this.playerMaxHp) * 100)
      this.playerHpBarTarget.style.width = `${pct}%`
    }
  }

  get currentMonster() {
    return this.monsters[this.currentMonsterIdx]
  }

  log(msg) {
    if (!this.hasCombatLogTarget) return
    const line = document.createElement("div")
    line.className = "text-xs py-1 border-b border-slate-800 text-slate-300 font-mono"
    line.innerText = msg
    this.combatLogTarget.prepend(line)
  }

  victory() {
    this.playSound("playLevelUp")
    if (this.hasVictoryStatusTarget) this.victoryStatusTarget.innerText = "VICTORY! DUNGEON CLEARED!"
    if (this.hasFinalScoreTarget) this.finalScoreTarget.innerText = this.score
    if (this.hasOverlayTarget) this.overlayTarget.classList.remove("hidden")

    this.submitScore()
  }

  gameOver() {
    this.playSound("playGameOver")
    if (this.hasVictoryStatusTarget) this.victoryStatusTarget.innerText = "GAME OVER - DEFEATED IN DUNGEON"
    if (this.hasFinalScoreTarget) this.finalScoreTarget.innerText = this.score
    if (this.hasOverlayTarget) this.overlayTarget.classList.remove("hidden")

    this.submitScore()
  }

  async submitScore() {
    const playerId = localStorage.getItem("arcade_player_id") || "guest"
    try {
      await fetch("/games/pixel_dice/submit_score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name='csrf-token']")?.content
        },
        body: JSON.stringify({
          player_id: playerId,
          score: this.score,
          max_combo: this.maxCombo,
          accuracy: 0.9,
          duration_seconds: 45
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  playSound(methodName) {
    const soundCtrl = this.application.getControllerForElementAndIdentifier(document.body, "sound")
    if (soundCtrl && typeof soundCtrl[methodName] === "function") {
      soundCtrl[methodName]()
    }
  }
}

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["usernameInput", "avatarSelect", "handleDisplay", "avatarDisplay", "modal"]

  connect() {
    this.username = localStorage.getItem("arcade_username") || "CyberAce_" + Math.floor(1000 + Math.random()*9000)
    this.avatar = localStorage.getItem("arcade_avatar") || "👾"
    this.playerId = localStorage.getItem("arcade_player_id") || null

    if (!this.playerId) {
      this.ensurePlayerRecord()
    }

    this.renderCurrentPlayer()
  }

  renderCurrentPlayer() {
    if (this.hasHandleDisplayTarget) this.handleDisplayTarget.innerText = this.username
    if (this.hasAvatarDisplayTarget) this.avatarDisplayTarget.innerText = this.avatar
  }

  openModal() {
    if (this.hasModalTarget) this.modalTarget.classList.remove("hidden")
    if (this.hasUsernameInputTarget) this.usernameInputTarget.value = this.username
  }

  closeModal() {
    if (this.hasModalTarget) this.modalTarget.classList.add("hidden")
  }

  async savePlayer(e) {
    e.preventDefault()
    const newName = this.usernameInputTarget.value.trim()
    const newAvatar = this.avatarSelectTarget.value

    if (!newName) return

    this.username = newName
    this.avatar = newAvatar
    localStorage.setItem("arcade_username", this.username)
    localStorage.setItem("arcade_avatar", this.avatar)

    await this.ensurePlayerRecord()
    this.renderCurrentPlayer()
    this.closeModal()
  }

  async ensurePlayerRecord() {
    try {
      const resp = await fetch("/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name='csrf-token']")?.content
        },
        body: JSON.stringify({
          player: {
            username: this.username,
            avatar: this.avatar
          }
        })
      })
      const data = await resp.json()
      if (data && data.id) {
        this.playerId = data.id
        localStorage.setItem("arcade_player_id", data.id)
      }
    } catch (e) {
      console.error("Error creating/syncing player", e)
    }
  }
}

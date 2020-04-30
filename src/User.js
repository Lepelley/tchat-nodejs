module.exports = class User {
  constructor(id, nickname, channel) {
    this.id = id
    this.nickname = nickname
    this.currentChannel = channel
    this.isTyping = false
  }
}

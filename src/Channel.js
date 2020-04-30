module.exports = class Channel {
  constructor(name, user1 = null, user2 = null) {
    this.name = name
    this.messages = []
  }

  addMessage(message) {
    while (this.messages.length > 100) {
      this.messages.shift()
    }
    this.messages.push(message)
  }
}

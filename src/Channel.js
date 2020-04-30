module.exports = class Channel {
  constructor(name, isPrivate = false, user1 = null, user2 = null) {
    this.name = name
    this.messages = []
    this.isPrivate = isPrivate
    if (this.isPrivate) {
      this.user1 = user1
      this.user2 = user2
    }
  }

  addMessage(message) {
    while (this.messages.length > 100) {
      this.messages.shift()
    }
    this.messages.push(message)
  }

  canAccess(user) {
    return (user === this.user1 || user === this.user2) && this.isPrivate
  }
}

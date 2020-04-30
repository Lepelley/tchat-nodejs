const Time = require('./Time')

module.exports = class Message {
  constructor(author, message) {
    this.message = message
    this.author = author
    this.time = new Time().get()
  }
}
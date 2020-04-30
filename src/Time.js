module.exports = class Time {
  constructor() {
    this.date = new Date()
    this.min = this.date.getMinutes()
    this.time = `${this.date.getHours()}h${(this.min < 10 ? `0${this.min}` : this.min)}`
  }

  get () {
    return this.time
  }
}
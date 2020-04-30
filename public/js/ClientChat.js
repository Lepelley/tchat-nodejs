export default class ClientChat {
  constructor(ui) {
    this.socket = io()
    this.ui = ui
    this.ui.listenInterface()
    this.listenServer()
    this.transmitUIServer()
  }

  listenServer() {
    this.socket.on('server:message:send', (info) => {
      this.ui.createMessage(info.message, info.author, info.time)
    })

    this.socket.on('server:list:users', (users) => {
      this.ui.listUsers(users)
    })

    this.socket.on('server:connection:user_leave', (info) => {
      this.ui.createMessage(
        `${info.nickname} vient de partir`,
        '[Serveur]',
        info.time,
        true
      )
    })

    this.socket.on('server:user:change_channel', (info) => {
      this.ui.createMessage(
        `${info.nickname} vient de rejoindre le salon`,
        '[Serveur]',
        info.time,
        true
      )
    })

    this.socket.on('server:connection:allowed', () => {
      this.ui.showElement('tchat')
      this.ui.hideElement('connection')
    })

    this.socket.on('server:connection:forbidden', () => {
      this.ui.showAlert('Ce pseudonyme est déjà utilisé !')
    })

    this.socket.on('server:list:channels', (channels) => {
      this.ui.listChannels(channels)
    })

    this.socket.on('server:list:channel_messages', (messages) => {
      this.ui.printMessages(messages)
    })

    this.socket.on('server:user:start_typing', (nickname) => {
      this.ui.startTyping(nickname)
    })

    this.socket.on('server:user:end_typing', (nickname) => {
      this.ui.endTyping(nickname)
    })
  }

  transmitUIServer() {
    document.addEventListener('local:user:disconnect', () => {
      this.socket.emit('client:connection:leave')
    })

    document.addEventListener('local:message:send', (event) => {
      this.socket.emit('client:message:send', event.detail.message)
    })

    document.addEventListener('local:user:connect', (event) => {
      this.socket.emit('client:connection:try', event.detail.nickname)
    })

    document.addEventListener('local:user:change_channel', (event) => {
      this.socket.emit('client:channel:change', event.detail.channel)
      this.ui.changeChannel(event.detail.channel)
    })

    document.addEventListener('local:user:start_typing', () => {
      this.socket.emit('client:user:start_typing')
    })

    document.addEventListener('local:user:end_typing', () => {
      this.socket.emit('client:user:end_typing')
    })
  }
}

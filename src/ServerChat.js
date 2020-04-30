const Server = require('socket.io')
const { v4: uuidv4 } = require('uuid')

const User = require('./User')
const Channel = require('./Channel')
const Message = require('./Message')
const Time = require('./Time')

module.exports = class ServerChat {
  constructor(server) {
    this.users = []
    this.io = new Server(server)
    this.io.on('connection', (socket) => {
      this.onConnection(socket)
    })

    this.channels = [
      new Channel('Général'),
      new Channel('Programmation'),
      new Channel('Jeux vidéos')
    ]
    this.defaultChannel = this.channels[0]
  }

  onConnection(socket) {
    console.log(`Client ${socket.id} is connected via WebSockets`)

    socket.on('disconnect', () => {
      this.userDisconnect(socket)
    })

    socket.on('client:connection:try', (nickname) => {
      this.userConnect(socket, nickname)
    })

    socket.on('client:connection:leave', () => {
      this.userDisconnect(socket)
    })

    socket.on('client:message:send', (message) => {
      this.messageToChannel(socket, message)
    })

    socket.on('client:channel:change', (channelName) => {
      this.joinChannel(socket, channelName)
    })

    socket.on('client:user:start_typing', () => {
      if (socket.user) {
        socket.user.isTyping = true
        socket.to(socket.user.currentChannel.name).emit('server:user:start_typing', socket.user.nickname)
      }
    })

    socket.on('client:user:end_typing', () => {
      if (socket.user) {
        socket.user.isTyping = false
        socket.to(socket.user.currentChannel.name).emit('server:user:end_typing', socket.user.nickname)
      }
    })

    socket.on('client:channel:private', (nickname) => {
      this.joinChannel(socket, this.findPrivateChannelName(socket.user.nickname, nickname))
    })
  }

  sendChannelMessages(socket, channelName) {
    socket.emit(
      'server:list:channel_messages',
      this.channels.find(chan => chan.name === channelName).messages
    )
  }

  userConnect(socket, nickname) {
    if (this.users.find(user => user.nickname === nickname)) {
      socket.emit('server:connection:forbidden')
      return
    }
    socket.user = new User(socket.id, nickname, this.defaultChannel)
    this.users.push(socket.user)
    socket.emit('server:connection:allowed')
    this.joinChannel(socket)

    this.users.forEach(user => {
      if (socket.user && user !== socket.user) {
        this.channels.push(new Channel(uuidv4(), true, user.nickname, socket.user.nickname))
      }
    })
  }

  joinChannel(socket, channelName = this.defaultChannel.name) {
    if (channelName === false) {
      return
    }
    if (this.channels.findIndex(channel => channel.name === channelName) !== -1) {
      socket.leave(socket.user.currentChannel.name)
      socket.user.currentChannel = this.channels.find(channel => channel.name === channelName)
      socket.join(socket.user.currentChannel.name)
      this.sendChannelMessages(socket, channelName)
      this.io.in(channelName).emit('server:user:change_channel', {
        nickname: socket.user.nickname,
        time: new Time().get()
      });
      this.sendUserList(socket)
      this.showChannels()
    }
  }

  userDisconnect(socket) {
    if (socket.user !== undefined) {
      socket.to(socket.user.currentChannel.name).emit('server:connection:user_leave', {
        nickname: socket.user.nickname,
        time: new Time().get()
      })
      socket.leave(socket.user.currentChannel.name)
      this.users.splice(this.users.indexOf(socket.user.nickname), 1)
      delete socket.user
      this.sendUserList(socket)
    }
  }

  messageToChannel(socket, message) {
    if (socket.user) {
      const newMessage = new Message(socket.user.nickname, message)
      this.io.in(socket.user.currentChannel.name).emit('server:message:send', newMessage)
      socket.user.currentChannel.addMessage(newMessage)
    }
  }

  sendUserList(socket) {
    this.io.emit('server:list:users', this.users.map(user => {
      if (socket.user && user.currentChannel === socket.user.currentChannel) {
        return {
          nickname: user.nickname,
          isTyping: user.isTyping
        }
      }
      return { nickname: user.nickname }
    }))
  }

  showChannels() {
    this.io.emit(
      'server:list:channels',
      this.channels.filter(channel => channel.isPrivate === false).map(channel => channel.name)
    )
  }

  findPrivateChannelName(user1, user2) {
    if (user1 === user2) {
      return
    }
    const channel = this.channels.find(channel => {
      return (channel.user1 === user1 && channel.user2 === user2) ||
        (channel.user1 === user2 && channel.user2 === user1)
    })

    return channel ? channel.name : false
  }
}

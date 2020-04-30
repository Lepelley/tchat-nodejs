export default class UserInterface {
  listenInterface() {
    document.getElementById('chat').addEventListener('submit', (event) => {
      event.preventDefault()
      const inputMessage = document.getElementById('message')
      document.dispatchEvent(new CustomEvent('local:message:send', {detail: {message: inputMessage.value}}))
      document.getElementById('chat').reset()
    })

    this.listenersConnection()

    document.getElementById('message').addEventListener('focus', () => {
      document.dispatchEvent(new CustomEvent('local:user:start_typing'))
    })

    document.getElementById('message').addEventListener('blur', () => {
      document.dispatchEvent(new CustomEvent('local:user:end_typing'))
    })

    document.getElementById('disconnectButton').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('local:user:disconnect'))
      this.hideElement('tchat')
      this.showElement('connection')
    })
  }

  listenersConnection() {
    document.getElementById('connectionButton').addEventListener('click', (event) => {
      event.preventDefault()
      const nickname = window.prompt('Choisissez votre pseudo')
      if (nickname) {
        document.dispatchEvent(new CustomEvent('local:user:connect', {detail: {nickname}}))
      }
    })

    this.auth('googleConnection', new firebase.auth.GoogleAuthProvider())
    this.auth('githubConnection', new firebase.auth.GithubAuthProvider())
    this.auth('facebookConnection', new firebase.auth.FacebookAuthProvider())
  }

  auth(identifier, provider) {
    document.getElementById(identifier).addEventListener('click', (event) => {
      event.preventDefault()
      firebase.auth().signInWithPopup(provider).then((user) => {
        document.dispatchEvent(new CustomEvent('local:user:connect', {detail: {
            nickname: user.additionalUserInfo.profile.name
          }
        }))
      }).catch((error) => {
        console.log(error)
      })
    })
  }

  hideElement(identifier) {
    document.getElementById(identifier).setAttribute('hidden', 'hidden')
  }

  showElement(identifier) {
    document.getElementById(identifier).removeAttribute('hidden')
  }

  createMessage(message, author, time, isServerMessage = false) {
    if ("content" in document.createElement("template")) {
      const template = document.getElementById("messageTpl")
      const clone = document.importNode(template.content, true)
      if (isServerMessage) {
        clone.querySelector('li').style.fontWeight = 'bold'
      }
      clone.querySelector('span.author').innerHTML = filterXSS(author)
      clone.querySelector('span.time').innerHTML = `(${time}) : `
      clone.querySelector('span.message').innerHTML = filterXSS(message)
      document.getElementById('messages').appendChild(clone)
    }
  }

  printMessages(messages) {
    document.getElementById('messages').innerHTML = ''
    messages.forEach(info => {
      this.createMessage(filterXSS(info.message), info.author, info.time)
    })
  }

  showAlert(message) {
    window.alert(message)
  }

  listElements(elements, parent, templateHtml) {
    document.querySelector(parent).innerHTML = "";
    if ("content" in document.createElement("template")) {
      const template = document.querySelector(templateHtml)
      elements.forEach(element => {
        const clone = document.importNode(template.content, true)
        clone.querySelector('li').innerHTML = filterXSS(element)
        document.querySelector(parent).appendChild(clone)
      })
    }
  }

  listUsers(users) {
    document.querySelector('#listingUsers').innerHTML = "";
    if ("content" in document.createElement("template")) {
      const template = document.querySelector('#usersTpl')
      users.forEach(user => {
        const clone = document.importNode(template.content, true)
        const liElt = clone.querySelector('li')
        liElt.innerHTML = filterXSS(user.nickname)
        liElt.setAttribute('data-id', user.nickname)
        liElt.setAttribute(
          'data-value',
          `${filterXSS(user.nickname)}${user.isTyping ? ' écrit' : ''}`
        )
        if (window.localStorage.getItem('nickname') !== liElt.dataset.id) {
          liElt.classList.add('user-link')
          liElt.addEventListener('click', () => {
            document.querySelector('h1').textContent = 'Messagerie privé avec ' + liElt.dataset.id
            document.dispatchEvent(new CustomEvent(
              'local:user:want_private',
              {detail: {nickname: liElt.dataset.id}})
            )
          })
        }
        document.querySelector('#listingUsers').appendChild(clone)
      })
    }
  }

  listChannels(channels) {
    this.listElements(channels, '#listingChannels', '#channelTpl')
    const channelsElements = document.getElementById('listingChannels').querySelectorAll('li')
    channelsElements.forEach(channel => {
      channel.classList.add('channel-link')
      channel.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('local:user:change_channel',{
          detail: {channel: channel.textContent}
        }))
      })
    })
  }

  changeChannel(channel) {
    document.querySelector('h1').textContent = channel
    document.getElementById('messages').innerHTML = ''
  }

  startTyping(nickname) {
    document.querySelector(`[data-value=${nickname}]`).textContent = `${nickname} écrit`
  }

  endTyping(nickname) {
    document.querySelector(`[data-value=${nickname}]`).textContent = nickname
  }
}

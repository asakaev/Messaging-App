class Destination {
  constructor(parameters) {
    this.destination_type = parameters.destination_type
    this.destination_id = parameters.destination_id
    this.has_online = parameters.has_online
    this.name = parameters.name
  }
}


class SendStatus {
  constructor(parameters) {
    this.message_id = parameters.message_id
    this.timestamp = parameters.timestamp
  }
}


class MessagingApi {

  /**
   * @param {!string} authKey
   * @param {!string} host
   */
  constructor(authKey, host) {
    this.endpoint = `https://${host}/1.0/`
    this.authKey = authKey
  }

  /**
   * @param {!string} userId
   * @param {!string} text
   */
  sendText(userId, text) {
    const method = 'sendText'
    const payload = {user_id: userId, text: text}
    return this.request(method, JSON.stringify(payload))
      .then(_ => new SendStatus(_))
  }

  /**
   * @param {!string} userId
   * @returns {Promise.<Array.<Destination>>}
   */
  getDestinations(userId) {
    const method = 'getDestinations'
    const payload = {user_id: userId}
    return this.request(method, JSON.stringify(payload))
      .then(_ => _.destinations)
      .then(_ => _.map(_ => new Destination(_)))
  }

  /**
   * @param {!string} userId
   * @param {!string} typ
   * @param {!string} id
   * @returns {Promise.<undefined>}
   */
  selectDestination(userId, typ, id) {
    const method = 'selectDestination'
    const payload = {user_id: userId, destination_type: typ, destination_id: id}
    return this.request(method, JSON.stringify(payload))
      .then(_ => undefined)
  }

  // private

  /**
   * @param {!string} method
   * @param {!string} payload
   * @returns {Promise}
   * @private
   */
  request(method, payload) {
    const OK = 200
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const url = `${this.endpoint}${method}?key=${this.authKey}`
      xhr.open('POST', url, true)
      xhr.onload = () => xhr.status === OK
        ? resolve(JSON.parse(xhr.responseText))
        : reject(new Error('API.error'))
      xhr.onerror = (e) => reject(e)
      xhr.send(payload)
    }).catch(e => {
      console.log('request error')
      console.log(e)
    })
  }

}


// APP

const host = 'messaging.livetex.ru'
const authKey = '2pa4n7kmtk9c7ehlt9angop5gb3ek7t0es8m6pocu9l3n0fkni'
const api = new MessagingApi(authKey, host)


// HELPERS

/**
 * @param {!string} userId
 * @param {!string} text
 * @returns {Promise}
 */
const sendText = (userId, text) =>
  api.getDestinations(userId)
    .then(destinations => {
      console.info(destinations)
      const maybeDest = destinations.find(_ => _.has_online === true)
      return maybeDest
        ? api.selectDestination(userId, maybeDest.destination_type, maybeDest.destination_id)
        : Promise.reject(new Error('Destinations.offline'))
    })
    .then(_ => api.sendText(userId, text))



// VIEW

const input = document.createElement('input')
input.setAttribute('name', 'kek')
document.body.appendChild(input)

const log = document.createElement('div')
input.setAttribute('id', 'kek-result')
document.body.appendChild(log)

input.addEventListener('change', (ev) => {
  const text = ev.currentTarget.value
  console.log(text)
  ev.currentTarget.value = null

  const cid = Math.random().toString()

  const sent = _ => `${_} ✨`
  const delivered = _ => `${_} 👌`

  function appendMessage(text, cid) {
    const msg = document.createElement('div')
    msg.setAttribute('id', cid)
    msg.innerText = sent(text)
    log.appendChild(msg)
  }

  function updateMessage(cid) {
    document
      .getElementById(cid)
      .innerText = delivered(text)
  }

  appendMessage(text, cid)

  sendText('user42', text)
    .then(_ => updateMessage(cid))
    .catch(e => appendMessage(e))
})

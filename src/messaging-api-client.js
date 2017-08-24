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

export { MessagingApi }
import { MessagingApi } from './messaging-api-client.js'

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

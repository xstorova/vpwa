import { reactive } from 'vue'
import { authState } from '../services/auth.js'

const currentUser = authState.user.value || { name: 'Michal Novák', nick: 'michal', status: 'online' }

// Mock dáta - v 2. fáze ich nahradí backend (AdonisJS)
export const state = reactive({
  me: currentUser,
  activeId: 1,
  channels: [
    { id: 1, name: 'Nina Kováčová', group: false, active: true, unread: 0, avatar: null },
    { id: 2, name: 'Projekt OOP', group: true, active: true, unread: 2, avatar: null, members: [currentUser.name, 'Nina Kováčová', 'Tomáš Bielik'] },
    { id: 3, name: 'Peter Novotný', group: false, active: false, unread: 0, avatar: null },
    { id: 4, name: 'Laura Poláková', group: false, active: false, unread: 0, avatar: null }
  ],
  messages: [
    { id: 1, mine: false, text: 'Ahoj, ako pokračuje projekt?', date: '11/10/2026' },
    { id: 2, mine: true, text: 'Ahoj! Práve dokončujem návrh rozhrania.', date: '11/10/2026' },
    { id: 3, mine: false, text: 'Super, potom mi ho pošli na kontrolu.', date: '11/10/2026' }
  ],
  messagesByChannel: {
    1: [
      { id: 1, mine: false, text: 'Ahoj, ako pokračuje projekt?', date: '11/10/2026' },
      { id: 2, mine: true, text: 'Ahoj! Práve dokončujem návrh rozhrania.', date: '11/10/2026' },
      { id: 3, mine: false, text: 'Super, potom mi ho pošli na kontrolu.', date: '11/10/2026' }
    ],
    2: [
      { id: 4, mine: false, text: 'Nezabudnite, dnes si rozdelíme úlohy.', date: '11/10/2026' },
      { id: 5, mine: true, text: 'Jasné, pripravím zoznam požiadaviek.', date: '11/10/2026' },
      { id: 6, mine: false, text: 'Ja zatiaľ pozriem databázový model.', date: '11/10/2026' }
    ],
    3: [
      { id: 7, mine: false, text: 'Máš, prosím, poznámky z cvičenia?', date: '11/10/2026' },
      { id: 8, mine: true, text: 'Áno, pošlem ti ich večer.', date: '11/10/2026' }
    ],
    4: [
      { id: 9, mine: false, text: 'Ahoj, kedy sa stretneme na konzultácii?', date: '11/10/2026' },
      { id: 10, mine: true, text: 'Môže mi vyhovovať zajtra poobede.', date: '11/10/2026' }
    ]
  }
})

export function selectChannel (channelId) {
  const channel = state.channels.find(item => item.id === channelId)
  if (!channel) return

  state.messagesByChannel[state.activeId] = state.messages.slice()
  state.activeId = channel.id
  channel.unread = 0
  const messages = state.messagesByChannel[channel.id] || []
  state.messages.splice(0, state.messages.length, ...messages)
  state.messagesByChannel[channel.id] = messages.slice()
}

export function createGroup (name, members = []) {
  const id = Math.max(0, ...state.channels.map(channel => channel.id)) + 1
  const group = {
    id,
    name: name.trim(),
    group: true,
    active: true,
    unread: 0,
    avatar: null,
    members: [...new Set([state.me.name, ...members].filter(Boolean))]
  }

  state.channels.push(group)
  state.messagesByChannel[id] = []
  selectChannel(id)
  return group
}

export function send (text) {
  state.messages.push({ id: Date.now(), mine: true, text, date: '11/10/2026' })
}

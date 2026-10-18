import { reactive } from 'vue'
import { authState } from '../services/auth.js'

const currentUser = authState.user.value || {
  name: 'Michal Novák',
  nick: 'michal',
  status: 'online',
  notifyOnlyMentions: false
}
currentUser.status ||= 'online'
currentUser.notifyOnlyMentions ??= false
const initialUsers = [
  currentUser,
  { name: 'Nina Kováčová', nick: 'nina', status: 'online' },
  { name: 'Tomáš Bielik', nick: 'tomas', status: 'online' },
  { name: 'Peter Novotný', nick: 'peter', status: 'offline' },
  { name: 'Laura Poláková', nick: 'laura', status: 'online' }
]

function makeChannel (channel) {
  return {
    ...channel,
    type: channel.type || 'public',
    ownerNick: channel.ownerNick || currentUser.nick,
    memberNicks: channel.memberNicks || [currentUser.nick],
    invitedNicks: channel.invitedNicks || [],
    bannedNicks: channel.bannedNicks || [],
    kickVotes: channel.kickVotes || {},
    lastActivityAt: channel.lastActivityAt || Date.now()
  }
}

// Mock dáta - v 2. fáze ich nahradí backend (AdonisJS)
export const state = reactive({
  me: currentUser,
  users: initialUsers,
  activeId: 1,
  historyPagesLoadedByChannel: {},
  pendingMessagesByChannel: {},
  typingByChannel: {},
  activeDraftPreview: null,
  activeUserProfile: null,
  channels: [
    { id: 1, name: 'Nina Kováčová', nick: 'nina', group: false, active: true, unread: 0, avatar: null, lastActivityAt: Date.now() - 1000 * 60 * 60 * 2 },
    makeChannel({
      id: 2,
      name: 'Projekt OOP',
      group: true,
      active: true,
      unread: 2,
      avatar: null,
      members: [currentUser.name, 'Nina Kováčová', 'Tomáš Bielik'],
      memberNicks: [currentUser.nick, 'nina', 'tomas'],
      lastActivityAt: Date.now() - 1000 * 60 * 60 * 24
    }),
    { id: 3, name: 'Peter Novotný', nick: 'peter', group: false, active: false, unread: 0, avatar: null, lastActivityAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
    { id: 4, name: 'Laura Poláková', nick: 'laura', group: false, active: false, unread: 0, avatar: null, lastActivityAt: Date.now() - 1000 * 60 * 60 * 24 * 12 },
    makeChannel({
      id: 5,
      name: 'Starý projekt',
      group: true,
      active: false,
      unread: 0,
      avatar: null,
      members: [currentUser.name, 'Peter Novotný'],
      memberNicks: [currentUser.nick, 'peter'],
      lastActivityAt: Date.now() - 1000 * 60 * 60 * 24 * 34 // 34 dní neaktívny (> 30 dní)
    })
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
      { id: 4, mine: false, senderNick: 'nina', senderName: 'Nina Kováčová', text: 'Nezabudnite, dnes si rozdelíme úlohy.', date: '11/10/2026' },
      { id: 5, mine: true, text: 'Jasné, pripravím zoznam požiadaviek.', date: '11/10/2026' },
      { id: 6, mine: false, senderNick: 'tomas', senderName: 'Tomáš Bielik', text: `@${currentUser.nick} pošli mi prosím potom návrh dátového modelu.`, recipientNick: currentUser.nick, date: '11/10/2026' }
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

function nextChannelId () {
  return Math.max(0, ...state.channels.map(channel => channel.id)) + 1
}

function channelByName (name) {
  return state.channels.find(channel => channel.group && channel.name.toLocaleLowerCase() === name.toLocaleLowerCase())
}

function findChannel (channelId) {
  const channel = state.channels.find(item => item.id === channelId)
  if (!channel || !channel.group) throw new Error('Táto akcia je dostupná iba pre kanály.')
  return channel
}

function findUser (nick) {
  const user = state.users.find(item => item.nick.toLocaleLowerCase() === nick.toLocaleLowerCase())
  if (!user) throw new Error(`Používateľ @${nick} neexistuje v ukážkových dátach.`)
  return user
}

function addMember (channel, user) {
  if (channel.bannedNicks.includes(user.nick)) throw new Error(`Používateľ @${user.nick} má v kanáli trvalý ban.`)
  if (!channel.memberNicks.includes(user.nick)) {
    channel.memberNicks.push(user.nick)
    channel.members.push(user.name)
  }
}

function removeChannel (channel) {
  const index = state.channels.findIndex(item => item.id === channel.id)
  if (index < 0) return

  state.channels.splice(index, 1)
  delete state.messagesByChannel[channel.id]

  if (state.activeId === channel.id) {
    const fallback = state.channels.find(item => item.group && item.memberNicks?.includes(state.me.nick)) || state.channels[0]
    if (fallback) selectChannel(fallback.id)
  }
}

export function selectChannel (channelId) {
  const channel = state.channels.find(item => item.id === channelId)
  if (!channel) return

  if (state.channels.some(item => item.id === state.activeId)) {
    state.messagesByChannel[state.activeId] = state.messages.slice()
  }
  state.activeId = channel.id
  channel.unread = 0
  const messages = state.messagesByChannel[channel.id] || []
  state.messages.splice(0, state.messages.length, ...messages)
  state.messagesByChannel[channel.id] = messages.slice()
}

export function loadOlderMessages (channelId, count = 12) {
  const channel = state.channels.find(item => item.id === channelId)
  if (!channel) return false

  const page = state.historyPagesLoadedByChannel[channelId] || 0
  if (page >= 3) return false

  const messages = Array.from({ length: count }, (_, index) => {
    const daysAgo = (page * count) + count - index
    const date = new Date(Date.now() - daysAgo * 86400000).toLocaleDateString('sk-SK')
    return {
      id: `history-${channelId}-${page}-${index}`,
      mine: index % 4 === 0,
      text: [
        'Posielam aktualizáciu k úlohe.',
        'Pozriem sa na to a dám vedieť.',
        'Dohodnuté, ďakujem!',
        'Môžeme to prebrať na ďalšom stretnutí?'
      ][index % 4],
      date
    }
  })

  state.historyPagesLoadedByChannel[channelId] = page + 1
  if (state.activeId === channelId) {
    state.messages.unshift(...messages)
    state.messagesByChannel[channelId] = state.messages.slice()
  } else {
    const currentMessages = state.messagesByChannel[channelId] || []
    state.messagesByChannel[channelId] = [...messages, ...currentMessages]
  }
  return true
}

export function receiveMessage (channelId, text, recipientNick) {
  const channel = state.channels.find(item => item.id === channelId)
  if (!channel) throw new Error('Chat sa nenašiel.')
  if (channel.group && !channel.memberNicks.includes(state.me.nick)) {
    throw new Error('Do tohto kanála nemáte prístup.')
  }

  const sender = channel.group
    ? state.users.find(user => user.nick === 'nina' && channel.memberNicks.includes(user.nick))
    : state.users.find(user => user.nick === channel.nick)
  const resolvedRecipient = (recipientNick || extractRecipientNick(text))?.toLowerCase() || null
  const message = {
    id: `incoming-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mine: false,
    senderNick: sender?.nick || 'ukazka',
    senderName: sender?.name || 'Ukážkový používateľ',
    text,
    recipientNick: resolvedRecipient,
    date: new Date().toLocaleDateString('sk-SK')
  }

  if (state.me.status === 'offline') {
    const pending = state.pendingMessagesByChannel[channelId] || []
    pending.push(message)
    state.pendingMessagesByChannel[channelId] = pending
    return { delivered: false, queued: true, channel, message }
  }

  channel.lastActivityAt = Date.now()
  state.messagesByChannel[channelId] = [...(state.messagesByChannel[channelId] || []), message]
  if (state.activeId === channelId) {
    state.messages.push(message)
    channel.unread = 0
  } else {
    channel.unread += 1
  }
  return { delivered: true, queued: false, channel, message }
}

export function setUserStatus (status) {
  if (!['online', 'away', 'dnd', 'offline'].includes(status)) {
    throw new Error('Neplatný stav používateľa.')
  }

  state.me.status = status
  const user = state.users.find(item => item.nick === state.me.nick)
  if (user) user.status = status

  const deliveredMessages = []
  if (status === 'online') {
    for (const [channelId, pending] of Object.entries(state.pendingMessagesByChannel)) {
      const channel = state.channels.find(item => item.id === Number(channelId))
      if (!channel || (channel.group && !channel.memberNicks.includes(state.me.nick))) continue

      const currentMessages = state.messagesByChannel[channel.id] || []
      state.messagesByChannel[channel.id] = [...currentMessages, ...pending]
      if (state.activeId === channel.id) state.messages.push(...pending)
      else channel.unread += pending.length
      deliveredMessages.push(...pending)
      delete state.pendingMessagesByChannel[channelId]
    }
  }
  return deliveredMessages
}

export function updateCurrentUserProfile (oldNick, oldName, user) {
  const cleanNick = user.nick.toLowerCase()
  const existingUser = state.users.find(item =>
    item !== state.me && item.nick.toLowerCase() === cleanNick
  )
  if (existingUser) {
    throw new Error('Táto prezývka sa už používa.')
  }

  state.me.name = user.name
  state.me.email = user.email
  state.me.nick = cleanNick

  for (const channel of state.channels) {
    if (channel.nick === oldNick) {
      channel.nick = cleanNick
      channel.name = user.name
    }
    if (channel.ownerNick === oldNick) channel.ownerNick = cleanNick
    if (channel.members) {
      channel.members = channel.members.map(name => name === oldName ? user.name : name)
    }
    if (channel.memberNicks) {
      channel.memberNicks = channel.memberNicks.map(nick => nick === oldNick ? cleanNick : nick)
    }
    if (channel.invitedNicks) {
      channel.invitedNicks = channel.invitedNicks.map(nick => nick === oldNick ? cleanNick : nick)
    }
    if (channel.bannedNicks) {
      channel.bannedNicks = channel.bannedNicks.map(nick => nick === oldNick ? cleanNick : nick)
    }
    if (channel.kickVotes) {
      channel.kickVotes = Object.fromEntries(Object.entries(channel.kickVotes)
        .map(([nick, votes]) => [
          nick === oldNick ? cleanNick : nick,
          votes.map(vote => vote === oldNick ? cleanNick : vote)
        ]))
    }
  }

  for (const typingUsers of Object.values(state.typingByChannel)) {
    if (typingUsers && Object.hasOwn(typingUsers, oldNick)) {
      typingUsers[cleanNick] = typingUsers[oldNick]
      delete typingUsers[oldNick]
    }
  }
}

export function createGroup (name, members = [], type = 'public') {
  const cleanName = name.trim()
  if (!cleanName) throw new Error('Zadajte názov kanála.')
  if (channelByName(cleanName)) throw new Error(`Kanál #${cleanName} už existuje.`)

  const group = makeChannel({
    id: nextChannelId(),
    name: cleanName,
    group: true,
    type,
    ownerNick: state.me.nick,
    active: true,
    unread: 0,
    avatar: null,
    members: [state.me.name],
    memberNicks: [state.me.nick]
  })

  for (const nickname of members) {
    addMember(group, findUser(nickname.replace(/^@/, '')))
  }

  state.channels.push(group)
  state.messagesByChannel[group.id] = []
  selectChannel(group.id)
  return group
}

export function renameGroup (channelId, name) {
  const channel = findChannel(channelId)
  if (!channel.group) throw new Error('Tento chat nie je skupina.')
  if (channel.ownerNick !== state.me.nick) {
    throw new Error('Názov skupiny môže zmeniť iba jej správca.')
  }

  const cleanName = name.trim()
  if (!cleanName) throw new Error('Zadajte názov skupiny.')
  const duplicate = state.channels.find(item =>
    item.group &&
    item.id !== channel.id &&
    item.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase()
  )
  if (duplicate) throw new Error(`Skupina #${cleanName} už existuje.`)

  channel.name = cleanName
  return channel
}

export function joinChannel (name, type = 'public') {
  const cleanName = name.trim().replace(/^#/, '')
  if (!cleanName) throw new Error('Použite /join nazov-kanala [private].')

  let channel = channelByName(cleanName)
  if (!channel) return createGroup(cleanName, [], type)

  if (channel.memberNicks.includes(state.me.nick)) {
    selectChannel(channel.id)
    return channel
  }

  if (channel.type === 'private' && !channel.invitedNicks.includes(state.me.nick)) {
    throw new Error(`Kanál #${channel.name} je súkromný. Potrebujete pozvánku.`)
  }

  channel.invitedNicks = channel.invitedNicks.filter(nick => nick !== state.me.nick)
  addMember(channel, state.me)
  selectChannel(channel.id)
  return channel
}

export function inviteToChannel (channelId, nickname) {
  const channel = findChannel(channelId)
  const user = findUser(nickname.replace(/^@/, ''))
  const isOwner = channel.ownerNick === state.me.nick

  if (channel.type === 'private' && !isOwner) {
    throw new Error('Do súkromného kanála môže pozývať iba správca.')
  }
  if (channel.type === 'public' && !channel.memberNicks.includes(state.me.nick)) {
    throw new Error('Pozývať môže iba člen verejného kanála.')
  }

  if (channel.bannedNicks.includes(user.nick)) {
    if (!isOwner) throw new Error('Prístup zabanovanému používateľovi môže obnoviť iba správca.')
    channel.bannedNicks = channel.bannedNicks.filter(nick => nick !== user.nick)
    delete channel.kickVotes[user.nick]
  }

  if (!channel.memberNicks.includes(user.nick) && !channel.invitedNicks.includes(user.nick)) {
    channel.invitedNicks.push(user.nick)
  }
  return user
}

export function revokeFromChannel (channelId, nickname) {
  const channel = findChannel(channelId)
  if (channel.type !== 'private' || channel.ownerNick !== state.me.nick) {
    throw new Error('Používateľov zo súkromného kanála môže odoberať iba jeho správca.')
  }
  const user = findUser(nickname.replace(/^@/, ''))
  if (user.nick === channel.ownerNick) throw new Error('Správcu kanála nemožno odobrať.')
  channel.memberNicks = channel.memberNicks.filter(nick => nick !== user.nick)
  channel.members = channel.members.filter(name => name !== user.name)
  channel.invitedNicks = channel.invitedNicks.filter(nick => nick !== user.nick)
  return user
}

export function cancelChannelInvitation (channelId, nickname) {
  const channel = findChannel(channelId)
  const canManageInvitations = channel.type === 'private'
    ? channel.ownerNick === state.me.nick
    : channel.memberNicks.includes(state.me.nick)
  if (!canManageInvitations) {
    throw new Error('Pozvánky môže zrušiť iba správca súkromného kanála alebo člen verejného kanála.')
  }

  const user = findUser(nickname.replace(/^@/, ''))
  if (!channel.invitedNicks.includes(user.nick)) {
    throw new Error(`@${user.nick} nemá v tomto kanáli pozvánku.`)
  }
  channel.invitedNicks = channel.invitedNicks.filter(nick => nick !== user.nick)
  return user
}

export function kickFromChannel (channelId, nickname) {
  const channel = findChannel(channelId)
  if (channel.type !== 'public' || !channel.memberNicks.includes(state.me.nick)) {
    throw new Error('Tento príkaz môže použiť iba člen verejného kanála.')
  }
  const user = findUser(nickname.replace(/^@/, ''))
  if (user.nick === state.me.nick) throw new Error('Na opustenie kanála použite /cancel.')
  if (channel.ownerNick === user.nick && channel.ownerNick !== state.me.nick) {
    throw new Error('Správcu kanála nemôže vyhodiť iný člen.')
  }
  if (!channel.memberNicks.includes(user.nick) && !channel.kickVotes[user.nick]) {
    throw new Error(`@${user.nick} nie je členom kanála.`)
  }

  const votes = channel.kickVotes[user.nick] || []
  if (!votes.includes(state.me.nick)) votes.push(state.me.nick)
  channel.kickVotes[user.nick] = votes
  channel.memberNicks = channel.memberNicks.filter(nick => nick !== user.nick)
  channel.members = channel.members.filter(name => name !== user.name)

  if (channel.ownerNick === state.me.nick || votes.length >= 3) {
    if (!channel.bannedNicks.includes(user.nick)) channel.bannedNicks.push(user.nick)
    return { user, banned: true }
  }
  return { user, banned: false, votes: votes.length }
}

export function leaveChannel (channelId) {
  const channel = findChannel(channelId)
  if (channel.ownerNick === state.me.nick) {
    removeChannel(channel)
    return { destroyed: true, name: channel.name }
  }

  channel.memberNicks = channel.memberNicks.filter(nick => nick !== state.me.nick)
  channel.members = channel.members.filter(name => name !== state.me.name)
  channel.invitedNicks = channel.invitedNicks.filter(nick => nick !== state.me.nick)
  if (state.activeId === channel.id) {
    const fallback = state.channels.find(item => item.id !== channel.id && (!item.group || item.memberNicks?.includes(state.me.nick)))
    if (fallback) selectChannel(fallback.id)
  }
  return { destroyed: false, name: channel.name }
}

export function closeChannel (channelId) {
  const channel = findChannel(channelId)
  if (channel.ownerNick !== state.me.nick) throw new Error('Kanál môže zrušiť iba jeho správca.')
  removeChannel(channel)
  return channel.name
}

export function listChannelMembers (channelId) {
  const channel = findChannel(channelId)
  if (!channel.memberNicks.includes(state.me.nick)) throw new Error('Zoznam členov vidia iba členovia kanála.')
  return channel.memberNicks.map(nick => `@${nick}`)
}

export function getChannelMembers (channelId) {
  const channel = findChannel(channelId)
  if (!channel.memberNicks.includes(state.me.nick)) throw new Error('Zoznam členov vidia iba členovia kanála.')

  return channel.memberNicks.map(nick => {
    const user = findUser(nick)
    return { ...user, status: user.status || 'online', isOwner: channel.ownerNick === nick }
  })
}

export function addFriend (nickname) {
  const user = findUser(nickname.replace(/^@/, ''))
  if (user.nick === state.me.nick) throw new Error('Nemôžete pridať sami seba.')

  const existing = state.channels.find(channel => !channel.group && channel.nick === user.nick)
  if (existing) {
    selectChannel(existing.id)
    return { channel: existing, added: false }
  }

  const channel = {
    id: nextChannelId(),
    name: user.name,
    nick: user.nick,
    group: false,
    active: false,
    unread: 0,
    avatar: null
  }

  state.channels.push(channel)
  state.messagesByChannel[channel.id] = []
  selectChannel(channel.id)
  return { channel, added: true }
}

export function checkInactiveChannels () {
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const removed = []

  for (let i = state.channels.length - 1; i >= 0; i--) {
    const channel = state.channels[i]
    if (channel.group && channel.lastActivityAt && (now - channel.lastActivityAt > thirtyDaysMs)) {
      removed.push(channel)
      removeChannel(channel)
    }
  }

  return removed
}

export function extractRecipientNick (text) {
  if (!text) return null
  const match = text.match(/@([a-zA-Z0-9_.-]+)/)
  return match ? match[1].toLowerCase() : null
}

export function send (text) {
  const recipientNick = extractRecipientNick(text)
  const message = {
    id: Date.now(),
    mine: true,
    text,
    recipientNick,
    date: new Date().toLocaleDateString('sk-SK')
  }
  state.messages.push(message)
  if (state.messagesByChannel[state.activeId]) {
    state.messagesByChannel[state.activeId] = state.messages.slice()
  }
  const channel = state.channels.find(c => c.id === state.activeId)
  if (channel) {
    channel.lastActivityAt = Date.now()
  }
  return message
}

export function openUserProfile (userOrNick) {
  if (!userOrNick) return
  const rawNick = (typeof userOrNick === 'string' ? userOrNick : (userOrNick.nick || userOrNick.senderNick)) || ''
  const cleanNick = rawNick.replace(/^@/, '').toLowerCase().trim()
  if (!cleanNick) return

  let user = state.users.find(u => u.nick?.toLowerCase() === cleanNick)
  if (!user) {
    if (state.me.nick?.toLowerCase() === cleanNick) {
      user = state.me
    } else {
      user = {
        name: typeof userOrNick === 'object' && userOrNick.name ? userOrNick.name : `@${cleanNick}`,
        nick: cleanNick,
        status: 'online'
      }
    }
  }
  state.activeUserProfile = { ...user }
}

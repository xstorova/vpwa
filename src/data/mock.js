import { reactive } from 'vue'
import { authState } from '../services/auth.js'

const currentUser = authState.user.value || { name: 'Michal Novák', nick: 'michal', status: 'online' }
const initialUsers = [
  currentUser,
  { name: 'Nina Kováčová', nick: 'nina' },
  { name: 'Tomáš Bielik', nick: 'tomas' },
  { name: 'Peter Novotný', nick: 'peter' },
  { name: 'Laura Poláková', nick: 'laura' }
]

function makeChannel (channel) {
  return {
    ...channel,
    type: channel.type || 'public',
    ownerNick: channel.ownerNick || currentUser.nick,
    memberNicks: channel.memberNicks || [currentUser.nick],
    invitedNicks: channel.invitedNicks || [],
    bannedNicks: channel.bannedNicks || [],
    kickVotes: channel.kickVotes || {}
  }
}

// Mock dáta - v 2. fáze ich nahradí backend (AdonisJS)
export const state = reactive({
  me: currentUser,
  users: initialUsers,
  activeId: 1,
  channels: [
    { id: 1, name: 'Nina Kováčová', nick: 'nina', group: false, active: true, unread: 0, avatar: null },
    makeChannel({
      id: 2,
      name: 'Projekt OOP',
      group: true,
      active: true,
      unread: 2,
      avatar: null,
      members: [currentUser.name, 'Nina Kováčová', 'Tomáš Bielik'],
      memberNicks: [currentUser.nick, 'nina', 'tomas']
    }),
    { id: 3, name: 'Peter Novotný', nick: 'peter', group: false, active: false, unread: 0, avatar: null },
    { id: 4, name: 'Laura Poláková', nick: 'laura', group: false, active: false, unread: 0, avatar: null }
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
    return { ...user, isOwner: channel.ownerNick === nick }
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

export function send (text) {
  const recipient = text.match(/^@([a-zA-Z0-9_.-]+)(?:\s|$)/)
  const message = {
    id: Date.now(),
    mine: true,
    text,
    recipientNick: recipient?.[1]?.toLocaleLowerCase(),
    date: new Date().toLocaleDateString('sk-SK')
  }
  state.messages.push(message)
  return message
}

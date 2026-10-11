<template>
  <q-layout view="lHh Lpr lFf" class="chat-app-layout">
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="270"
      class="sidebar-container"
    >
      <div class="user-profile row items-center no-wrap cursor-pointer" title="Kliknite pre správu účtu">
        <q-avatar size="52px" color="orange-1" text-color="deep-orange-8" class="profile-avatar">
          {{ initial(state.me.name) }}
        </q-avatar>

        <div class="user-display-name q-ml-md">
          <template v-if="state.me.name && state.me.name.includes(' ')">
            <div>{{ state.me.name.split(' ')[0] }}</div>
            <div>{{ state.me.name.split(' ').slice(1).join(' ') }}</div>
          </template>
          <template v-else>
            <div>{{ state.me.name || 'Meno Priezvisko' }}</div>
          </template>
        </div>

        <q-menu class="user-account-menu" anchor="bottom start" self="top start">
          <div class="q-pa-md user-account-menu-card">
            <div class="row items-center q-mb-sm">
              <q-avatar size="36px" color="orange-1" text-color="deep-orange-8" class="q-mr-sm">
                {{ initial(state.me.name) }}
              </q-avatar>
              <div>
                <div class="text-weight-bold text-grey-9">{{ state.me.name }}</div>
                <div class="text-caption text-grey-7">@{{ state.me.nick || 'pouzivatel' }}</div>
              </div>
            </div>

            <div class="row items-center q-gutter-x-xs q-mb-md">
              <q-badge color="positive" rounded />
              <span class="text-caption text-grey-7">Online</span>
            </div>

            <q-separator class="q-mb-md" />

            <q-btn
              color="deep-orange-7"
              text-color="white"
              icon="logout"
              label="Odhlásiť sa"
              class="full-width text-weight-bold"
              size="sm"
              unelevated
              @click="handleLogout"
            />
          </div>
        </q-menu>
      </div>

      <div class="q-px-md q-pb-sm q-gutter-y-sm">
        <q-btn
          dense
          unelevated
          class="sidebar-action-btn"
          icon="group_add"
          size="sm"
          label="Nový kanál"
          @click="groupDialog = true"
        />
        <q-btn
          dense
          unelevated
          class="sidebar-action-btn"
          icon="person_add"
          size="sm"
          label="Pridať kamaráta"
          @click="friendDialog = true"
        />
      </div>

      <div class="sidebar-section-title row items-center no-wrap">
        <span>Moje chaty</span>
        <q-space />
      </div>

      <q-list class="sidebar-channel-list">
        <q-item
          v-for="c in visibleChannels"
          :key="c.id"
          clickable
          v-ripple
          class="channel-row-item"
          :class="{
            'is-selected': c.id === state.activeId,
            'is-invited': c.group && c.invitedNicks?.includes(state.me.nick)
          }"
          @click="selectChat(c.id)"
        >
          <q-item-section side class="status-indicator-cell">
            <q-icon
              :name="c.group ? 'groups' : 'lightbulb'"
              :color="c.active ? 'deep-orange-7' : 'grey-5'"
              size="21px"
            />
            <span v-if="c.unread" class="unread-badge">{{ c.unread }}</span>
          </q-item-section>

          <q-item-section avatar class="channel-avatar-cell">
            <q-avatar
              size="36px"
              :src="c.avatar || undefined"
              :color="c.group ? 'deep-orange-1' : 'orange-1'"
              text-color="deep-orange-8"
            >
              <span v-if="!c.avatar">{{ initial(c.name) }}</span>
            </q-avatar>
          </q-item-section>

          <q-item-section class="channel-name-text">
            {{ c.name }}
            <q-item-label v-if="c.group && c.members?.length" caption class="channel-members-caption">
              {{ c.invitedNicks?.includes(state.me.nick) ? 'Pozvánka • ' : '' }}{{ membersLabel(c) }}
            </q-item-label>
          </q-item-section>

          <q-item-section v-if="c.group" side>
            <q-btn flat round dense icon="more_vert" color="grey-7" aria-label="Možnosti kanála">
              <q-menu>
                <q-list dense style="min-width: 170px">
                  <q-item v-if="c.ownerNick !== state.me.nick" clickable v-close-popup @click="handleLeave(c.id)">
                    <q-item-section avatar><q-icon name="logout" /></q-item-section>
                    <q-item-section>Opustiť kanál</q-item-section>
                  </q-item>
                  <q-item v-if="c.ownerNick === state.me.nick" clickable v-close-popup @click="handleClose(c.id)">
                    <q-item-section avatar><q-icon name="delete_outline" color="negative" /></q-item-section>
                    <q-item-section class="text-negative">Zrušiť kanál</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-header class="header-container row items-center no-wrap q-px-lg">
      <q-btn flat round icon="menu" class="lt-md q-mr-sm" @click="drawer = !drawer" />

      <q-avatar size="44px" :color="current?.group ? 'deep-orange-1' : 'orange-1'" text-color="deep-orange-8" class="header-user-avatar">
        {{ initial(current?.name || state.me.name) }}
      </q-avatar>

      <div class="q-ml-md">
        <div class="header-channel-title">{{ current?.name || 'Chat' }}</div>
        <div class="header-channel-caption">
          {{ current?.group ? `${current.type === 'private' ? 'Súkromný' : 'Verejný'} kanál • ${membersLabel(current)}` : 'Osobný chat • online' }}
        </div>
      </div>

      <q-space />

      <q-btn
        v-if="current?.group && current.memberNicks?.includes(state.me.nick)"
        flat
        round
        icon="people"
        size="md"
        color="grey-7"
        class="header-icon-btn"
        aria-label="Zobraziť členov kanála"
        @click="showMembers"
      >
        <q-tooltip>Členovia kanála</q-tooltip>
      </q-btn>
      <q-btn flat round icon="search" size="md" color="grey-7" class="header-icon-btn" />
      <q-btn flat round icon="settings" size="md" color="grey-7" class="q-mr-xs header-icon-btn" />
      <q-btn flat round icon="push_pin" size="md" color="grey-7" class="header-icon-btn" />
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="chat-footer-bar row items-center no-wrap q-px-lg q-py-md">
      <q-input
        v-model="text"
        rounded
        standout
        dense
        borderless
        class="col message-input-field"
        placeholder="Napíšte správu alebo príkaz"
        :disable="current?.group && !current.memberNicks?.includes(state.me.nick)"
        @keyup.enter="submit"
      >
        <template #prepend>
          <q-icon name="sentiment_satisfied" color="black" size="22px" class="q-ml-xs" />
        </template>
      </q-input>

      <q-btn flat round icon="help_outline" color="grey-7" aria-label="Príkazy kanálov">
        <q-menu>
          <q-list dense class="q-pa-sm">
            <q-item-label header>Príkazy kanálov</q-item-label>
            <q-item><q-item-section>/join nazov [private]</q-item-section></q-item>
            <q-item><q-item-section>/invite nick</q-item-section></q-item>
            <q-item><q-item-section>/revoke nick (súkromný)</q-item-section></q-item>
            <q-item><q-item-section>/kick nick (verejný)</q-item-section></q-item>
            <q-item><q-item-section>/list, /cancel, /quit</q-item-section></q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn round unelevated class="footer-action-btn q-ml-md" icon="image" size="md" />
      <q-btn round unelevated class="footer-action-btn q-ml-sm" icon="add" size="md" />
      <q-btn round unelevated class="footer-action-btn q-ml-sm" icon="send" size="md" @click="submit" />
    </q-footer>

    <q-dialog v-model="friendDialog">
      <q-card class="group-dialog">
        <q-form @submit.prevent="submitFriend">
          <q-card-section class="row items-center q-pb-sm">
            <q-avatar color="deep-orange-1" text-color="deep-orange-8" icon="person_add" class="q-mr-md" />
            <div>
              <div class="text-h6">Pridať kamaráta</div>
              <div class="text-caption text-grey-7">Nájdite používateľa podľa prezývky.</div>
            </div>
            <q-space />
            <q-btn flat round dense icon="close" aria-label="Zavrieť" v-close-popup />
          </q-card-section>

          <q-card-section class="q-pt-sm">
            <q-input
              v-model="friendNickname"
              outlined
              autofocus
              label="Prezývka"
              hint="Napríklad nina, tomas, peter alebo laura."
              color="deep-orange-8"
              :rules="[value => !!value.trim() || 'Zadajte prezývku']"
            >
              <template #prepend><q-icon name="alternate_email" /></template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat label="Zrušiť" color="grey-7" v-close-popup />
            <q-btn unelevated type="submit" label="Pridať" color="deep-orange-7" text-color="white" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="membersDialog">
      <q-card class="group-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <q-avatar color="deep-orange-1" text-color="deep-orange-8" icon="groups" class="q-mr-md" />
          <div>
            <div class="text-h6">Členovia kanála</div>
            <div class="text-caption text-grey-7">{{ current?.name }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" aria-label="Zavrieť" v-close-popup />
        </q-card-section>

        <q-list separator>
          <q-item v-for="member in channelMembers" :key="member.nick">
            <q-item-section avatar>
              <q-avatar color="orange-1" text-color="deep-orange-8">{{ initial(member.name) }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ member.name }}</q-item-label>
              <q-item-label caption>@{{ member.nick }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge v-if="member.isOwner" color="deep-orange-7" label="Správca" />
              <q-badge v-else-if="member.nick === state.me.nick" color="grey-6" label="Vy" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>

    <q-dialog v-model="groupDialog">
      <q-card class="group-dialog">
        <q-form @submit.prevent="submitGroup">
          <q-card-section class="row items-center q-pb-sm">
            <q-avatar color="deep-orange-1" text-color="deep-orange-8" icon="groups" class="q-mr-md" />
            <div>
              <div class="text-h6">Vytvoriť skupinu</div>
              <div class="text-caption text-grey-7">Založte verejný alebo súkromný kanál.</div>
            </div>
            <q-space />
            <q-btn flat round dense icon="close" aria-label="Zavrieť" v-close-popup />
          </q-card-section>

          <q-card-section class="q-pt-sm q-gutter-y-md">
            <q-input
              v-model="groupName"
              outlined
              autofocus
              label="Názov kanála"
              color="deep-orange-8"
              :rules="[value => !!value.trim() || 'Zadajte názov kanála']"
            />
            <q-btn-toggle
              v-model="groupType"
              spread
              unelevated
              toggle-color="deep-orange-7"
              color="orange-1"
              text-color="deep-orange-9"
              :options="[
                { label: 'Verejný', value: 'public', icon: 'public' },
                { label: 'Súkromný', value: 'private', icon: 'lock' }
              ]"
            />
            <q-input
              v-model="groupMembers"
              outlined
              label="Pridať členov (voliteľné)"
              hint="Zadajte prezývky: nina, tomas, peter alebo laura."
              color="deep-orange-8"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat label="Zrušiť" color="grey-7" v-close-popup />
            <q-btn unelevated type="submit" label="Vytvoriť kanál" color="deep-orange-7" text-color="white" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authState } from '../services/auth'
import {
  closeChannel,
  addFriend,
  createGroup,
  getChannelMembers,
  inviteToChannel,
  joinChannel,
  kickFromChannel,
  leaveChannel,
  listChannelMembers,
  revokeFromChannel,
  selectChannel,
  send,
  state
} from '../data/mock'

const router = useRouter()
const $q = useQuasar()
const drawer = ref(true)
const text = ref('')
const groupDialog = ref(false)
const friendDialog = ref(false)
const membersDialog = ref(false)
const groupName = ref('')
const groupMembers = ref('')
const groupType = ref('public')
const friendNickname = ref('')

const current = computed(() => state.channels.find(c => c.id === state.activeId) || state.channels[0])
const channelMembers = computed(() => (
  current.value?.group && current.value.memberNicks?.includes(state.me.nick)
    ? getChannelMembers(current.value.id)
    : []
))
const visibleChannels = computed(() => [...state.channels]
  .filter(channel => !channel.group || channel.memberNicks?.includes(state.me.nick) || channel.invitedNicks?.includes(state.me.nick))
  .sort((a, b) => Number(b.invitedNicks?.includes(state.me.nick)) - Number(a.invitedNicks?.includes(state.me.nick))))

watchEffect(() => {
  if (authState.user.value) {
    state.me.name = authState.user.value.name
    state.me.nick = authState.user.value.nick
  }
})

function handleLogout() {
  authState.logout()
  router.push('/login')
}

function initial(name) {
  const trimmedName = String(name || '').trim()
  return trimmedName ? trimmedName.charAt(0).toLocaleUpperCase('sk') : '?'
}

function membersLabel(channel) {
  const count = channel.memberNicks?.length || channel.members?.length || 0
  const noun = count === 1 ? 'člen' : count < 5 ? 'členovia' : 'členov'
  return `${count} ${noun}`
}

function selectChat(channelId) {
  const channel = state.channels.find(item => item.id === channelId)
  if (channel?.group && channel.invitedNicks?.includes(state.me.nick) && !channel.memberNicks.includes(state.me.nick)) {
    runAction(() => joinChannel(channel.name), `Pripojili ste sa do kanála #${channel.name}.`)
    return
  }
  selectChannel(channelId)
}

function submitGroup() {
  const members = groupMembers.value
    .split(',')
    .map(member => member.trim())
    .filter(Boolean)

  runAction(() => createGroup(groupName.value, members, groupType.value), channel => {
    groupName.value = ''
    groupMembers.value = ''
    groupType.value = 'public'
    groupDialog.value = false
    return `Kanál #${channel.name} bol vytvorený.`
  })
}

function submitFriend() {
  runAction(() => addFriend(friendNickname.value), result => {
    friendNickname.value = ''
    friendDialog.value = false
    return result.added
      ? `@${result.channel.nick} bol pridaný medzi vaše chaty.`
      : `Chat s @${result.channel.nick} už existuje.`
  })
}

function showMembers() {
  runAction(() => getChannelMembers(current.value.id), () => {
    membersDialog.value = true
    return ''
  })
}

function submit() {
  const value = text.value.trim()
  if (!value) return

  if (value.startsWith('/')) {
    handleCommand(value)
    text.value = ''
    return
  }

  if (current.value?.group && !current.value.memberNicks?.includes(state.me.nick)) {
    notify('Pred odoslaním správy sa najprv pripojte do kanála.', 'negative')
    return
  }
  send(value)
  text.value = ''
}

function notify(message, type = 'positive') {
  $q.notify({ type, message, position: 'top' })
}

function runAction(action, successMessage) {
  try {
    const result = action()
    const message = typeof successMessage === 'function' ? successMessage(result) : successMessage
    if (message) notify(message)
  } catch (error) {
    notify(error.message, 'negative')
  }
}

function handleCommand(value) {
  const [command, ...args] = value.trim().split(/\s+/)
  const name = command.toLocaleLowerCase()
  const activeChannel = current.value

  if (name === '/join') {
    if (!args[0] || args.length > 2 || (args[1] && args[1].toLocaleLowerCase() !== 'private')) {
      notify('Použitie: /join channelName [private]', 'negative')
      return
    }
    runAction(
      () => joinChannel(args[0], args[1] ? 'private' : 'public'),
      channel => `Ste v kanáli #${channel.name} (${channel.type === 'private' ? 'súkromný' : 'verejný'}).`
    )
    return
  }

  if (!activeChannel?.group) {
    notify('Tento príkaz použite v kanáli.', 'negative')
    return
  }

  if (name === '/invite' && args.length === 1) {
    runAction(
      () => inviteToChannel(activeChannel.id, args[0]),
      user => `Pozvánka do #${activeChannel.name} bola pripravená pre @${user.nick}.`
    )
  } else if (name === '/revoke' && args.length === 1) {
    runAction(
      () => revokeFromChannel(activeChannel.id, args[0]),
      user => `@${user.nick} bol odobratý z kanála #${activeChannel.name}.`
    )
  } else if (name === '/kick' && args.length === 1) {
    runAction(
      () => kickFromChannel(activeChannel.id, args[0]),
      result => result.banned
        ? `@${result.user.nick} bol natrvalo vyhodený z #${activeChannel.name}.`
        : `@${result.user.nick} bol vyhodený. Počet hlasov: ${result.votes}/3.`
    )
  } else if (name === '/list' && args.length === 0) {
    runAction(
      () => listChannelMembers(activeChannel.id),
      members => `Členovia #${activeChannel.name}: ${members.join(', ')}`
    )
  } else if (name === '/quit' && args.length === 0) {
    runAction(() => closeChannel(activeChannel.id), channelName => `Kanál #${channelName} bol zrušený.`)
  } else if (name === '/cancel' && args.length === 0) {
    runAction(
      () => leaveChannel(activeChannel.id),
      result => result.destroyed
        ? `Kanál #${result.name} zanikol, pretože ho opustil správca.`
        : `Opustili ste kanál #${result.name}.`
    )
  } else {
    notify('Neznámy príkaz alebo nesprávny formát. Dostupné: /join, /invite, /revoke, /kick, /quit, /cancel, /list.', 'negative')
  }
}

function handleLeave(channelId) {
  runAction(
    () => leaveChannel(channelId),
    result => result.destroyed ? `Kanál #${result.name} bol zrušený.` : `Opustili ste kanál #${result.name}.`
  )
}

function handleClose(channelId) {
  runAction(() => closeChannel(channelId), name => `Kanál #${name} bol zrušený.`)
}
</script>

<style lang="scss">
.chat-app-layout {
  font-family: Inter, Roboto, sans-serif;
  height: 100vh;
  overflow: hidden;
}

.sidebar-container {
  background: #ffffff !important;
  color: #332720;
  border-right: 1px solid #f1e6df;
}

.user-profile {
  padding: 22px 18px 16px;
  border-radius: 12px;
  transition: background 0.2s;

  &:hover {
    background: #fff7f1;
  }
}

.profile-avatar {
  font-size: 1.25rem;
  font-weight: 700;
}

.user-display-name {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.1;
  color: #34251e;
}

.user-account-menu-card {
  min-width: 220px;
  background: #ffffff;
  border: 1px solid #f2e4db;
  border-radius: 12px;
}

.sidebar-action-btn {
  width: 100%;
  height: 36px;
  border-radius: 10px;
  background: #fff0e7 !important;
  color: #c64b22 !important;

  &:hover {
    color: #a73714 !important;
    background: #ffe3d3 !important;
  }
}

.sidebar-section-title {
  padding: 10px 14px 6px 18px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #6f574a;
}

.sidebar-channel-list {
  padding: 0 4px;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}

.channel-row-item {
  min-height: 54px;
  padding: 6px 12px;
  border-radius: 11px;
  margin: 2px 4px;
  color: #3f3029;

  &.is-selected {
    background: #fff0e7;
    color: #a73714;
  }

  &.is-invited {
    background: #fff7d6;
    border: 1px solid #f1d477;
  }

  &:hover {
    background: #fff7f1;
  }
}

.status-indicator-cell {
  position: relative;
  min-width: 32px;
  padding-right: 4px;
}

.unread-badge {
  position: absolute;
  right: -2px;
  bottom: -4px;
  background: #f27645;
  color: #fff;
  border-radius: 50%;
  min-width: 16px;
  height: 16px;
  font-size: 9px;
  font-weight: bold;
  line-height: 16px;
  text-align: center;
}

.channel-avatar-cell {
  min-width: 46px;
  padding-right: 10px;
}

.channel-name-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: inherit;
}

.channel-members-caption {
  color: #9a8376;
  font-size: 0.72rem;
}

.header-container {
  background: #ffffff !important;
  color: #332720;
  height: 72px;
  box-shadow: 0 2px 12px rgba(79, 47, 26, 0.04) !important;
  border-bottom: 1px solid #f1e6df;
}

.header-user-avatar {
  font-weight: 700;
}

.header-channel-title {
  font-size: 1.05rem;
  line-height: 1.3;
  font-weight: 700;
  color: #34251e;
}

.header-channel-caption {
  color: #9a8376;
  font-size: 0.75rem;
}

.header-icon-btn {
  opacity: 0.75;

  &:hover {
    opacity: 1;
    color: #c64b22 !important;
  }
}

.chat-footer-bar {
  background: #ffffff !important;
  box-shadow: 0 -2px 12px rgba(79, 47, 26, 0.04) !important;
  border-top: 1px solid #f1e6df;
}

.message-input-field {
  .q-field__control {
    background: #fffaf6 !important;
    border: 1px solid #f0dfd4;
    border-radius: 24px !important;
    min-height: 46px;
    padding: 0 12px;
  }

  .q-field__native {
    color: #332720 !important;
    font-size: 0.95rem;

    &::placeholder {
      color: #9a8376 !important;
    }
  }

  .q-field__prepend {
    color: #c64b22;
    margin-left: 8px;
    margin-right: 6px;
  }
}

.footer-action-btn {
  background: #fff0e7 !important;
  color: #c64b22 !important;
  width: 44px;
  height: 44px;

  &:hover {
    background: #ffe3d3 !important;
  }
}

.group-dialog {
  width: 100%;
  max-width: 440px;
  border-radius: 18px;
  color: #332720;
}

@media (max-width: 599px) {
  .chat-footer-bar {
    padding-left: 12px;
    padding-right: 12px;
  }

  .footer-action-btn {
    width: 38px;
    height: 38px;
  }
}
</style>

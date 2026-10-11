<template>
  <q-layout view="lHh LpR lFf" class="chat-app-layout">
    <!-- Bočný panel (Sidebar) -->
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="270"
      class="sidebar-container"
    >
      <!-- Profil používateľa (Účet s možnosťou odhlásenia) -->
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

        <!-- Menu používateľského účtu po kliknutí na profil -->
        <q-menu class="user-account-menu" anchor="bottom start" self="top start">
          <div class="q-pa-md" style="min-width: 220px; background: #ffffff; border: 1px solid #f2e4db; border-radius: 12px;">
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

      <!-- Akčné tlačidlá v bočnom paneli -->
      <div class="q-px-md q-pb-sm row q-gutter-x-sm">
        <q-btn
          dense
          unelevated
          class="sidebar-action-btn"
          icon="group_add"
          size="sm"
          label="Nová skupina"
          @click="groupDialog = true"
        />
      </div>

      <!-- Všetky chaty zostávajú dostupné bez ohľadu na stav aktivity -->
      <div class="sidebar-section-title row items-center no-wrap">
        <span>Moje chaty</span>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="add"
          color="deep-orange-8"
          aria-label="Vytvoriť skupinu"
          @click="groupDialog = true"
        />
      </div>

      <q-list class="sidebar-channel-list">
        <q-item
          v-for="c in state.channels"
          :key="c.id"
          clickable
          v-ripple
          class="channel-row-item"
          :class="{ 'is-selected': c.id === state.activeId }"
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
              {{ membersLabel(c) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Horná lišta (Header chatu) -->
    <q-header class="header-container row items-center no-wrap q-px-lg">
      <q-btn flat round icon="menu" class="lt-md q-mr-sm" @click="drawer = !drawer" />

      <q-avatar
        size="44px"
        :src="current?.avatar || undefined"
        :color="current?.group ? 'deep-orange-1' : 'orange-1'"
        text-color="deep-orange-8"
        class="header-user-avatar"
      >
        <span v-if="!current?.avatar">{{ initial(current?.name) }}</span>
      </q-avatar>

      <div class="header-user-info q-ml-md">
        <div class="header-channel-title">{{ current?.name || 'Meno Priezvisko' }}</div>
        <div v-if="current?.group" class="header-channel-caption">
          {{ membersLabel(current) }}
        </div>
      </div>

      <q-space />

      <!-- Ikony v chate podľa obrázka (nastavenia, pripnutie) -->
      <q-btn flat round icon="settings" size="md" color="grey-7" class="q-mr-xs header-icon-btn" />
      <q-btn flat round icon="push_pin" size="md" color="grey-7" class="header-icon-btn" />
    </q-header>

    <!-- Obsah stránky (Chat) -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Spodná lišta na písanie správy -->
    <q-footer class="chat-footer-bar row items-center no-wrap q-px-lg q-py-md">
      <q-input
        v-model="text"
        rounded
        standout
        dense
        borderless
        class="col message-input-field"
        placeholder="Message"
        @keyup.enter="submit"
      >
        <template #prepend>
          <q-icon name="sentiment_satisfied" color="black" size="22px" class="q-ml-xs" />
        </template>
      </q-input>

      <q-btn round unelevated class="footer-action-btn q-ml-md" icon="image" size="md" />
      <q-btn round unelevated class="footer-action-btn q-ml-sm" icon="add" size="md" />
      <q-btn round unelevated class="footer-action-btn q-ml-sm" icon="sentiment_very_satisfied" size="md" />
    </q-footer>

    <q-dialog v-model="groupDialog">
      <q-card class="group-dialog">
        <q-form @submit.prevent="submitGroup">
          <q-card-section class="row items-center q-pb-sm">
            <q-avatar color="deep-orange-1" text-color="deep-orange-8" icon="groups" class="q-mr-md" />
            <div>
              <div class="text-h6">Vytvoriť skupinu</div>
              <div class="text-caption text-grey-7">Založte nový skupinový chat.</div>
            </div>
            <q-space />
            <q-btn flat round dense icon="close" aria-label="Zavrieť" v-close-popup />
          </q-card-section>

          <q-card-section class="q-pt-sm q-gutter-y-md">
            <q-input
              v-model="groupName"
              outlined
              autofocus
              label="Názov skupiny"
              color="deep-orange-8"
              :rules="[value => !!value.trim() || 'Zadajte názov skupiny']"
            />
            <q-input
              v-model="groupMembers"
              outlined
              label="Členovia (voliteľné)"
              hint="Mená alebo prezývky oddeľte čiarkou."
              color="deep-orange-8"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat label="Zrušiť" color="grey-7" v-close-popup />
            <q-btn unelevated type="submit" label="Vytvoriť skupinu" color="deep-orange-7" text-color="white" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { state, send, selectChannel, createGroup } from '../data/mock'
import { authState } from '../services/auth'

const router = useRouter()
const drawer = ref(true)
const text = ref('')
const groupDialog = ref(false)
const groupName = ref('')
const groupMembers = ref('')
const current = computed(() => state.channels.find(c => c.id === state.activeId) || state.channels[0])

// Synchronizácia prihláseného používateľa
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
  const count = channel.members?.length || 0
  const noun = count === 1 ? 'člen' : count < 5 ? 'členovia' : 'členov'
  return `${count} ${noun}`
}

function selectChat(channelId) {
  selectChannel(channelId)
}

function submitGroup() {
  const name = groupName.value.trim()
  if (!name) return

  const members = groupMembers.value
    .split(',')
    .map(member => member.trim())
    .filter(Boolean)

  createGroup(name, members)
  groupName.value = ''
  groupMembers.value = ''
  groupDialog.value = false
}

function submit() {
  const t = text.value.trim()
  if (!t) return
  send(t)
  text.value = ''
}
</script>

<style lang="scss">
.chat-app-layout {
  background: #fffaf6;
  color: #332720;
  font-family: Inter, Roboto, sans-serif;
  height: 100vh;
  overflow: hidden;
}

/* SIDEBAR */
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

/* HEADER */
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

/* FOOTER */
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
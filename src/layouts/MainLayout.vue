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
        <q-avatar size="60px" color="grey-4" class="profile-avatar" />
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
        <q-menu dark class="user-account-menu" anchor="bottom start" self="top start">
          <div class="q-pa-md" style="min-width: 220px; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
            <div class="row items-center q-mb-sm">
              <q-avatar size="36px" color="grey-4" class="q-mr-sm" />
              <div>
                <div class="text-weight-bold text-white">{{ state.me.name }}</div>
                <div class="text-caption text-grey-5">@{{ state.me.nick || 'pouzivatel' }}</div>
              </div>
            </div>
            <div class="row items-center q-gutter-x-xs q-mb-md">
              <q-badge color="positive" rounded />
              <span class="text-caption text-grey-4">Online</span>
            </div>
            <q-separator dark class="q-mb-md" />
            <q-btn
              color="amber"
              text-color="dark"
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
        <q-btn dense unelevated class="sidebar-action-btn" icon="search" size="sm" />
        <q-btn dense unelevated class="sidebar-action-btn" icon="person_add" size="sm" />
      </div>

      <!-- Sekcia: Aktívne kanály -->
      <div class="sidebar-section-title row items-center no-wrap">
        <span>Active</span>
        <q-icon name="lightbulb" color="amber-7" size="20px" class="q-ml-xs glow-bulb" />
      </div>

      <q-list class="sidebar-channel-list">
        <q-item
          v-for="c in active"
          :key="c.id"
          clickable
          v-ripple
          class="channel-row-item"
          :class="{ 'is-selected': c.id === state.activeId }"
          @click="state.activeId = c.id"
        >
          <q-item-section side class="status-indicator-cell">
            <q-icon name="lightbulb" color="amber-7" size="22px" />
            <span v-if="c.unread" class="unread-badge">{{ c.unread }}</span>
          </q-item-section>

          <q-item-section avatar class="channel-avatar-cell">
            <div v-if="c.group" class="group-avatar-stack">
              <span class="back-avatar" />
              <span class="front-avatar" />
            </div>
            <q-avatar v-else size="32px" color="grey-4" />
          </q-item-section>

          <q-item-section class="channel-name-text">
            {{ c.name }}
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Sekcia: Send light -->
      <div class="sidebar-section-title q-mt-md">
        <span>Send light</span>
      </div>

      <q-list class="sidebar-channel-list">
        <q-item
          v-for="c in dark"
          :key="c.id"
          clickable
          v-ripple
          class="channel-row-item"
          :class="{ 'is-selected': c.id === state.activeId }"
          @click="state.activeId = c.id"
        >
          <q-item-section side class="status-indicator-cell">
            <q-icon name="lightbulb" class="dim-bulb-icon" size="22px" />
          </q-item-section>

          <q-item-section avatar class="channel-avatar-cell">
            <div v-if="c.group" class="group-avatar-stack">
              <span class="back-avatar" />
              <span class="front-avatar" />
            </div>
            <q-avatar v-else size="32px" color="grey-4" />
          </q-item-section>

          <q-item-section class="channel-name-text">
            {{ c.name }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Horná lišta (Header chatu) -->
    <q-header class="header-container row items-center no-wrap q-px-lg">
      <q-btn flat round icon="menu" class="lt-md q-mr-sm" @click="drawer = !drawer" />

      <q-avatar size="44px" color="grey-4" class="header-user-avatar" />

      <div class="header-user-info q-ml-md">
        <div class="header-channel-title">
          <template v-if="current?.name && current.name.includes(' ')">
            <div>{{ current.name.split(' ')[0] }}</div>
            <div>{{ current.name.split(' ').slice(1).join(' ') }}</div>
          </template>
          <template v-else>
            {{ current?.name || 'Meno Priezvisko' }}
          </template>
        </div>
      </div>

      <q-space />

      <!-- Ikony v chate podľa obrázka (nastavenia, pripnutie) -->
      <q-btn flat round icon="settings" size="md" color="grey-5" class="q-mr-xs header-icon-btn" />
      <q-btn flat round icon="push_pin" size="md" color="grey-5" class="header-icon-btn" />
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
  </q-layout>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { state, send } from '../data/mock'
import { authState } from '../services/auth'

const router = useRouter()
const drawer = ref(true)
const text = ref('')
const active = computed(() => state.channels.filter(c => c.active))
const dark = computed(() => state.channels.filter(c => !c.active))
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

function submit() {
  const t = text.value.trim()
  if (!t) return
  send(t)
  text.value = ''
}
</script>

<style lang="scss">
.chat-app-layout {
  background: #242424;
  color: #ddd;
  font-family: Inter, Roboto, sans-serif;
  height: 100vh;
  overflow: hidden;
}

/* SIDEBAR */
.sidebar-container {
  background: #161616 !important;
  color: #eee;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.user-profile {
  padding: 24px 18px 14px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

.profile-avatar {
  background: #dedede !important;
}

.user-display-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.7rem;
  line-height: 1.1;
  color: #ffffff;
}

.sidebar-action-btn {
  width: 44px;
  height: 30px;
  border-radius: 8px;
  background: #2a2a2a !important;
  color: #888 !important;

  &:hover {
    color: #fff !important;
    background: #333 !important;
  }
}

.sidebar-section-title {
  padding: 12px 18px 6px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.35rem;
  color: #ffffff;
}

.glow-bulb {
  filter: drop-shadow(0 0 4px rgba(245, 179, 53, 0.7));
}

.dim-bulb-icon {
  color: #4a4239 !important;
}

.sidebar-channel-list {
  padding: 0 4px;
}

.channel-row-item {
  min-height: 48px;
  padding: 6px 14px;
  border-radius: 8px;
  margin: 2px 4px;

  &.is-selected {
    background: #252525;
  }

  &:hover {
    background: #1f1f1f;
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
  background: #f5b335;
  color: #111;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  font-size: 9px;
  font-weight: bold;
  line-height: 14px;
  text-align: center;
}

.channel-avatar-cell {
  min-width: 40px;
  padding-right: 8px;
}

.channel-name-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.05rem;
  color: #e2e2e2;
}

.group-avatar-stack {
  position: relative;
  width: 36px;
  height: 32px;

  span {
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .back-avatar {
    left: 0;
    top: 2px;
    background: #c5c5c5;
  }

  .front-avatar {
    left: 10px;
    top: 6px;
    background: #dedede;
    border: 1px solid #161616;
  }
}

/* HEADER */
.header-container {
  background: #242424 !important;
  color: #ddd;
  height: 72px;
  box-shadow: none !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.header-user-avatar {
  background: #dedede !important;
}

.header-channel-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.15rem;
  line-height: 1.15;
  color: #fff;
}

.header-icon-btn {
  opacity: 0.8;
  &:hover {
    opacity: 1;
    color: #fff !important;
  }
}

/* FOOTER */
.chat-footer-bar {
  background: #242424 !important;
  box-shadow: none !important;
  border-top: none;
}

.message-input-field {
  .q-field__control {
    background: #dedede !important;
    border-radius: 28px !important;
    height: 46px;
    padding: 0 16px;
  }

  .q-field__native {
    color: #111 !important;
    font-size: 0.95rem;

    &::placeholder {
      color: #333 !important;
    }
  }
}

.footer-action-btn {
  background: #dedede !important;
  color: #111 !important;
  width: 44px;
  height: 44px;

  &:hover {
    background: #ececec !important;
  }
}
</style>
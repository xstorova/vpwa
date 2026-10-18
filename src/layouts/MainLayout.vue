<template>
  <q-layout view="lHh Lpr lFf" class="chat-app-layout">
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="$q.screen.lt.sm ? 280 : 270"
      class="sidebar-container"
    >
      <div class="user-profile row items-center no-wrap cursor-pointer" title="Kliknite pre správu účtu">
        <q-avatar size="48px" color="orange-1" text-color="deep-orange-8" class="profile-avatar">
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

        <q-space v-if="$q.screen.lt.md" />
        <q-btn
          v-if="$q.screen.lt.md"
          flat
          round
          dense
          icon="close"
          color="grey-7"
          aria-label="Zavrieť menu"
          @click.stop="drawer = false"
        />

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
              <q-badge :color="statusColor(state.me.status)" rounded />
              <span class="text-caption text-grey-7">{{ statusLabel(state.me.status) }}</span>
            </div>

            <div class="text-caption text-grey-7 q-mb-xs">Môj stav</div>
            <q-btn-toggle
              :model-value="state.me.status"
              spread
              unelevated
              class="q-mb-md"
              toggle-color="deep-orange-7"
              color="orange-1"
              text-color="deep-orange-9"
              :options="[
                { label: 'Online', value: 'online' },
                { label: 'Preč', value: 'away' },
                { label: 'DND', value: 'dnd' },
                { label: 'Offline', value: 'offline' }
              ]"
              @update:model-value="changeStatus"
            />

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

    <q-header class="header-container row items-center no-wrap">
      <q-btn
        flat
        round
        dense
        icon="menu"
        class="lt-md q-mr-xs header-menu-btn"
        aria-label="Menu"
        @click="drawer = !drawer"
      />

      <div
        class="row items-center no-wrap header-clickable-info"
        :class="{ 'cursor-pointer': !current?.group }"
        :title="!current?.group ? `Kliknite pre zobrazenie profilu @${current?.nick}` : ''"
        @click="!current?.group && current?.nick ? openUserProfile(current.nick) : null"
      >
        <q-avatar size="40px" :color="current?.group ? 'deep-orange-1' : 'orange-1'" text-color="deep-orange-8" class="header-user-avatar">
          {{ initial(current?.name || state.me.name) }}
        </q-avatar>

        <div class="header-info-col q-ml-sm q-mr-xs">
          <div class="header-channel-title row items-center no-wrap">
            <span class="ellipsis">{{ current?.name || 'Chat' }}</span>
            <span v-if="!current?.group && current?.nick" class="header-nick-badge q-ml-xs">
              @{{ current.nick }}
            </span>
          </div>
          <div class="header-channel-caption ellipsis">
            {{ current?.group
              ? `${current.type === 'private' ? 'Súkromný' : 'Verejný'} kanál • ${membersLabel(current)} • ${channelActivityLabel(current)}`
              : `Osobný chat • ${statusLabel(state.users.find(user => user.nick === current?.nick)?.status || 'online')} • ${channelActivityLabel(current)}` }}
          </div>
        </div>
      </div>

      <q-space />

      <div class="row items-center no-wrap header-actions-row">
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
        <q-btn flat round icon="search" size="md" color="grey-7" class="header-icon-btn gt-xs" aria-label="Hľadať" />
        <q-btn flat round icon="settings" size="md" color="grey-7" class="header-icon-btn" aria-label="Nastavenia notifikácií">
          <q-menu>
            <q-list style="min-width: 280px">
              <q-item-label header>Nastavenia správ</q-item-label>
              <q-item>
                <q-item-section>
                  <q-item-label>Notifikácie iba pre správy adresované mne</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="state.me.notifyOnlyMentions" color="deep-orange-7" />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="enableBrowserNotifications">
                <q-item-section avatar><q-icon name="notifications_active" color="deep-orange-7" /></q-item-section>
                <q-item-section>
                  <q-item-label>Povoliť notifikácie prehliadača</q-item-label>
                  <q-item-label caption>{{ notificationPermissionLabel }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat round icon="push_pin" size="md" color="grey-7" class="header-icon-btn gt-sm" aria-label="Pripnúť" />
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="chat-footer-bar">
      <!-- Stavová lišta: kto aktuálne píše správu (body 57 a 58 zadania) -->
      <transition name="fade">
        <div
          v-if="typingInCurrentChannel.length"
          class="typing-status-bar row items-center"
        >
          <q-spinner-dots color="deep-orange-7" size="16px" class="q-mr-xs flex-shrink-0" />
          <span class="text-caption text-grey-8 typing-status-text">
            <template v-for="(nick, index) in typingInCurrentChannel" :key="nick">
              <span
                class="typing-nick-link text-weight-bold text-deep-orange-9 cursor-pointer"
                title="Kliknite pre zobrazenie rozpísaného textu v reálnom čase"
                @click="showTypingDraft(nick)"
              >
                @{{ nick === state.me.nick ? `${nick} (Vy)` : nick }}
              </span>
              <span v-if="index < typingInCurrentChannel.length - 1">, </span>
            </template>
            <span class="q-ml-xs">{{ typingLabel }}</span>
            <span
              class="typing-hint text-grey-6 cursor-pointer q-ml-xs gt-xs"
              @click="showTypingDraft(typingInCurrentChannel[0])"
            >
              (kliknite na nick pre náhľad)
            </span>
          </span>
        </div>
      </transition>

      <div class="footer-input-row row items-center no-wrap">
        <q-input
          v-model="text"
          rounded
          standout
          dense
          borderless
          class="col message-input-field"
          :placeholder="$q.screen.lt.sm ? 'Napíšte správu...' : 'Napíšte správu alebo príkaz'"
          :disable="current?.group && !current.memberNicks?.includes(state.me.nick)"
          @keyup.enter="submit"
        >
          <template #prepend>
            <q-icon name="sentiment_satisfied" color="black" size="20px" class="q-ml-xs gt-xs" />
          </template>
        </q-input>

        <q-btn flat round dense icon="help_outline" color="grey-7" class="footer-help-btn q-ml-xs" aria-label="Príkazy kanálov">
          <q-menu>
            <q-list dense class="q-pa-sm">
              <q-item-label header>Príkazy kanálov</q-item-label>
              <q-item><q-item-section>/join nazov [private]</q-item-section></q-item>
              <q-item><q-item-section>/invite nick</q-item-section></q-item>
              <q-item><q-item-section>/revoke nick (súkromný)</q-item-section></q-item>
              <q-item><q-item-section>/kick nick (verejný)</q-item-section></q-item>
              <q-item><q-item-section>/list, /cancel, /quit</q-item-section></q-item>
              <q-separator class="q-my-xs" />
              <q-item clickable v-close-popup @click="runInactiveCheck">
                <q-item-section avatar><q-icon name="auto_delete" color="amber-9" size="18px" /></q-item-section>
                <q-item-section>/check-inactive (overiť inaktivitu 30 dní)</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn round unelevated class="footer-action-btn q-ml-xs gt-xs" icon="image" size="md" aria-label="Obrázok" />
        <q-btn
          round
          unelevated
          class="footer-action-btn q-ml-xs"
          icon="add"
          size="md"
          aria-label="Simulovať prichádzajúcu správu"
          @click="simulateIncoming"
        >
          <q-tooltip>Simulovať prichádzajúcu správu</q-tooltip>
        </q-btn>
        <q-btn
          round
          unelevated
          color="deep-orange-7"
          text-color="white"
          class="footer-send-btn q-ml-xs"
          icon="send"
          size="md"
          aria-label="Odoslať"
          @click="submit"
        />
      </div>
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
            <div class="text-h6">Členovia a pozvaní</div>
            <div class="text-caption text-grey-7">{{ current?.name }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" aria-label="Zavrieť" v-close-popup />
        </q-card-section>

        <q-list separator>
          <q-item
            v-for="member in channelMembers"
            :key="member.nick"
            clickable
            @click="openUserProfile(member.nick)"
          >
            <q-item-section avatar>
              <q-avatar color="orange-1" text-color="deep-orange-8">{{ initial(member.name) }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ member.name }}</q-item-label>
              <q-item-label caption class="text-deep-orange-9 text-weight-bold">@{{ member.nick }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center q-gutter-x-xs">
                <q-badge
                  v-if="state.typingByChannel[current.id]?.[member.nick]"
                  color="deep-orange-7"
                  class="cursor-pointer"
                  :label="member.nick === state.me.nick ? 'Píšete...' : 'Píše...'"
                  @click.stop="showMemberDraft(member)"
                >
                  <q-tooltip>Kliknite pre náhľad konceptu</q-tooltip>
                </q-badge>
                <q-badge v-if="member.isOwner" color="deep-orange-7" label="Správca" />
                <q-badge v-if="member.nick === state.me.nick" color="grey-6" label="Vy" />
                <q-badge v-else-if="member.isInvited" color="amber-8" label="Pozvánka" />
                <q-badge :color="statusColor(member.status)" :label="statusLabel(member.status)" />
              </div>
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

    <!-- Dialóg: Profil používateľa (rozkliknutie človeka v chate) -->
    <q-dialog :model-value="Boolean(state.activeUserProfile)" @hide="state.activeUserProfile = null">
      <q-card class="user-profile-dialog">
        <q-card-section class="profile-dialog-header column items-center q-pt-lg q-pb-md text-center">
          <q-btn flat round dense icon="close" class="profile-dialog-close absolute-top-right q-ma-sm" v-close-popup />
          <q-avatar size="68px" color="deep-orange-1" text-color="deep-orange-8" class="profile-dialog-avatar">
            {{ initial(state.activeUserProfile?.name) }}
            <q-badge
              floating
              rounded
              :color="statusColor(state.activeUserProfile?.status)"
              class="profile-status-dot"
            />
          </q-avatar>

          <div class="text-h6 text-weight-bold q-mt-sm">{{ state.activeUserProfile?.name }}</div>

          <div class="row items-center q-gutter-x-xs q-mt-xs">
            <q-chip
              color="orange-1"
              text-color="deep-orange-9"
              icon="alternate_email"
              class="profile-nick-chip cursor-pointer text-weight-bold"
              clickable
              @click="copyNick(state.activeUserProfile?.nick)"
            >
              {{ state.activeUserProfile?.nick }}
              <q-tooltip>Kliknite pre skopírovanie @{{ state.activeUserProfile?.nick }}</q-tooltip>
            </q-chip>
            <q-badge
              :color="statusColor(state.activeUserProfile?.status)"
              :label="statusLabel(state.activeUserProfile?.status)"
              class="q-py-xs q-px-sm text-caption"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-py-md">
          <q-list dense>
            <q-item>
              <q-item-section avatar>
                <q-icon name="badge" color="deep-orange-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Celé meno</q-item-label>
                <q-item-label class="text-weight-medium">{{ state.activeUserProfile?.name }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="alternate_email" color="deep-orange-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Prezývka (Nick pre označenie)</q-item-label>
                <q-item-label class="text-weight-bold text-deep-orange-9">@{{ state.activeUserProfile?.nick }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat dense round icon="content_copy" size="sm" color="grey-7" @click="copyNick(state.activeUserProfile?.nick)">
                  <q-tooltip>Skopírovať @{{ state.activeUserProfile?.nick }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="fiber_manual_record" :color="statusColor(state.activeUserProfile?.status)" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Aktuálny stav</q-item-label>
                <q-item-label class="text-weight-medium">{{ statusLabel(state.activeUserProfile?.status) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="between" class="q-px-md q-pb-md bg-grey-1">
          <q-btn
            flat
            label="Zavrieť"
            color="grey-7"
            v-close-popup
          />
          <div class="row q-gutter-x-sm">
            <q-btn
              v-if="state.activeUserProfile?.nick !== state.me.nick"
              unelevated
              color="orange-2"
              text-color="deep-orange-9"
              icon="alternate_email"
              label="Označiť"
              @click="mentionUser(state.activeUserProfile?.nick)"
            >
              <q-tooltip>Vložiť @{{ state.activeUserProfile?.nick }} do správy</q-tooltip>
            </q-btn>

            <q-btn
              v-if="state.activeUserProfile?.nick !== state.me.nick"
              unelevated
              color="deep-orange-7"
              text-color="white"
              icon="chat"
              label="Správa"
              @click="openDirectChat(state.activeUserProfile)"
            >
              <q-tooltip>Otvoriť osobný chat s @{{ state.activeUserProfile?.nick }}</q-tooltip>
            </q-btn>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authState } from '../services/auth'
import {
  closeChannel,
  checkInactiveChannels,
  addFriend,
  createGroup,
  getChannelMembers,
  inviteToChannel,
  joinChannel,
  kickFromChannel,
  leaveChannel,
  listChannelMembers,
  receiveMessage,
  revokeFromChannel,
  selectChannel,
  setUserStatus,
  send,
  openUserProfile,
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
const incomingDemoSequence = ref(0)
const notificationPermission = ref(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)

const current = computed(() => state.channels.find(c => c.id === state.activeId) || state.channels[0])
const notificationPermissionLabel = computed(() => {
  if (notificationPermission.value === 'unsupported') return 'Tento prehliadač ich nepodporuje'
  return notificationPermission.value === 'granted' ? 'Povolené' : 'Kliknutím požiadajte o povolenie'
})
const channelMembers = computed(() => {
  const channel = current.value
  if (!channel?.group || !channel.memberNicks?.includes(state.me.nick)) return []

  const members = getChannelMembers(channel.id)
  const invitations = state.users
    .filter(user => channel.invitedNicks?.includes(user.nick) && !channel.memberNicks.includes(user.nick))
    .map(user => ({ ...user, status: user.status || 'online', isOwner: false, isInvited: true }))

  return [...members, ...invitations]
})
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

function statusLabel(status) {
  return ({ online: 'Online', away: 'Preč', dnd: 'Nerušiť', offline: 'Offline' })[status] || 'Offline'
}

function statusColor(status) {
  return ({ online: 'positive', away: 'amber-8', dnd: 'warning', offline: 'grey-6' })[status] || 'grey-6'
}

function changeStatus(status) {
  const delivered = setUserStatus(status)
  notify(`Váš stav je teraz ${statusLabel(status)}.`)
  if (delivered.length) {
    notify(`Po návrate do online ste dostali ${delivered.length} ${delivered.length === 1 ? 'správu' : 'správy'}.`)
  }
}

async function enableBrowserNotifications() {
  if (typeof Notification === 'undefined') {
    notify('Tento prehliadač nepodporuje notifikácie.', 'negative')
    return
  }

  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    notify(permission === 'granted'
      ? 'Notifikácie prehliadača sú povolené.'
      : 'Prehliadač nepovolil notifikácie.',
    permission === 'granted' ? 'positive' : 'warning')
  } catch (error) {
    notify(`Nepodarilo sa povoliť notifikácie: ${error.message}`, 'negative')
  }
}

function notifyAboutIncoming(result) {
  if (
    !result.delivered ||
    state.me.status !== 'online' ||
    $q.appVisible !== false ||
    (state.me.notifyOnlyMentions && result.message.recipientNick !== state.me.nick) ||
    typeof Notification === 'undefined' ||
    Notification.permission !== 'granted'
  ) return

  new Notification(result.message.senderName, {
    body: `${result.channel.name}: ${result.message.text.slice(0, 100)}`,
    tag: `message-${result.channel.id}`
  })
}

function simulateIncoming() {
  if (!current.value) return
  incomingDemoSequence.value += 1
  triggerBotReply(current.value.id, incomingDemoSequence.value % 2 === 0 ? 'ahoj' : 'kedy?')
}

function selectChat(channelId) {
  const channel = state.channels.find(item => item.id === channelId)
  if (channel?.group && channel.invitedNicks?.includes(state.me.nick) && !channel.memberNicks.includes(state.me.nick)) {
    runAction(() => joinChannel(channel.name), `Pripojili ste sa do kanála #${channel.name}.`)
  } else {
    selectChannel(channelId)
  }
  if ($q.screen.lt.md) {
    drawer.value = false
  }
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

function showMemberDraft(member) {
  if (!state.typingByChannel[current.value.id]?.[member.nick]) return
  state.activeDraftPreview = { channelId: current.value.id, nick: member.nick }
}

function mentionUser(nick) {
  if (!nick) return
  state.activeUserProfile = null
  const prefix = `@${nick} `
  if (!text.value.startsWith(prefix)) {
    text.value = prefix + text.value
  }
  nextTick(() => {
    const inputEl = document.querySelector('.message-input-field input')
    if (inputEl) inputEl.focus()
  })
  notify(`Používateľ @${nick} bol pridaný do správy.`, 'info')
}

function openDirectChat(user) {
  if (!user?.nick) return
  state.activeUserProfile = null
  runAction(() => addFriend(user.nick), result => {
    return result.added ? `Otvorený chat s @${user.nick}.` : `Chat s @${user.nick}.`
  })
}

function copyNick(nick) {
  if (!nick) return
  const fullNick = `@${nick.replace(/^@/, '')}`
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(fullNick).catch(() => {})
  }
  notify(`Prezývka ${fullNick} bola skopírovaná do schránky.`, 'positive')
}

const typingInCurrentChannel = computed(() => {
  const channelTyping = state.typingByChannel[state.activeId] || {}
  return Object.keys(channelTyping).filter(nick => Boolean(channelTyping[nick]))
})

const typingLabel = computed(() => {
  const users = typingInCurrentChannel.value
  if (!users.length) return ''
  if (users.length === 1) {
    return users[0] === state.me.nick ? 'píšete správu...' : 'práve píše správu...'
  }
  return 'píšu správu...'
})

function showTypingDraft(nick) {
  state.activeDraftPreview = { channelId: state.activeId, nick }
}

function channelActivityLabel(channel) {
  if (!channel?.lastActivityAt) return 'aktívny'
  const diffDays = Math.floor((Date.now() - channel.lastActivityAt) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'aktívny dnes'
  if (diffDays >= 30) return `inaktívny (${diffDays} dní!)`
  return `aktívny pred ${diffDays} d.`
}

function runInactiveCheck() {
  const removed = checkInactiveChannels()
  if (removed.length) {
    notify(`Zrušené neaktívne kanály (> 30 dní bez správy): ${removed.map(c => '#' + c.name).join(', ')}. Názvy boli uvoľnené.`, 'warning')
  } else {
    notify('Všetky kanály sú aktívne (posledná správa bola pridaná pred menej ako 30 dňami).', 'positive')
  }
}

watch(text, (val) => {
  if (!state.activeId) return
  if (!state.typingByChannel[state.activeId]) {
    state.typingByChannel[state.activeId] = {}
  }
  if (val.trim()) {
    state.typingByChannel[state.activeId] = {
      ...state.typingByChannel[state.activeId],
      [state.me.nick]: val
    }
  } else if (state.typingByChannel[state.activeId]?.[state.me.nick] !== undefined) {
    const updated = { ...state.typingByChannel[state.activeId] }
    delete updated[state.me.nick]
    state.typingByChannel[state.activeId] = updated
  }
})

watch(() => state.activeId, (newId, oldId) => {
  if (oldId && state.typingByChannel[oldId]?.[state.me.nick]) {
    const updated = { ...state.typingByChannel[oldId] }
    delete updated[state.me.nick]
    state.typingByChannel[oldId] = updated
  }
  text.value = ''
})

let botTypingTimer = null
let botTypingInterval = null

function triggerBotReply(channelId, userText) {
  const channel = state.channels.find(c => c.id === channelId)
  if (!channel) return

  let responderNick = 'nina'
  if (!channel.group) {
    responderNick = channel.nick || 'nina'
  } else {
    const otherMember = channel.memberNicks?.find(nick => nick !== state.me.nick)
    if (otherMember) responderNick = otherMember
  }

  if (botTypingTimer) clearTimeout(botTypingTimer)
  if (botTypingInterval) clearInterval(botTypingInterval)
  if (state.typingByChannel[channelId]) {
    delete state.typingByChannel[channelId][responderNick]
  }

  let replyText = `Jasné @${state.me.nick}, rozumiem. Pozriem sa na to a dám ti vedieť.`
  const lower = (userText || '').toLowerCase()
  if (lower.includes('ahoj') || lower.includes('cau') || lower.includes('čau') || lower.includes('cauko')) {
    replyText = `Ahoj @${state.me.nick}! Ako pokračuješ? Práve na tom tiež robím.`
  } else if (lower.includes('?') || lower.includes('kedy') || lower.includes('ako') || lower.includes('prečo')) {
    replyText = `Dobrý nápad @${state.me.nick}! Pozriem sa na to ešte dnes a preberieme to.`
  } else if (lower.includes('dakujem') || lower.includes('ďakujem') || lower.includes('dik') || lower.includes('dík')) {
    replyText = `Nemáš vôbec za čo @${state.me.nick}! Pokračujeme podľa plánu.`
  } else {
    const responses = [
      `@${state.me.nick} super, potom mi to pošli na kontrolu.`,
      `Dohodnuté @${state.me.nick}, doplním to do zoznamu úloh.`,
      `Jasné @${state.me.nick}, môžeme to takto spraviť.`,
      `Rozumiem @${state.me.nick}, pozriem sa na to hneď, ako dokončím túto časť.`
    ]
    replyText = responses[Math.floor(Math.random() * responses.length)]
  }

  botTypingTimer = setTimeout(() => {
    if (!state.typingByChannel[channelId]) {
      state.typingByChannel[channelId] = {}
    }

    let charIndex = 0
    state.typingByChannel[channelId][responderNick] = ''

    botTypingInterval = setInterval(() => {
      charIndex += Math.floor(Math.random() * 3) + 2
      if (charIndex >= replyText.length) {
        clearInterval(botTypingInterval)
        state.typingByChannel[channelId][responderNick] = replyText

        botTypingTimer = setTimeout(() => {
          delete state.typingByChannel[channelId][responderNick]
          runAction(
            () => receiveMessage(channelId, replyText),
            result => {
              if (result.queued) return 'Ste offline: správa sa doručí po prepnutí do online stavu.'
              notifyAboutIncoming(result)
              return ''
            }
          )
        }, 400)
      } else {
        state.typingByChannel[channelId][responderNick] = replyText.slice(0, charIndex)
      }
    }, 55)
  }, 500)
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
  if (state.typingByChannel[state.activeId]) {
    const updated = { ...state.typingByChannel[state.activeId] }
    delete updated[state.me.nick]
    state.typingByChannel[state.activeId] = updated
  }
  const sentChannelId = current.value?.id
  text.value = ''

  triggerBotReply(sentChannelId, value)
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

  if (name === '/check-inactive' || name === '/inactivity') {
    runInactiveCheck()
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
  height: 100dvh;
  overflow: hidden;

  .q-page-container {
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.sidebar-container {
  background: #ffffff !important;
  color: #332720;
  border-right: 1px solid #f1e6df;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-profile {
  padding: 16px 16px 12px;
  border-radius: 12px;
  transition: background 0.2s;

  &:hover {
    background: #fff7f1;
  }
}

.profile-avatar {
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-display-name {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.15;
  color: #34251e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-account-menu-card {
  min-width: 220px;
  background: #ffffff;
  border: 1px solid #f2e4db;
  border-radius: 12px;

  @media (max-width: 400px) {
    min-width: 200px;
  }
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
  padding: 10px 14px 6px 16px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #6f574a;
}

.sidebar-channel-list {
  padding: 0 4px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.channel-row-item {
  min-height: 52px;
  padding: 6px 10px;
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
  min-width: 28px;
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
  min-width: 44px;
  padding-right: 8px;
}

.channel-name-text {
  font-size: 0.92rem;
  font-weight: 600;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.channel-members-caption {
  color: #9a8376;
  font-size: 0.72rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-container {
  background: #ffffff !important;
  color: #332720;
  height: 68px;
  padding: 0 20px;
  box-shadow: 0 2px 12px rgba(79, 47, 26, 0.04) !important;
  border-bottom: 1px solid #f1e6df;

  @media (max-width: 599px) {
    height: 58px;
    padding: 0 8px 0 10px;
  }
}

.header-user-avatar {
  font-weight: 700;
  flex-shrink: 0;
}

.header-info-col {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.header-channel-title {
  font-size: 1.05rem;
  line-height: 1.25;
  font-weight: 700;
  color: #34251e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 599px) {
    font-size: 0.95rem;
  }
}

.header-channel-caption {
  color: #9a8376;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 599px) {
    font-size: 0.68rem;
  }
}

.header-actions-row {
  flex-shrink: 0;
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
  padding: 0;
  display: flex;
  flex-direction: column;
}

.footer-input-row {
  padding: 10px 18px;

  @media (max-width: 599px) {
    padding: 8px 8px;
  }
}

.typing-status-bar {
  background: #fff8f3;
  border-bottom: 1px solid #fce8dc;
  padding: 4px 18px;
  font-size: 0.78rem;

  @media (max-width: 599px) {
    padding: 4px 10px;
    font-size: 0.72rem;
  }
}

.typing-status-text {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.typing-nick-link {
  text-decoration: underline;

  &:hover {
    color: #a73714 !important;
  }
}

.typing-hint {
  font-size: 0.72rem;
  opacity: 0.85;

  &:hover {
    text-decoration: underline;
  }
}

.message-input-field {
  .q-field__control {
    background: #fffaf6 !important;
    border: 1px solid #f0dfd4;
    border-radius: 24px !important;
    min-height: 42px;
    padding: 0 10px;

    @media (max-width: 599px) {
      min-height: 38px;
      padding: 0 8px;
    }
  }

  .q-field__native {
    color: #332720 !important;
    font-size: 0.92rem;

    &::placeholder {
      color: #9a8376 !important;
    }

    @media (max-width: 599px) {
      font-size: 0.85rem;
    }
  }

  .q-field__prepend {
    color: #c64b22;
    margin-left: 4px;
    margin-right: 4px;
  }
}

.footer-help-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.footer-action-btn {
  background: #fff0e7 !important;
  color: #c64b22 !important;
  width: 42px;
  height: 42px;
  flex-shrink: 0;

  &:hover {
    background: #ffe3d3 !important;
  }

  @media (max-width: 599px) {
    width: 36px;
    height: 36px;
  }
}

.footer-send-btn {
  background: #f27645 !important;
  color: #ffffff !important;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(242, 118, 69, 0.35);

  &:hover {
    background: #e6622e !important;
  }

  @media (max-width: 599px) {
    width: 38px;
    height: 38px;
  }
}

.group-dialog {
  width: 100%;
  max-width: 440px;
  border-radius: 18px;
  color: #332720;

  @media (max-width: 599px) {
    max-width: calc(100vw - 20px);
    margin: 10px;
    border-radius: 14px;
  }
}

.header-nick-badge {
  background: #fff0e7;
  color: #c64b22;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 8px;
  border: 1px solid #fed7c3;
  line-height: normal;
}

.user-profile-dialog {
  width: min(420px, calc(100vw - 24px));
  border-radius: 18px;
  overflow: hidden;
  color: #332720;
}

.profile-dialog-header {
  background: linear-gradient(135deg, #fffaf6 0%, #fff1e6 100%);
  position: relative;
}

.profile-dialog-avatar {
  border: 3px solid #ffffff;
  box-shadow: 0 4px 16px rgba(122, 69, 38, 0.15);
  font-size: 1.6rem;
  font-weight: 700;
  position: relative;
}

.profile-status-dot {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
}

.profile-nick-chip {
  font-size: 0.88rem;
  border: 1px solid #f9cdb5;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    transform: scale(1.03);
    background: #ffe6d5 !important;
  }
}
</style>

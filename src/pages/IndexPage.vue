<template>
  <q-page class="chat">
    <div
      ref="msgsContainer"
      class="msgs"
      @scroll="onScroll"
    >
      <q-infinite-scroll
        :key="state.activeId"
        reverse
        :offset="120"
        scroll-target=".msgs"
        @load="loadHistory"
      >
        <template #loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="deep-orange-7" size="28px" />
          </div>
        </template>

        <template v-for="(m, i) in state.messages" :key="m.id">
          <div
            v-if="i > 0 && state.messages[i - 1].date !== m.date"
            class="divider row items-center no-wrap"
          >
            <div class="line col" />
            <span class="q-mx-lg">{{ m.date }}</span>
            <div class="line col" />
          </div>

          <div class="row" :class="m.mine ? 'justify-end' : 'justify-start'">
            <div
              class="bubble"
              :class="{
                old: m.old,
                mentioned: isMentioned(m),
                'mentioned-me': isMentionedMe(m)
              }"
            >
              <span
                class="message-sender cursor-pointer"
                title="Kliknite pre zobrazenie profilu používateľa"
                @click.stop="openUserProfile(messageSenderNick(m))"
              >
                <q-icon name="person" size="14px" />
                <span class="sender-name-text">{{ messageSenderName(m) }}</span>
                <span class="sender-nick-chip">@{{ messageSenderNick(m) }}</span>
              </span>
              <span
                v-if="getRecipientNick(m)"
                class="message-recipient cursor-pointer"
                title="Kliknite pre profil používateľa"
                @click.stop="openUserProfile(getRecipientNick(m))"
              >
                <q-icon name="alternate_email" size="12px" class="q-mr-xs" />
                <span v-if="isMentionedMe(m)" class="recipient-badge-me">
                  Označenie pre vás (@{{ getRecipientNick(m) }})
                </span>
                <span v-else class="recipient-link-text">
                  Pre @{{ getRecipientNick(m) }}
                </span>
              </span>
              <span class="message-body-content">
                <template v-for="(part, pIdx) in parseMessageTokens(m.text)" :key="pIdx">
                  <span
                    v-if="part.type === 'mention'"
                    class="inline-mention-pill cursor-pointer"
                    title="Kliknite pre profil používateľa"
                    @click.stop="openUserProfile(part.nick)"
                  >{{ part.raw }}</span>
                  <span v-else>{{ part.content }}</span>
                </template>
              </span>
            </div>
          </div>
        </template>
      </q-infinite-scroll>

      <div v-if="state.messages.length === 0" class="empty-chat">
        <q-icon name="waving_hand" size="32px" />
        <div class="text-subtitle1 text-weight-medium q-mt-sm">Začnite konverzáciu</div>
        <div class="text-body2">Napíšte prvú správu do tohto chatu.</div>
      </div>
      <div ref="bottomAnchor" class="scroll-bottom-anchor" />
    </div>

    <!-- Tlačidlo pre rýchly posun nadol, ak používateľ odscrolloval vyššie -->
    <transition name="fade">
      <q-btn
        v-if="showScrollBottomBtn"
        round
        dense
        color="deep-orange-7"
        text-color="white"
        icon="keyboard_arrow_down"
        class="scroll-bottom-btn"
        aria-label="Posunúť nadol"
        @click="scrollToBottom(true)"
      >
        <q-tooltip anchor="top middle" self="bottom middle">Prejsť na najnovšie správy</q-tooltip>
      </q-btn>
    </transition>

    <q-dialog :model-value="Boolean(state.activeDraftPreview)" @hide="state.activeDraftPreview = null">
      <q-card class="draft-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <q-avatar color="orange-1" text-color="deep-orange-8">{{ draftPreview?.nick?.charAt(0).toUpperCase() }}</q-avatar>
          <div class="q-ml-md">
            <div class="text-subtitle1 text-weight-bold">@{{ draftPreview?.nick }} {{ draftPreview?.nick === state.me.nick ? '(Vy) píšete' : 'píše' }}</div>
            <div class="text-caption text-grey-7">Rozpísaná správa • ukážkové dáta</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" aria-label="Zavrieť" v-close-popup />
        </q-card-section>
        <q-card-section class="draft-preview">{{ draftText }}</q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { loadOlderMessages, openUserProfile, state } from '../data/mock'

const msgsContainer = ref(null)
const bottomAnchor = ref(null)
const showScrollBottomBtn = ref(false)

const typingUsers = computed(() => Object.keys(state.typingByChannel[state.activeId] || {}))
const draftPreview = computed(() => state.activeDraftPreview)
const draftText = computed(() => {
  const preview = state.activeDraftPreview
  return preview ? state.typingByChannel[preview.channelId]?.[preview.nick] || '' : ''
})

function scrollToBottom(smooth = true) {
  nextTick(() => {
    const el = msgsContainer.value
    if (!el) return

    const targetTop = el.scrollHeight

    if (smooth) {
      el.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      })
    } else {
      el.scrollTop = targetTop
    }

    requestAnimationFrame(() => {
      if (!msgsContainer.value) return
      const currentScrollHeight = msgsContainer.value.scrollHeight
      if (currentScrollHeight > targetTop) {
        if (smooth) {
          msgsContainer.value.scrollTo({
            top: currentScrollHeight,
            behavior: 'smooth'
          })
        } else {
          msgsContainer.value.scrollTop = currentScrollHeight
        }
      }
    })
  })
}

function onScroll() {
  const el = msgsContainer.value
  if (!el) return
  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  showScrollBottomBtn.value = distanceFromBottom > 150
}

// Sledovanie zmeny kanála alebo pridania novej správy (odoslaná alebo prijatá)
watch(
  [
    () => state.activeId,
    () => (state.messages.length ? state.messages[state.messages.length - 1].id : null)
  ],
  ([newChannelId, newLastId], [oldChannelId, oldLastId]) => {
    const channelChanged = newChannelId !== oldChannelId
    const lastMessageChanged = newLastId !== oldLastId

    if (channelChanged) {
      // Prepnutie kanála -> okamžitý skok na spodok
      scrollToBottom(false)
    } else if (lastMessageChanged && newLastId) {
      // Nová správa odoslaná mnou alebo prijatá -> plynulé scrollovanie na spodok
      scrollToBottom(true)
    }
  },
  { flush: 'post' }
)

onMounted(() => {
  scrollToBottom(false)
  setTimeout(() => {
    scrollToBottom(false)
  }, 100)
})

function loadHistory(index, done) {
  const hasMore = loadOlderMessages(state.activeId)
  done(!hasMore)
}

function showDraft(nick) {
  state.activeDraftPreview = { channelId: state.activeId, nick }
}

function senderNameByNick(nick) {
  return state.users.find(user => user.nick === nick)?.name || `@${nick}`
}

function messageSenderName(message) {
  if (message.senderName) return message.senderName
  if (message.mine) return state.me.name || 'Vy'

  const channel = state.channels.find(item => item.id === state.activeId)
  if (!channel?.group) return channel?.name || 'Používateľ'

  const senderNick = channel.memberNicks?.find(nick => nick !== state.me.nick)
  return senderNick ? senderNameByNick(senderNick) : 'Používateľ'
}

function messageSenderNick(message) {
  if (message.mine) return state.me.nick
  if (message.senderNick) return message.senderNick

  const channel = state.channels.find(item => item.id === state.activeId)
  if (!channel?.group) return channel?.nick || 'používateľ'

  const senderNick = channel.memberNicks?.find(nick => nick !== state.me.nick)
  return senderNick || 'používateľ'
}

function parseMessageTokens(text) {
  if (!text) return []
  const parts = []
  const regex = /(@[a-zA-Z0-9_.-]+)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'mention', nick: match[1].slice(1), raw: match[1] })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }
  return parts
}

function getRecipientNick(m) {
  if (m?.recipientNick) return m.recipientNick.toLowerCase()
  const match = m?.text?.match(/@([a-zA-Z0-9_.-]+)/)
  return match ? match[1].toLowerCase() : null
}

function isMentioned(m) {
  return Boolean(getRecipientNick(m))
}

function isMentionedMe(m) {
  const recipient = getRecipientNick(m)
  return Boolean(recipient && recipient === state.me.nick?.toLowerCase())
}
</script>

<style lang="scss">
.chat {
  background: linear-gradient(145deg, #fffdf9 0%, #fff7ed 100%);
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.msgs {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;

  @media (max-width: 599px) {
    padding: 10px 10px 14px;
  }
}

.draft-message {
  max-width: 60%;
  padding: 10px 16px;
  margin: 6px 0;
  border: 1px dashed #d8b8a4;
  border-radius: 16px 16px 16px 5px;
  color: #6d5548;
  background: #fffaf6;
  box-shadow: 0 3px 12px rgba(105, 71, 43, 0.06);
  font: 0.85rem/1.35 Inter, Roboto, sans-serif;
  text-align: left;
  word-break: break-word;
  white-space: pre-wrap;
  cursor: pointer;

  @media (max-width: 768px) {
    max-width: 82%;
  }

  @media (max-width: 480px) {
    max-width: 88%;
    padding: 8px 12px;
    font-size: 0.82rem;
  }
}

.message-sender {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin: -2px 0 5px;
  color: #a05b36;
  font-size: 0.72rem;
  font-weight: 700;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;

    .sender-name-text {
      text-decoration: underline;
    }
  }

  .row.justify-end & {
    color: #ffd6b8;
  }
}

.sender-nick-chip {
  background: rgba(190, 75, 20, 0.09);
  color: #ba4313;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.2px;

  .row.justify-end & {
    background: rgba(255, 255, 255, 0.24);
    color: #ffffff;
  }
}

.inline-mention-pill {
  font-weight: 700;
  color: #ba4313;
  background: rgba(230, 100, 30, 0.12);
  padding: 1px 5px;
  border-radius: 5px;
  margin: 0 1px;
  display: inline-block;
  transition: all 0.15s ease;

  &:hover {
    background: #e6622e;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(230, 98, 46, 0.3);
  }

  .row.justify-end & {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.25);
    text-decoration: underline;

    &:hover {
      background: #ffffff;
      color: #e6622e;
    }
  }
}

.draft-message-sender {
  color: #a05b36;
}

.draft-message-label {
  font-weight: 400;
}

.draft-dialog {
  width: min(440px, calc(100vw - 24px));
  border-radius: 16px;
  color: #332720;
}

.draft-preview {
  min-height: 72px;
  margin: 0 16px 16px;
  border: 1px solid #f0dfd4;
  border-radius: 12px;
  background: #fffaf6;
  white-space: pre-wrap;
}

.bubble {
  max-width: 60%;
  padding: 10px 16px;
  margin: 6px 0;
  border-radius: 16px 16px 16px 5px;
  font: 0.85rem/1.35 Inter, Roboto, sans-serif;
  color: #30251f;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(105, 71, 43, 0.08);
  word-break: break-word;
  white-space: pre-wrap;

  @media (max-width: 768px) {
    max-width: 82%;
  }

  @media (max-width: 480px) {
    max-width: 88%;
    padding: 8px 12px;
    font-size: 0.82rem;
  }

  &.mentioned {
    outline: 2px solid #f0b429;
    background: #fffdf5;
    box-shadow: 0 4px 14px rgba(240, 180, 41, 0.25);
  }

  &.mentioned-me {
    outline: 2.5px solid #d97706;
    background: #fff9ea;
    box-shadow: 0 4px 18px rgba(217, 119, 6, 0.32);
  }

  .row.justify-end & {
    color: #ffffff;
    background: #f27645;
    border-radius: 16px 16px 5px 16px;

    &.mentioned {
      outline: 2px solid #ffe082;
      box-shadow: 0 4px 14px rgba(242, 118, 69, 0.35);
    }

    &.mentioned-me {
      outline: 2.5px solid #ffd54f;
      box-shadow: 0 4px 18px rgba(242, 118, 69, 0.45);
    }
  }

  &.old {
    background: #f2eee9;

    .row.justify-end & {
      background: #f7a17c;
    }
  }
}

.message-recipient {
  display: flex;
  align-items: center;
  margin: -2px 0 6px;
  color: #8a5a00;
  font-size: 0.72rem;
  font-weight: 700;

  .recipient-badge-me {
    background: #fef3c7;
    color: #92400e;
    padding: 1px 6px;
    border-radius: 6px;
    border: 1px solid #fcd34d;
    display: inline-flex;
    align-items: center;
  }

  .row.justify-end & {
    color: #fff3bd;

    .recipient-badge-me {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
  }
}

.divider {
  color: #9a8376;
  font-size: 0.75rem;
  margin: 28px 0;

  @media (max-width: 599px) {
    margin: 16px 0;
    font-size: 0.7rem;
  }

  .line {
    height: 1px;
    background: #eadbd0;
  }
}

.empty-chat {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9a8376;
  text-align: center;
  transform: translate(-50%, -50%);
  width: min(300px, calc(100vw - 40px));
}

.scroll-bottom-anchor {
  height: 1px;
  width: 100%;
  pointer-events: none;
}

.scroll-bottom-btn {
  position: absolute;
  right: 20px;
  bottom: 16px;
  z-index: 10;
  box-shadow: 0 4px 14px rgba(216, 75, 34, 0.35);
  transition: transform 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 599px) {
    right: 12px;
    bottom: 12px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

<template>
  <q-page class="chat">
    <div class="msgs q-pa-md">
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
            <div class="bubble" :class="{ old: m.old, mentioned: m.recipientNick }">
              <span class="message-sender">
                <q-icon name="person" size="15px" />
                {{ messageSenderName(m) }}
              </span>
              <span v-if="m.recipientNick" class="message-recipient">Pre @{{ m.recipientNick }}</span>
              {{ m.text }}
            </div>
          </div>
        </template>
      </q-infinite-scroll>

      <div v-for="nick in typingUsers" :key="`draft-${nick}`" class="row justify-start">
        <button class="draft-message" @click="showDraft(nick)">
          <span class="message-sender draft-message-sender">
            <q-icon name="person" size="15px" />
            {{ senderNameByNick(nick) }}
            <span class="draft-message-label">• rozpísaná</span>
          </span>
          {{ state.typingByChannel[state.activeId][nick] }}
        </button>
      </div>

      <div v-if="state.messages.length === 0 && !typingUsers.length" class="empty-chat">
        <q-icon name="waving_hand" size="32px" />
        <div class="text-subtitle1 text-weight-medium q-mt-sm">Začnite konverzáciu</div>
        <div class="text-body2">Napíšte prvú správu do tohto chatu.</div>
      </div>
    </div>

    <q-dialog :model-value="Boolean(state.activeDraftPreview)" @hide="state.activeDraftPreview = null">
      <q-card class="draft-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <q-avatar color="orange-1" text-color="deep-orange-8">{{ draftPreview?.nick?.charAt(0).toUpperCase() }}</q-avatar>
          <div class="q-ml-md">
            <div class="text-subtitle1 text-weight-bold">@{{ draftPreview?.nick }} píše</div>
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
import { computed } from 'vue'
import { loadOlderMessages, state } from '../data/mock'

const typingUsers = computed(() => Object.keys(state.typingByChannel[state.activeId] || {}))
const draftPreview = computed(() => state.activeDraftPreview)
const draftText = computed(() => {
  const preview = state.activeDraftPreview
  return preview ? state.typingByChannel[preview.channelId]?.[preview.nick] || '' : ''
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
}

.draft-message {
  max-width: 55%;
  padding: 10px 16px;
  margin: 7px 0;
  border: 1px dashed #d8b8a4;
  border-radius: 16px 16px 16px 5px;
  color: #6d5548;
  background: #fffaf6;
  box-shadow: 0 3px 12px rgba(105, 71, 43, 0.06);
  font: 0.82rem/1.35 Inter, Roboto, sans-serif;
  text-align: left;
  word-break: break-word;
  white-space: pre-wrap;
  cursor: pointer;
}

.message-sender {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: -2px 0 5px;
  color: #a05b36;
  font-size: 0.7rem;
  font-weight: 700;
}

.draft-message-sender {
  color: #a05b36;
}

.draft-message-label {
  font-weight: 400;
}

.draft-dialog {
  width: min(440px, calc(100vw - 32px));
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
  max-width: 55%;
  padding: 10px 16px;
  margin: 7px 0;
  border-radius: 16px 16px 16px 5px;
  font: 0.82rem/1.35 Inter, Roboto, sans-serif;
  color: #30251f;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(105, 71, 43, 0.08);
  word-break: break-word;
  white-space: pre-wrap;

  &.mentioned {
    outline: 2px solid #f0b429;
    box-shadow: 0 3px 14px rgba(180, 126, 0, 0.24);
  }

  .row.justify-end & {
    color: #ffffff;
    background: #f27645;
    border-radius: 16px 16px 5px 16px;
  }

  &.old {
    background: #f2eee9;

    .row.justify-end & {
      background: #f7a17c;
    }
  }
}

.message-recipient {
  display: block;
  margin: -2px 0 5px;
  color: #8a5a00;
  font-size: 0.7rem;
  font-weight: 700;

  .row.justify-end & {
    color: #fff3bd;
  }
}

.divider {
  color: #9a8376;
  font-size: 0.75rem;
  margin: 36px 0;

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
}
</style>

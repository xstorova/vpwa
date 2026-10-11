<template>
  <q-page class="chat">
<<<<<<< HEAD
=======
    <!-- Žiarovky na pozadí -->
    <img class="bulb b1" src="../assets/bulb.svg" alt="" />
    <img class="bulb b2" src="../assets/bulb.svg" alt="" />

>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
    <!-- Správy v chate -->
    <div class="msgs q-pa-md">
      <template v-for="(m, i) in state.messages" :key="m.id">
        <!-- Oddeľovač dátumu -->
        <div
          v-if="i > 0 && state.messages[i - 1].date !== m.date"
          class="divider row items-center no-wrap"
        >
          <div class="line col" />
          <span class="q-mx-lg">{{ m.date }}</span>
          <div class="line col" />
        </div>

        <!-- Bublina so správou -->
        <div class="row" :class="m.mine ? 'justify-end' : 'justify-start'">
          <div class="bubble" :class="{ old: m.old }">
            {{ m.text }}
          </div>
        </div>
      </template>

<<<<<<< HEAD
      <div v-if="state.messages.length === 0" class="empty-chat">
        <q-icon name="waving_hand" size="32px" />
        <div class="text-subtitle1 text-weight-medium q-mt-sm">Začnite konverzáciu</div>
        <div class="text-body2">Napíšte prvú správu do tohto chatu.</div>
=======
      <!-- Indikátor písania (3 bodky) -->
      <div class="row justify-end q-mt-xs">
        <div class="typing">
          <i /><i /><i />
        </div>
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { state } from '../data/mock'
</script>

<style lang="scss">
.chat {
<<<<<<< HEAD
  background: linear-gradient(145deg, #fffdf9 0%, #fff7ed 100%);
  position: relative;
  min-height: 100%;
}

.msgs {
  min-height: 100%;
=======
  background: #242424;
  position: relative;
  overflow: hidden;
  min-height: 100%;
}

.bulb {
  position: absolute;
  top: 0;
  width: 290px;
  pointer-events: none;
  z-index: 0;
}

.b1 {
  left: 8%;
  top: -10px;
}

.b2 {
  right: 2%;
  top: 80px;
}

.msgs {
  position: relative;
  z-index: 1;
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
}

.bubble {
  max-width: 55%;
  padding: 10px 16px;
  margin: 7px 0;
<<<<<<< HEAD
  border-radius: 16px 16px 16px 5px;
  font: 0.82rem/1.35 Inter, Roboto, sans-serif;
  color: #30251f;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(105, 71, 43, 0.08);
  word-break: break-word;
  white-space: pre-wrap;

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
=======
  border-radius: 10px;
  font: 0.82rem/1.35 Inter, Roboto, sans-serif;
  color: #111;
  background: #e6e6e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  word-break: break-word;
  white-space: pre-wrap;

  &.old {
    background: rgba(185, 185, 185, 0.85);
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
  }
}

.divider {
<<<<<<< HEAD
  color: #9a8376;
=======
  color: #bbb;
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
  font-size: 0.75rem;
  margin: 36px 0;

  .line {
    height: 1px;
<<<<<<< HEAD
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
=======
    background: #666;
  }
}

.typing {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e6e6e6;
  padding: 8px 14px;
  border-radius: 14px;
  margin: 6px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #222;
    display: inline-block;
    animation: typing-bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
}
</style>

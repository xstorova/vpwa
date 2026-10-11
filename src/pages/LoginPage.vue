<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="login-page flex flex-center">
        <!-- Pozadie a ambientné žiarovky -->
        <div class="background-decorations">
          <img class="bulb-decor b1" src="../assets/bulb.svg" alt="" />
          <img class="bulb-decor b2" src="../assets/bulb.svg" alt="" />
        </div>

        <q-card class="login-card shadow-12">
          <!-- Hlavička karty -->
          <div class="login-card-header text-center q-pt-lg q-pb-md">
            <div class="row items-center justify-center q-gutter-sm q-mb-xs">
              <q-icon name="lightbulb" color="amber" size="36px" class="glow-icon" />
              <span class="app-title">Send light</span>
            </div>
<<<<<<< HEAD
            <div class="text-subtitle2 text-grey-7">
=======
            <div class="text-subtitle2 text-grey-5">
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
              {{ tab === 'login' ? 'Vitajte späť! Prihláste sa do svojho účtu.' : 'Vytvorte si nový účet a začnite četovať.' }}
            </div>
          </div>

          <!-- Prepínač medzi Prihlásením a Registráciou -->
          <q-tabs
            v-model="tab"
            dense
<<<<<<< HEAD
            class="text-grey-7 login-tabs"
            active-color="deep-orange-8"
            indicator-color="deep-orange-8"
=======
            class="text-grey-4 login-tabs"
            active-color="amber"
            indicator-color="amber"
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
            align="justify"
            narrow-indicator
          >
            <q-tab name="login" label="Prihlásenie" icon="login" />
            <q-tab name="register" label="Registrácia" icon="person_add" />
          </q-tabs>

<<<<<<< HEAD
          <q-separator />

          <q-tab-panels v-model="tab" animated class="bg-transparent text-grey-9">
=======
          <q-separator dark />

          <q-tab-panels v-model="tab" animated class="bg-transparent text-white">
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
            <!-- TAB: PRIHLÁSENIE -->
            <q-tab-panel name="login" class="q-pa-lg">
              <q-form @submit.prevent="handleLogin" class="q-gutter-y-md">
                <q-input
                  v-model="loginForm.email"
                  type="email"
                  label="Emailová adresa"
<<<<<<< HEAD
                  label-color="grey-7"
                  color="deep-orange-8"
=======
                  label-color="grey-4"
                  color="amber"
                  dark
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  outlined
                  dense
                  :rules="[val => !!val || 'Email je povinný', val => isValidEmail(val) || 'Zadajte platný email']"
                >
                  <template #prepend>
<<<<<<< HEAD
                    <q-icon name="mail" color="deep-orange-8" />
=======
                    <q-icon name="mail" color="amber" />
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  </template>
                </q-input>

                <q-input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Heslo"
<<<<<<< HEAD
                  label-color="grey-7"
                  color="deep-orange-8"
=======
                  label-color="grey-4"
                  color="amber"
                  dark
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  outlined
                  dense
                  :rules="[val => !!val || 'Heslo je povinné']"
                >
                  <template #prepend>
<<<<<<< HEAD
                    <q-icon name="lock" color="deep-orange-8" />
=======
                    <q-icon name="lock" color="amber" />
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  </template>
                  <template #append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
<<<<<<< HEAD
                      color="grey-6"
=======
                      color="grey-4"
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>

                <div class="q-pt-sm">
                  <q-btn
                    type="submit"
<<<<<<< HEAD
                    color="deep-orange-7"
                    text-color="white"
=======
                    color="amber"
                    text-color="dark"
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                    class="full-width submit-btn text-weight-bold"
                    size="md"
                    label="Prihlásiť sa"
                    :loading="loading"
                  >
                    <template #loading>
                      <q-spinner-dots />
                    </template>
                  </q-btn>
                </div>
              </q-form>
            </q-tab-panel>

            <!-- TAB: REGISTRÁCIA -->
            <q-tab-panel name="register" class="q-pa-lg">
              <q-form @submit.prevent="handleRegister" class="q-gutter-y-md">
                <q-input
                  v-model="registerForm.name"
                  type="text"
                  label="Celé meno / Prezývka"
<<<<<<< HEAD
                  label-color="grey-7"
                  color="deep-orange-8"
=======
                  label-color="grey-4"
                  color="amber"
                  dark
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  outlined
                  dense
                  :rules="[val => !!val || 'Meno je povinné', val => val.length >= 2 || 'Meno musí mať aspoň 2 znaky']"
                >
                  <template #prepend>
<<<<<<< HEAD
                    <q-icon name="badge" color="deep-orange-8" />
=======
                    <q-icon name="badge" color="amber" />
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  </template>
                </q-input>

                <q-input
                  v-model="registerForm.email"
                  type="email"
                  label="Emailová adresa"
<<<<<<< HEAD
                  label-color="grey-7"
                  color="deep-orange-8"
=======
                  label-color="grey-4"
                  color="amber"
                  dark
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  outlined
                  dense
                  :rules="[val => !!val || 'Email je povinný', val => isValidEmail(val) || 'Zadajte platný email']"
                >
                  <template #prepend>
<<<<<<< HEAD
                    <q-icon name="mail" color="deep-orange-8" />
=======
                    <q-icon name="mail" color="amber" />
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  </template>
                </q-input>

                <q-input
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Heslo"
<<<<<<< HEAD
                  label-color="grey-7"
                  color="deep-orange-8"
=======
                  label-color="grey-4"
                  color="amber"
                  dark
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  outlined
                  dense
                  :rules="[val => !!val || 'Heslo je povinné', val => val.length >= 4 || 'Heslo musí mať aspoň 4 znaky']"
                >
                  <template #prepend>
<<<<<<< HEAD
                    <q-icon name="lock" color="deep-orange-8" />
=======
                    <q-icon name="lock" color="amber" />
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                  </template>
                  <template #append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
<<<<<<< HEAD
                      color="grey-6"
=======
                      color="grey-4"
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>

                <div class="q-pt-sm">
                  <q-btn
                    type="submit"
<<<<<<< HEAD
                    color="deep-orange-7"
                    text-color="white"
=======
                    color="amber"
                    text-color="dark"
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
                    class="full-width submit-btn text-weight-bold"
                    size="md"
                    label="Vytvoriť účet"
                    :loading="loading"
                  >
                    <template #loading>
                      <q-spinner-dots />
                    </template>
                  </q-btn>
                </div>
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { authState } from '../services/auth'
import { state } from '../data/mock'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const tab = ref('login')
const showPassword = ref(false)
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  password: ''
})

function isValidEmail(val) {
  const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailPattern.test(val)
}

async function handleLogin() {
  loading.value = true
  try {
    const user = await authState.login(loginForm.email, loginForm.password)
    state.me.name = user.name
    state.me.nick = user.nick

    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Nepodarilo sa prihlásiť.',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  try {
    const user = await authState.register(registerForm.name, registerForm.email, registerForm.password)
    state.me.name = user.name
    state.me.nick = user.nick

    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Chyba pri registrácii.',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
<<<<<<< HEAD
  background: linear-gradient(135deg, #fffaf6 0%, #fff1e6 100%);
=======
  background: #1e1e1e;
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
  position: relative;
  overflow: hidden;
  font-family: Inter, Roboto, sans-serif;
}

.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.bulb-decor {
  position: absolute;
  top: 0;
  width: 320px;
<<<<<<< HEAD
  opacity: 0.22;
=======
  opacity: 0.85;
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
}

.b1 {
  left: 5%;
}

.b2 {
  right: 5%;
  top: 40px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  margin: 20px;
<<<<<<< HEAD
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #f2e4db;
  border-radius: 16px;
  box-shadow: 0 18px 50px rgba(122, 69, 38, 0.12);
=======
  background: rgba(28, 28, 28, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(10px);
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
  z-index: 2;
}

.app-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2rem;
  font-weight: bold;
<<<<<<< HEAD
  color: #34251e;
=======
  color: #fff;
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
  letter-spacing: 0.5px;
}

.glow-icon {
<<<<<<< HEAD
  filter: drop-shadow(0 0 8px rgba(242, 118, 69, 0.28));
}

.login-tabs {
  background: #fff7f1;
=======
  filter: drop-shadow(0 0 8px rgba(245, 179, 53, 0.6));
}

.login-tabs {
  background: rgba(0, 0, 0, 0.2);
>>>>>>> 8bb8e6b0191572e134656b38232692d89da8a73d
}

.submit-btn {
  border-radius: 8px;
  height: 44px;
  font-size: 1rem;
}
</style>

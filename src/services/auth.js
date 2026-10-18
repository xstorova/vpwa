import { ref } from 'vue'

const STORAGE_TOKEN_KEY = 'sendlight_token'
const STORAGE_USER_KEY = 'sendlight_user'

// Inicializácia zo session/local storage
const storedUser = localStorage.getItem(STORAGE_USER_KEY) || localStorage.getItem('chatapp_user')
const currentUser = ref(storedUser ? JSON.parse(storedUser) : null)
const token = ref(localStorage.getItem(STORAGE_TOKEN_KEY) || localStorage.getItem('chatapp_token') || null)

export const authState = {
  user: currentUser,
  token: token,
  isAuthenticated: () => !!token.value,
  
  async login(email, password) {
    // Simulácia oneskorenia sieťového volania (pripravené pre AdonisJS API)
    await new Promise(resolve => setTimeout(resolve, 400))
    
    if (!email || !password) {
      throw new Error('Prosím zadajte email a heslo.')
    }
    
    // Extrakcia mena z emailu alebo predvolené meno
    const name = email.split('@')[0]
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1)
    
    const userData = {
      id: Date.now(),
      email,
      name: formattedName,
      nick: name.toLowerCase(),
      status: 'online'
    }
    const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(2)
    
    // Uloženie do stavu a LocalStorage
    currentUser.value = userData
    token.value = mockToken
    localStorage.setItem(STORAGE_TOKEN_KEY, mockToken)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData))
    
    return userData
  },

  async register(name, email, password, nick) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!name || !email || !password) {
      throw new Error('Prosím vyplňte všetky povinné polia.')
    }

    const cleanNick = (nick || email.split('@')[0]).trim().replace(/^@/, '').toLowerCase()
    if (!cleanNick) {
      throw new Error('Zadajte platnú prezývku.')
    }
    
    const userData = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      nick: cleanNick,
      status: 'online'
    }
    const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(2)
    
    currentUser.value = userData
    token.value = mockToken
    localStorage.setItem(STORAGE_TOKEN_KEY, mockToken)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData))
    
    return userData
  },

  updateProfile({ name, email, nick }) {
    if (!currentUser.value) {
      throw new Error('Nie ste prihlásený.')
    }

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const cleanNick = nick.trim().replace(/^@/, '').toLowerCase()
    if (cleanName.length < 2) {
      throw new Error('Meno musí mať aspoň 2 znaky.')
    }
    if (!/^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      throw new Error('Zadajte platný email.')
    }
    if (!/^[a-zA-Z0-9_.-]{3,}$/.test(cleanNick)) {
      throw new Error('Prezývka musí mať aspoň 3 znaky a môže obsahovať iba písmená, čísla, podčiarkovník, bodku a pomlčku.')
    }

    const updatedUser = { ...currentUser.value, name: cleanName, email: cleanEmail, nick: cleanNick }
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser))
    Object.assign(currentUser.value, updatedUser)
    return currentUser.value
  },

  logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
  }
}

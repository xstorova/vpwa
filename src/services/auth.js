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

  async register(name, email, password) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!name || !email || !password) {
      throw new Error('Prosím vyplňte všetky povinné polia.')
    }
    
    const userData = {
      id: Date.now(),
      name,
      email,
      nick: email.split('@')[0].toLowerCase(),
      status: 'online'
    }
    const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(2)
    
    currentUser.value = userData
    token.value = mockToken
    localStorage.setItem(STORAGE_TOKEN_KEY, mockToken)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData))
    
    return userData
  },

  logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
  }
}

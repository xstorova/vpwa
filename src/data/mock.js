import { reactive } from 'vue'
import { authState } from '../services/auth.js'

// Mock dáta - v 2. fáze ich nahradí backend (AdonisJS)
export const state = reactive({
  me: authState.user.value || { name: 'Meno Priezvisko', nick: 'me', status: 'online' },
  activeId: 1,
  channels: [
    { id: 1, name: 'Meno Priezviko', group: false, active: true, unread: 0 },
    { id: 2, name: 'Grupe 1', group: true, active: true, unread: 5 },
    { id: 3, name: 'Grupe 2', group: true, active: true, unread: 2 },
    { id: 4, name: 'Meno Priezviko', group: false, active: true, unread: 0 },
    { id: 5, name: 'Meno Priezviko', group: false, active: true, unread: 0 },
    { id: 6, name: 'Meno Priezviko', group: false, active: false, unread: 0 },
    { id: 7, name: 'Grupe 3', group: true, active: false, unread: 0 },
    { id: 8, name: 'Meno Priezviko', group: false, active: false, unread: 0 },
    { id: 9, name: 'Meno Priezviko', group: false, active: false, unread: 0 },
    { id: 10, name: 'Grupe 4', group: true, active: false, unread: 0 }
  ],
  messages: [
    { id: 1, mine: false, old: true, text: 'maksebfowe alskend asjkfna', date: '10/10/2026' },
    { id: 2, mine: true, old: true, text: 'Nankjei asdfjpa aksdjfaing slylkxnvir', date: '10/10/2026' },
    { id: 3, mine: false, old: true, text: 'Kakjsnaofiw nawjsnfoaa askdjfao naskdj akusehf akjsdfao kajsofaspgrl lawjoa anskdfoa alksdfauw Anskaet', date: '10/10/2026' },
    { id: 4, mine: true, old: true, text: 'Nabiasdf nakakjs akjsdhfsof jaloisajower ahsidoifn. KUahfanke ansdfoe ansbehf noivrt nasagxzv oieqopbf baifwuiab', date: '10/10/2026' },
    { id: 5, mine: false, text: 'asljfnaysfd  asefasf sasf', date: '11/10/2026' },
    { id: 6, mine: false, text: 'Kaodansfuiacasfaw safuaowhfasfos', date: '11/10/2026' },
    { id: 7, mine: true, text: 'Jalsaskej alksjnfoia  aasj sakjsehfo asnfo', date: '11/10/2026' },
    { id: 8, mine: true, text: 'Kahdéa askfhaowef aksdfasjpoaw asjbf asoif akjshfiuxs sakusheofa sasicjy aso asiofj akwuhw alskdjf a jdhcbai asjbasu abisuef shebieau ajsjdjfhoa sndbfias', date: '11/10/2026' }
  ]
})

export function send (text) {
  state.messages.push({ id: Date.now(), mine: true, text, date: '11/10/2026' })
}

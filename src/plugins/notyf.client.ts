import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

export default defineNuxtPlugin(() => {
  const notyf = new Notyf({
    duration: 4000,
    position: { x: 'right', y: 'top' },
  })

  return {
    provide: { notyf },
  }
})

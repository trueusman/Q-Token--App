// src/services/notifications.ts

let scheduledTimeout: ReturnType<typeof setTimeout> | null = null

export const requestPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export const scheduleTokenAlert = (
  tokenNumber: number,
  currentToken: number,
  estMinPerToken: number,
  companyName: string,
): void => {
  if (scheduledTimeout) clearTimeout(scheduledTimeout)

  const tokensAhead = Math.max(0, tokenNumber - currentToken)
  const totalWaitMs = tokensAhead * estMinPerToken * 60 * 1000
  const alertAt = totalWaitMs - 10 * 60 * 1000 // 10 min before

  if (tokensAhead <= 0) {
    notify('🎟️ Your turn is here!', `Token #${tokenNumber} at ${companyName} — go now!`)
    return
  }

  if (alertAt <= 0) {
    // Less than 10 min remaining
    notify('⏰ Almost your turn!', `Token #${tokenNumber} at ${companyName} is coming up very soon!`)
    return
  }

  scheduledTimeout = setTimeout(() => {
    notify('⏰ 10 minutes until your turn!', `Token #${tokenNumber} at ${companyName} — get ready!`)
  }, alertAt)
}

export const clearScheduledAlert = (): void => {
  if (scheduledTimeout) {
    clearTimeout(scheduledTimeout)
    scheduledTimeout = null
  }
}

const notify = (title: string, body: string): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.svg' })
  }
}

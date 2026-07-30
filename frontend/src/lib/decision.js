/** Ánh xạ kết luận của rule engine sang ngôn ngữ hiển thị. */

export const STATUS_TONE = {
  READY: 'success',
  UNCERTAIN: 'warning',
  STRUGGLING: 'danger',
  INSUFFICIENT_SIGNAL: 'info',
}

export const STATUS_CHIP = {
  READY: 'success',
  UNCERTAIN: 'warning',
  STRUGGLING: 'hot',
  INSUFFICIENT_SIGNAL: 'neutral',
}

export const SIGNAL_LABEL = {
  adequate: 'Đủ tín hiệu',
  weak: 'Tín hiệu yếu',
  insufficient: 'Chưa đủ tín hiệu',
}

export const RECOVERY_TONE = {
  RECOVERED: 'success',
  PARTIAL: 'warning',
  NOT_RECOVERED: 'danger',
}

export const CONFIDENCE_LABEL = {
  sure: 'Chắc chắn',
  unsure: 'Hơi chắc',
  guess: 'Không chắc',
}

export const ACTION_VARIANT = {
  CONTINUE: 'primary',
  RETEACH_3_MIN: 'secondary',
  REINFORCE_1_MIN: 'ghost',
  SHOW_APPROVED_EXAMPLE: 'ghost',
  DISCUSS_1_MIN: 'ghost',
  RUN_FOLLOW_UP: 'outline',
  SEND_HINT_GROUP: 'ghost',
}

export function pulseSummary(pulse = {}) {
  const understand = pulse.understand ?? 0
  const unclear = pulse.unclear ?? 0
  const stuck = pulse.stuck ?? 0
  const total = understand + unclear + stuck
  return {
    total,
    struggling: total > 0 ? Math.round(((unclear + stuck) / total) * 100) : 0,
  }
}

export const pct = (value) => `${Math.round(value ?? 0)}%`

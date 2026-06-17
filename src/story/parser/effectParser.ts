import type { Effect } from '../types'

export function parseEffects(section: string): Effect[] {
  if (!section) return []

  const effects: Effect[] = []
  for (const line of section.split('\n')) {
    const effect = parseEffectLine(line.trim())
    if (effect) effects.push(effect)
  }
  return effects
}

export function parseEffectLine(line: string): Effect | null {
  if (!line || line === '无') return null

  let match = line.match(/^获得[：:]\s*(.+)$/)
  if (match?.[1]) return { type: 'gain_item', target: match[1].trim() }

  match = line.match(/^失去[：:]\s*(.+)$/)
  if (match?.[1]) return { type: 'lose_item', target: match[1].trim() }

  match = line.match(/^(.+?)好感\s*\+\s*(\d+)$/)
  if (match?.[1] && match[2]) {
    return { type: 'favor_up', target: match[1].trim(), value: Number(match[2]) }
  }

  match = line.match(/^(.+?)好感\s*-\s*(\d+)$/)
  if (match?.[1] && match[2]) {
    return { type: 'favor_down', target: match[1].trim(), value: Number(match[2]) }
  }

  match = line.match(/^(获得|解锁)线索[：:]\s*(.+)$/)
  if (match?.[2]) return { type: 'unlock_clue', target: match[2].trim() }

  match = line.match(/^路线[：:]\s*(.+)$/)
  if (match?.[1]) return { type: 'route', target: match[1].trim() }

  match = line.match(/^境界[：:]\s*(.+)$/)
  if (match?.[1]) return { type: 'realm', target: match[1].trim() }

  match = line.match(/^解锁能力[：:]\s*(.+)$/)
  if (match?.[1]) return { type: 'ability', target: match[1].trim() }

  match = line.match(/^解锁结局[：:]\s*(.+)$/)
  if (match?.[1]) return { type: 'ending', target: match[1].trim() }

  match = line.match(/^解锁(.+?)功能$/)
  if (match?.[1]) return { type: 'unlock_feature', target: match[1].trim() }

  match = line.match(/^得知[：:]\s*(.+)$/)
  if (match?.[1]) return { type: 'info', target: match[1].trim() }

  if (!line.startsWith('【')) {
    return { type: 'info', target: line }
  }

  return null
}

function normalizeSeedPart(part: number | string): number {
  if (typeof part === 'number') {
    return Number.isFinite(part) ? part : 0
  }

  let hash = 0
  for (let i = 0; i < part.length; i++) {
    hash = (hash * 31 + part.charCodeAt(i)) >>> 0
  }
  return hash
}

export function buildWorldSeed(...parts: Array<number | string>): number {
  return parts.reduce<number>((seed, part, index) => {
    const normalized = normalizeSeedPart(part)
    return seed + normalized * (index + 1) * 0.61803398875
  }, 0)
}

export function seededWorldRoll(...parts: Array<number | string>): number {
  const x = Math.sin(buildWorldSeed(...parts)) * 10000
  return x - Math.floor(x)
}

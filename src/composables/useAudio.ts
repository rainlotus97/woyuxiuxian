import { ref } from 'vue'
import type * as ToneNs from 'tone'

// ====== Tone.js 延迟加载 ======
type ToneModule = typeof ToneNs
let T: ToneModule | null = null

const loadTone = async (): Promise<ToneModule> => {
  if (!T) {
    T = await import('tone')
  }
  await T.start()
  return T
}

// ====== 本地存储键名 ======
const STORAGE_KEY_SFX = 'xiuxian_sfx_enabled'
const STORAGE_KEY_BGM = 'xiuxian_bgm_enabled'

// ====== 从 localStorage 读取初始值 ======
const getStoredBoolean = (key: string, defaultValue: boolean): boolean => {
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      return stored === 'true'
    }
  } catch {
    // localStorage 不可用时忽略
  }
  return defaultValue
}

// ====== 音量设置 ======
const sfxEnabled = ref(getStoredBoolean(STORAGE_KEY_SFX, true))
const bgmEnabled = ref(getStoredBoolean(STORAGE_KEY_BGM, true))
const sfxVolume = 0.35
const bgmVolume = 0.18

const toDb = (v: number): number => (v <= 0 ? -Infinity : 20 * Math.log10(v))

// ====== 高级音效播放器 ======
type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth'

interface SfxOptions {
  freq: number
  duration: number
  type?: WaveType
  vol?: number
  attack?: number
  decay?: number
  sustain?: number
  release?: number
  detune?: number
}

const playSfx = (options: SfxOptions): void => {
  if (!sfxEnabled.value || !T || document.hidden) return

  const {
    freq,
    duration,
    type = 'sine',
    vol = sfxVolume,
    attack = 0.01,
    decay = duration * 0.3,
    sustain = 0.2,
    release = duration * 0.5
  } = options

  try {
    const synth = new T.Synth({
      oscillator: { type },
      envelope: { attack, decay, sustain, release },
      volume: toDb(vol)
    }).toDestination()

    synth.triggerAttackRelease(freq, duration)
    setTimeout(() => safeDispose(synth), (duration + release + 0.3) * 1000)
  } catch {
    /* AudioContext not ready */
  }
}

// 播放和弦
const playChord = (freqs: number[], duration: number, type: WaveType = 'sine', vol = sfxVolume): void => {
  if (!sfxEnabled.value || !T || document.hidden) return

  try {
    const synth = new T.PolySynth(T.Synth, {
      oscillator: { type },
      envelope: { attack: 0.02, decay: duration * 0.3, sustain: 0.1, release: duration * 0.4 },
      volume: toDb(vol)
    }).toDestination()

    synth.triggerAttackRelease(freqs, duration)
    setTimeout(() => safeDispose(synth), (duration + 0.5) * 1000)
  } catch {
    /* AudioContext not ready */
  }
}

// 滑音效果
const playGlissando = (startFreq: number, endFreq: number, duration: number, type: WaveType = 'sine', vol = sfxVolume): void => {
  if (!sfxEnabled.value || !T || document.hidden) return

  try {
    const synth = new T.Synth({
      oscillator: { type },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.3 },
      volume: toDb(vol)
    }).toDestination()

    synth.triggerAttack(startFreq)
    synth.frequency.rampTo(endFreq, duration * 0.8)
    setTimeout(() => {
      synth.triggerRelease()
      setTimeout(() => safeDispose(synth), 400)
    }, duration * 800)
  } catch {
    /* AudioContext not ready */
  }
}

// 噪声效果（雨声、风声、雪声等）
const playNoise = (duration: number, type: 'white' | 'pink' | 'brown' = 'brown', vol = 0.1, filterFreq = 800): void => {
  if (!sfxEnabled.value || !T || document.hidden) return

  try {
    const noise = new T.Noise(type)
    const filter = new T.Filter({
      type: 'lowpass',
      frequency: filterFreq,
      Q: 1
    })
    const amp = new T.AmplitudeEnvelope({
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3
    })

    noise.connect(filter)
    filter.connect(amp)
    amp.toDestination()

    noise.volume.value = toDb(vol)
    noise.start()
    amp.triggerAttackRelease(duration)

    setTimeout(() => {
      noise.stop()
      safeDispose(noise)
      safeDispose(filter)
      safeDispose(amp)
    }, (duration + 0.5) * 1000)
  } catch {
    /* AudioContext not ready */
  }
}

const safeDispose = (node: unknown): void => {
  try {
    ;(node as { dispose?: () => void })?.dispose?.()
  } catch {
    /* already disposed */
  }
}

// ============================================================
//                    基础交互音效
// ============================================================

/** 按钮点击 - 玉磬清音 */
export const sfxClick = (): void => {
  playSfx({ freq: 880, duration: 0.06, type: 'triangle', vol: 0.12, release: 0.08 })
  setTimeout(() => playSfx({ freq: 1320, duration: 0.04, type: 'sine', vol: 0.06, release: 0.06 }), 25)
}

/** 获得物品 - 仙音缭绕 */
export const sfxItem = (): void => {
  playChord([784, 988, 1175], 0.25, 'triangle', 0.18)
  setTimeout(() => playSfx({ freq: 1319, duration: 0.35, type: 'sine', vol: 0.12, release: 0.25 }), 120)
}

/** 错误/失败 - 警钟 */
export const sfxError = (): void => {
  playSfx({ freq: 220, duration: 0.12, type: 'square', vol: 0.15, attack: 0.01 })
  setTimeout(() => playSfx({ freq: 196, duration: 0.18, type: 'square', vol: 0.12 }), 130)
}

/** 升级/突破成功 - 灵光乍现 */
export const sfxLevelUp = (): void => {
  playChord([440, 554, 659], 0.25, 'sine', 0.12)
  setTimeout(() => playChord([554, 659, 880], 0.25, 'sine', 0.1), 130)
  setTimeout(() => playChord([659, 880, 1047], 0.4, 'triangle', 0.08), 260)
}

/** 灵石交易 - 玉珠落盘 */
export const sfxSpiritStone = (): void => {
  const notes = [659, 784, 880, 1047]
  notes.forEach((f, i) => {
    setTimeout(() => playSfx({ freq: f, duration: 0.08, type: 'triangle', vol: 0.12 }), i * 50)
  })
}

/** 技能升级 - 灵光乍现 */
export const sfxSkillUp = (): void => {
  playChord([392, 494, 587], 0.2, 'sine', 0.12)
  setTimeout(() => playChord([494, 587, 784], 0.2, 'sine', 0.1), 100)
  setTimeout(() => playChord([587, 784, 988], 0.35, 'triangle', 0.08), 200)
}

// ============================================================
//                    修炼相关音效
// ============================================================

/** 修炼打坐 - 灵气入体 */
export const sfxMeditate = (): void => {
  playChord([262, 330, 392], 0.7, 'sine', 0.1)
  setTimeout(() => playChord([330, 392, 523], 0.7, 'sine', 0.08), 350)
  setTimeout(() => playChord([392, 523, 659], 0.9, 'sine', 0.06), 700)
}

/** 突破境界 - 天地共鸣 */
export const sfxBreakthrough = (): void => {
  playGlissando(220, 880, 0.7, 'sine', 0.18)
  setTimeout(() => playChord([523, 659, 784, 1047], 0.5, 'triangle', 0.22), 500)
  setTimeout(() => playSfx({ freq: 1568, duration: 1.0, type: 'sine', vol: 0.12, attack: 0.1, release: 0.7 }), 850)
}

/** 炼丹 - 丹炉火起，药香四溢 */
export const sfxAlchemy = (): void => {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      playSfx({ freq: 100 + Math.random() * 100, duration: 0.04, type: 'sawtooth', vol: 0.08, attack: 0.005 })
    }, i * 70)
  }
  setTimeout(() => playChord([392, 523, 659], 0.4, 'triangle', 0.15), 400)
}

/** 休息/闭关 - 心如止水 */
export const sfxRest = (): void => {
  const notes = [523, 440, 392, 330, 262]
  notes.forEach((f, i) => {
    setTimeout(() => {
      playSfx({ freq: f, duration: 0.35, type: 'sine', vol: 0.1 - i * 0.015, attack: 0.05, release: 0.25 })
    }, i * 180)
  })
}

// ============================================================
//                    武器碰撞音效
// ============================================================

/** 剑 - 剑鸣清越，如龙吟 */
export const sfxSword = (): void => {
  playSfx({ freq: 600, duration: 0.08, type: 'triangle', vol: 0.2, attack: 0.005 })
  setTimeout(() => playGlissando(800, 1200, 0.15, 'sine', 0.15), 30)
  setTimeout(() => playSfx({ freq: 1500, duration: 0.2, type: 'sine', vol: 0.08, release: 0.15 }), 80)
}

/** 刀 - 刀势沉稳，如虎啸 */
export const sfxBlade = (): void => {
  playSfx({ freq: 200, duration: 0.1, type: 'sawtooth', vol: 0.25, attack: 0.005 })
  setTimeout(() => playSfx({ freq: 400, duration: 0.08, type: 'square', vol: 0.18 }), 40)
  setTimeout(() => playSfx({ freq: 150, duration: 0.15, type: 'sawtooth', vol: 0.12 }), 80)
}

/** 棍 - 棍风呼啸，沉闷有力 */
export const sfxStaff = (): void => {
  playSfx({ freq: 80, duration: 0.15, type: 'sawtooth', vol: 0.28, attack: 0.005 })
  setTimeout(() => playSfx({ freq: 120, duration: 0.1, type: 'square', vol: 0.2 }), 50)
  // 风声
  setTimeout(() => playSfx({ freq: 200, duration: 0.2, type: 'sine', vol: 0.08, attack: 0.05 }), 80)
}

/** 枪 - 枪出如龙，锐利破空 */
export const sfxSpear = (): void => {
  playGlissando(400, 100, 0.12, 'sawtooth', 0.22)
  setTimeout(() => playSfx({ freq: 300, duration: 0.1, type: 'square', vol: 0.15 }), 60)
}

/** 扇 - 扇风优雅，轻灵飘逸 */
export const sfxFan = (): void => {
  // 轻柔的风声
  playSfx({ freq: 400, duration: 0.2, type: 'sine', vol: 0.1, attack: 0.05, release: 0.1 })
  setTimeout(() => playSfx({ freq: 600, duration: 0.15, type: 'triangle', vol: 0.08 }), 80)
}

/** 琴 - 琴音悠扬，清心寡欲 */
export const sfxQin = (): void => {
  playChord([523, 659, 784], 0.6, 'sine', 0.12)
  setTimeout(() => playSfx({ freq: 1047, duration: 0.8, type: 'sine', vol: 0.08, release: 0.6 }), 200)
}

/** 笛 - 笛声悠远，如泣如诉 */
export const sfxFlute = (): void => {
  playSfx({ freq: 587, duration: 0.3, type: 'sine', vol: 0.12, attack: 0.05, release: 0.2 })
  setTimeout(() => playSfx({ freq: 659, duration: 0.4, type: 'sine', vol: 0.1, attack: 0.05, release: 0.3 }), 250)
}

// ============================================================
//                    战斗音效
// ============================================================

/** 普通攻击 - 剑气激荡 */
export const sfxAttack = (): void => {
  playGlissando(700, 150, 0.12, 'sawtooth', 0.22)
  setTimeout(() => playSfx({ freq: 120, duration: 0.08, type: 'square', vol: 0.18, attack: 0.001 }), 70)
}

/** 重击 - 力劈华山 */
export const sfxHeavyAttack = (): void => {
  playSfx({ freq: 80, duration: 0.15, type: 'sawtooth', vol: 0.3, attack: 0.001 })
  setTimeout(() => playSfx({ freq: 150, duration: 0.1, type: 'square', vol: 0.25 }), 60)
  setTimeout(() => playSfx({ freq: 60, duration: 0.2, type: 'sawtooth', vol: 0.2 }), 120)
}

/** 闪躲 - 身法灵动 */
export const sfxDodge = (): void => {
  // 轻快的风声
  playGlissando(600, 900, 0.15, 'sine', 0.12)
  setTimeout(() => playSfx({ freq: 1000, duration: 0.08, type: 'triangle', vol: 0.08 }), 80)
}

/** 格挡 - 金铁交鸣 */
export const sfxBlock = (): void => {
  playSfx({ freq: 400, duration: 0.1, type: 'square', vol: 0.2, attack: 0.005 })
  setTimeout(() => playSfx({ freq: 800, duration: 0.15, type: 'triangle', vol: 0.15 }), 30)
}

/** 受伤 - 气血翻涌 */
export const sfxHurt = (): void => {
  playSfx({ freq: 200, duration: 0.12, type: 'sawtooth', vol: 0.18, attack: 0.01 })
  setTimeout(() => playSfx({ freq: 150, duration: 0.1, type: 'sawtooth', vol: 0.14 }), 70)
  setTimeout(() => playSfx({ freq: 100, duration: 0.12, type: 'sawtooth', vol: 0.1 }), 130)
}

/** 濒死 - 命悬一线 */
export const sfxCritical = (): void => {
  // 心跳声
  playSfx({ freq: 60, duration: 0.15, type: 'sine', vol: 0.2, attack: 0.01 })
  setTimeout(() => playSfx({ freq: 60, duration: 0.15, type: 'sine', vol: 0.18, attack: 0.01 }), 200)
  setTimeout(() => playSfx({ freq: 60, duration: 0.15, type: 'sine', vol: 0.16, attack: 0.01 }), 400)
}

/** 死亡 - 魂飞魄散 */
export const sfxDeath = (): void => {
  // 下降滑音
  playGlissando(440, 55, 1.2, 'sine', 0.15)
  setTimeout(() => playSfx({ freq: 80, duration: 0.8, type: 'sawtooth', vol: 0.1, attack: 0.2 }), 400)
}

/** 胜利 - 正气浩然 */
export const sfxVictory = (): void => {
  const notes = [392, 523, 659, 784, 1047]
  notes.forEach((f, i) => {
    setTimeout(() => playSfx({ freq: f, duration: 0.18, type: 'triangle', vol: 0.18 - i * 0.02 }), i * 90)
  })
  setTimeout(() => playChord([523, 659, 784, 1047], 0.7, 'sine', 0.15), 500)
}

/** 战败 - 功亏一篑 */
export const sfxDefeat = (): void => {
  const notes = [523, 440, 392, 330, 262]
  notes.forEach((f, i) => {
    setTimeout(() => playSfx({ freq: f, duration: 0.25, type: 'sine', vol: 0.12 - i * 0.015, release: 0.2 }), i * 200)
  })
}

/** 遭遇敌人 - 阴风阵阵 */
export const sfxEncounter = (): void => {
  playGlissando(200, 60, 0.5, 'sawtooth', 0.12)
  setTimeout(() => playSfx({ freq: 50, duration: 0.7, type: 'sine', vol: 0.1, attack: 0.2 }), 150)
}

// ============================================================
//                    仙法/法术音效
// ============================================================

/** 施法准备 - 灵力汇聚 */
export const sfxCastPrepare = (): void => {
  const notes = [262, 330, 392, 440]
  notes.forEach((f, i) => {
    setTimeout(() => playSfx({ freq: f, duration: 0.15, type: 'sine', vol: 0.1 + i * 0.02 }), i * 70)
  })
}

/** 火系法术 - 烈焰焚天 */
export const sfxFire = (): void => {
  // 火焰噼啪
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      playSfx({ freq: 150 + Math.random() * 100, duration: 0.05, type: 'sawtooth', vol: 0.15 })
    }, i * 50)
  }
  // 爆发
  setTimeout(() => playGlissando(300, 600, 0.2, 'sawtooth', 0.2), 200)
}

/** 水系法术 - 寒冰刺骨 */
export const sfxWater = (): void => {
  // 水流声
  playSfx({ freq: 400, duration: 0.3, type: 'sine', vol: 0.12, attack: 0.1 })
  setTimeout(() => playChord([523, 659, 784], 0.4, 'triangle', 0.15), 150)
  // 冰晶
  setTimeout(() => playSfx({ freq: 1200, duration: 0.15, type: 'sine', vol: 0.1 }), 300)
}

/** 雷系法术 - 雷霆万钧 */
export const sfxThunder = (): void => {
  // 雷声
  playSfx({ freq: 50, duration: 0.3, type: 'sawtooth', vol: 0.35, attack: 0.01 })
  setTimeout(() => playSfx({ freq: 80, duration: 0.2, type: 'square', vol: 0.28 }), 100)
  setTimeout(() => playSfx({ freq: 60, duration: 0.25, type: 'sawtooth', vol: 0.22 }), 200)
  // 电弧
  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => playSfx({ freq: 2000 + Math.random() * 1000, duration: 0.03, type: 'square', vol: 0.1 }), i * 30)
    }
  }, 50)
}

/** 风系法术 - 狂风呼啸 */
export const sfxWind = (): void => {
  playGlissando(200, 600, 0.4, 'sine', 0.15)
  setTimeout(() => playNoise(0.5, 'white', 0.08, 1500), 100)
}

/** 土系法术 - 大地崩裂 */
export const sfxEarth = (): void => {
  playSfx({ freq: 60, duration: 0.3, type: 'sawtooth', vol: 0.28, attack: 0.01 })
  setTimeout(() => playSfx({ freq: 80, duration: 0.2, type: 'square', vol: 0.22 }), 100)
  setTimeout(() => playSfx({ freq: 100, duration: 0.15, type: 'sawtooth', vol: 0.18 }), 200)
}

/** 木系法术 - 万物复苏 */
export const sfxWood = (): void => {
  // 生长的声音
  const notes = [330, 392, 440, 523, 587]
  notes.forEach((f, i) => {
    setTimeout(() => playSfx({ freq: f, duration: 0.2, type: 'sine', vol: 0.08, attack: 0.05, release: 0.15 }), i * 80)
  })
}

/** 仙法碰撞 - 灵力激荡 */
export const sfxMagicClash = (): void => {
  playChord([440, 554, 659, 880], 0.3, 'sawtooth', 0.2)
  setTimeout(() => playGlissando(880, 220, 0.2, 'square', 0.15), 150)
}

/** 符箓激活 - 符文闪动 */
export const sfxTalisman = (): void => {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => playSfx({ freq: 440 + (i % 2) * 50, duration: 0.06, type: 'triangle', vol: 0.1 }), i * 50)
  }
}

/** 阵法启动 - 法阵流转 */
export const sfxFormation = (): void => {
  const notes = [262, 330, 392, 440, 392, 330]
  notes.forEach((f, i) => {
    setTimeout(() => playSfx({ freq: f, duration: 0.18, type: 'sine', vol: 0.12, release: 0.12 }), i * 130)
  })
}

// ============================================================
//                    天气/环境音效
// ============================================================

/** 春风细雨 - 润物无声 */
export const sfxSpringRain = (): void => {
  // 雨滴
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      playSfx({ freq: 800 + Math.random() * 400, duration: 0.05, type: 'sine', vol: 0.04 })
    }, i * 100 + Math.random() * 50)
  }
  // 背景雨声
  playNoise(1.5, 'pink', 0.03, 1200)
}

/** 夏日雷电 - 骤雨初歇 */
export const sfxSummerStorm = (): void => {
  // 雷声
  playSfx({ freq: 40, duration: 0.4, type: 'sawtooth', vol: 0.25, attack: 0.01 })
  setTimeout(() => playSfx({ freq: 70, duration: 0.3, type: 'square', vol: 0.2 }), 80)
  // 雨声
  setTimeout(() => playNoise(0.8, 'white', 0.05, 2000), 100)
}

/** 秋风落叶 - 萧瑟凄凉 */
export const sfxAutumnWind = (): void => {
  // 风声
  playNoise(1.2, 'brown', 0.06, 600)
  // 叶子沙沙
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      playSfx({ freq: 200 + Math.random() * 100, duration: 0.08, type: 'triangle', vol: 0.03 })
    }, i * 200 + Math.random() * 100)
  }
}

/** 冬日寒风 - 寒气逼人 */
export const sfxWinterWind = (): void => {
  // 呼啸的寒风
  playGlissando(150, 300, 0.8, 'sine', 0.08)
  playNoise(1.0, 'white', 0.04, 3000)
}

/** 大雪纷飞 - 银装素裹 */
export const sfxSnow = (): void => {
  // 轻柔的雪声
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      playSfx({ freq: 1500 + Math.random() * 500, duration: 0.1, type: 'sine', vol: 0.02, attack: 0.05 })
    }, i * 150 + Math.random() * 100)
  }
}

// ============================================================
//                    特殊音效
// ============================================================

/** Boss出现 - 威压降临 */
export const sfxBossAppear = (): void => {
  // 低沉的威压
  playSfx({ freq: 40, duration: 1.0, type: 'sawtooth', vol: 0.2, attack: 0.3 })
  setTimeout(() => playSfx({ freq: 60, duration: 0.8, type: 'square', vol: 0.15, attack: 0.2 }), 300)
  // 不祥的和弦
  setTimeout(() => playChord([131, 165, 196], 0.8, 'sawtooth', 0.12), 500)
}

/** Boss二阶段 - 真身显现 */
export const sfxBossPhase2 = (): void => {
  // 紧张的上升
  const notes = [131, 165, 196, 262, 330, 392]
  notes.forEach((f, i) => {
    setTimeout(() => playSfx({ freq: f, duration: 0.2, type: 'sawtooth', vol: 0.18 - i * 0.02 }), i * 100)
  })
  // 爆发
  setTimeout(() => playChord([131, 196, 262, 330], 0.6, 'square', 0.2), 700)
}

/** 渡劫 - 天雷滚滚 */
export const sfxTribulation = (): void => {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      playSfx({ freq: 30 + Math.random() * 50, duration: 0.3, type: 'sawtooth', vol: 0.3 - i * 0.04, attack: 0.01 })
    }, i * 180)
  }
  setTimeout(() => playChord([131, 165, 196], 0.7, 'sine', 0.12), 1000)
}

/** 仙缘降临 - 神圣庄严 */
export const sfxDivine = (): void => {
  playChord([392, 494, 587, 784], 0.9, 'sine', 0.12)
  setTimeout(() => playChord([523, 659, 784, 1047], 1.0, 'triangle', 0.1), 500)
}

/** 探索发现 - 仙缘巧合 */
export const sfxDiscovery = (): void => {
  playGlissando(330, 660, 0.35, 'sine', 0.12)
  setTimeout(() => playChord([523, 659, 784], 0.4, 'triangle', 0.1), 250)
}

// ============================================================
//                    BGM 系统
// ============================================================

export type BgmType =
  // 门派场景
  | 'sect_main'      // 门派主殿 - 仙气缭绕
  | 'sect_bamboo'    // 小竹峰 - 清闲幽静
  | 'sect_peak'      // 云顶峰 - 高远空灵
  | 'sect_pavilion'  // 藏经阁 - 古朴神秘
  // 四季场景
  | 'spring_rain'    // 春风细雨
  | 'summer_storm'   // 夏日雷电
  | 'autumn_wind'    // 秋风落叶
  | 'winter_snow'    // 冬日雪景
  // 战斗场景
  | 'battle_normal'  // 普通战斗
  | 'battle_boss'    // Boss战斗
  | 'battle_phase2'  // Boss二阶段
  // 特殊场景
  | 'adventure'      // 历险探索
  | 'shop'           // 坊市
  | 'tribulation'    // 渡劫

const currentBgmType = ref<BgmType | null>(null)

// ============================================================
//                    BGM 旋律配置
// ============================================================

interface BgmConfig {
  name: string
  melody: number[]
  bass: number[]
  noteDur: number
  melodyWave: WaveType
  bassWave: WaveType
  bassInterval?: number
  // 环境音效
  ambient?: {
    type: 'white' | 'pink' | 'brown'
    volume: number
    filterFreq: number
  }
}

const BGM_CONFIG: Record<BgmType, BgmConfig> = {
  // ===== 门派场景 =====
  // 门派主殿：庄严宏大，钟磬齐鸣，节奏稳重有力
  sect_main: {
    name: '门派主殿',
    melody: [
      // 庄严的钟声上行
      262, 0, 0, 0, 330, 0, 0, 0, 392, 0, 0, 0, 523, 0, 0, 0,
      // 下降回应
      523, 0, 0, 0, 392, 0, 0, 0, 330, 0, 0, 0, 262, 0, 0, 0
    ],
    bass: [131, 0, 0, 0, 165, 0, 0, 0],
    noteDur: 0.7,
    melodyWave: 'triangle',
    bassWave: 'sine'
  },

  // 小竹峰：极度清幽，几不可闻，如竹林深处偶有风动
  sect_bamboo: {
    name: '小竹峰',
    melody: [
      // 极简，长休止
      440, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 523, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 392, 0, 0, 0, 0, 0, 0, 0
    ],
    bass: [110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    noteDur: 1.2,
    melodyWave: 'sine',
    bassWave: 'sine'
  },

  // 云顶峰：高远空灵，云雾缭绕，音符飘渺
  sect_peak: {
    name: '云顶峰',
    melody: [
      // 高音区的飘渺旋律
      784, 0, 0, 880, 0, 0, 784, 0, 0, 659, 0, 0, 523, 0, 0, 0,
      587, 0, 0, 659, 0, 0, 784, 0, 0, 880, 0, 0, 1047, 0, 0, 0
    ],
    bass: [131, 0, 0, 0, 0, 0, 0, 0],
    noteDur: 0.8,
    melodyWave: 'sine',
    bassWave: 'sine'
  },

  // 藏经阁：古朴神秘，低沉庄严，如古卷翻页
  sect_pavilion: {
    name: '藏经阁',
    melody: [
      // 低沉神秘的下行
      330, 0, 0, 294, 0, 0, 262, 0, 0, 220, 0, 0, 196, 0, 0, 0,
      // 缓慢回升
      220, 0, 0, 262, 0, 0, 294, 0, 0, 330, 0, 0, 262, 0, 0, 0
    ],
    bass: [110, 0, 0, 0, 98, 0, 0, 0],
    noteDur: 0.65,
    melodyWave: 'triangle',
    bassWave: 'sine'
  },

  // ===== 四季场景 =====
  // 春风细雨：轻快跳跃，生机勃勃，如雨滴溅落
  spring_rain: {
    name: '春风细雨',
    melody: [
      // 轻快的跳跃音型，模拟雨滴
      523, 587, 523, 440, 523, 587, 659, 523, 440, 392, 440, 523, 440, 392, 330, 392,
      440, 523, 440, 392, 330, 294, 330, 392, 440, 523, 587, 523, 440, 392, 330, 294
    ],
    bass: [262, 0, 330, 0, 392, 0, 330, 0],
    noteDur: 0.2,
    melodyWave: 'sine',
    bassWave: 'sine',
    ambient: { type: 'pink', volume: 0.012, filterFreq: 2000 }
  },

  // 夏日雷电：激烈紧张，骤雨初歇，有爆发感
  summer_storm: {
    name: '夏日雷电',
    melody: [
      // 紧张的低音旋律
      165, 0, 196, 0, 220, 0, 262, 0, 220, 0, 196, 0, 165, 0, 131, 0,
      // 突然的高音爆发
      523, 0, 0, 659, 0, 0, 784, 0, 0, 659, 0, 0, 523, 0, 0, 392
    ],
    bass: [82, 0, 98, 0, 110, 0, 131, 0],
    noteDur: 0.25,
    melodyWave: 'sawtooth',
    bassWave: 'square',
    ambient: { type: 'white', volume: 0.025, filterFreq: 2000 }
  },

  // 秋风落叶：悲伤缓慢，下行旋律，萧瑟凄凉
  autumn_wind: {
    name: '秋风落叶',
    melody: [
      // 持续下行的悲伤旋律
      392, 0, 0, 0, 330, 0, 0, 0, 294, 0, 0, 0, 262, 0, 0, 0,
      220, 0, 0, 0, 196, 0, 0, 0, 175, 0, 0, 0, 165, 0, 0, 0
    ],
    bass: [98, 0, 0, 0, 82, 0, 0, 0],
    noteDur: 1.0,
    melodyWave: 'triangle',
    bassWave: 'sine',
    ambient: { type: 'brown', volume: 0.03, filterFreq: 600 }
  },

  // 冬日雪景：极简空灵，几乎静止，偶有雪花飘落
  winter_snow: {
    name: '冬日雪景',
    melody: [
      // 极少的音符，大量留白
      880, 0, 0, 0, 0, 0, 0, 0, 784, 0, 0, 0, 0, 0, 0, 0,
      659, 0, 0, 0, 0, 0, 0, 0, 523, 0, 0, 0, 0, 0, 0, 0
    ],
    bass: [131, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    noteDur: 1.5,
    melodyWave: 'sine',
    bassWave: 'sine',
    ambient: { type: 'white', volume: 0.008, filterFreq: 5000 }
  },

  // ===== 战斗场景 =====
  battle_normal: {
    name: '战斗',
    melody: [
      220, 0, 262, 0, 330, 0, 262, 0, 220, 0, 262, 0, 330, 0, 392, 0,
      330, 0, 392, 0, 440, 0, 392, 0, 330, 0, 262, 0, 220, 0, 262, 0
    ],
    bass: [110, 0, 110, 0, 131, 0, 131, 0],
    noteDur: 0.22,
    melodyWave: 'sawtooth',
    bassWave: 'square',
    bassInterval: 2
  },

  battle_boss: {
    name: 'Boss战',
    melody: [
      131, 0, 165, 0, 196, 0, 165, 0, 131, 0, 98, 0, 131, 0, 165, 0,
      196, 0, 262, 0, 196, 0, 165, 0, 131, 0, 165, 0, 196, 0, 262, 0
    ],
    bass: [65, 0, 65, 0, 82, 0, 82, 0],
    noteDur: 0.3,
    melodyWave: 'sawtooth',
    bassWave: 'sawtooth',
    bassInterval: 2
  },

  battle_phase2: {
    name: 'Boss二阶段',
    melody: [
      98, 131, 98, 131, 165, 131, 98, 131, 98, 131, 98, 131, 165, 196, 165, 131,
      165, 196, 165, 131, 98, 131, 98, 65, 98, 131, 165, 196, 262, 196, 165, 131
    ],
    bass: [65, 65, 65, 65, 82, 82, 65, 65],
    noteDur: 0.18,
    melodyWave: 'sawtooth',
    bassWave: 'square',
    bassInterval: 1
  },

  // ===== 特殊场景 =====
  // 历险探索：神秘未知，危机四伏，低沉缓慢
  adventure: {
    name: '历险探索',
    melody: [
      // 神秘的探索感，音符稀疏
      196, 0, 0, 0, 0, 220, 0, 0, 0, 0, 262, 0, 0, 0, 0, 196,
      0, 0, 0, 0, 262, 0, 0, 0, 0, 330, 0, 0, 0, 0, 262, 0
    ],
    bass: [65, 0, 0, 0, 0, 0, 0, 0, 82, 0, 0, 0, 0, 0, 0, 0],
    noteDur: 0.55,
    melodyWave: 'triangle',
    bassWave: 'sine'
  },

  // 坊市：人间烟火，热闹非凡，节奏明快
  shop: {
    name: '坊市',
    melody: [
      // 活泼热闹的旋律
      392, 440, 523, 440, 392, 330, 392, 440, 523, 587, 523, 440, 392, 330, 294, 330,
      392, 440, 523, 587, 523, 440, 392, 440, 523, 659, 587, 523, 440, 392, 330, 294
    ],
    bass: [196, 220, 262, 220, 165, 196, 220, 262],
    noteDur: 0.18,
    melodyWave: 'square',
    bassWave: 'triangle'
  },

  // 渡劫：生死一线，天威浩荡，极其紧张
  tribulation: {
    name: '渡劫',
    melody: [
      // 紧张的低音轰鸣
      65, 0, 82, 0, 98, 0, 82, 0, 65, 0, 55, 0, 65, 0, 82, 0,
      // 偶尔的高音雷鸣
      0, 0, 0, 0, 523, 0, 0, 0, 0, 0, 0, 0, 659, 0, 0, 0
    ],
    bass: [32, 0, 41, 0, 49, 0, 41, 0],
    noteDur: 0.4,
    melodyWave: 'sawtooth',
    bassWave: 'sawtooth',
    bassInterval: 2
  }
}

// ====== BGM 播放核心 ======
let bgmPlaying = false
let bgmLoopId = 0
let melodySynth: unknown = null
let bassSynth: unknown = null
let ambientNoise: unknown = null
let ambientFilter: unknown = null

const cleanupBgm = (): void => {
  safeDispose(melodySynth)
  safeDispose(bassSynth)
  safeDispose(ambientNoise)
  safeDispose(ambientFilter)
  melodySynth = null
  bassSynth = null
  ambientNoise = null
  ambientFilter = null
  currentBgmType.value = null
}

const playBgmLoop = async (type: BgmType): Promise<void> => {
  if (!bgmEnabled.value) return
  if (bgmPlaying && currentBgmType.value === type) return

  stopBgm()
  bgmPlaying = true
  currentBgmType.value = type
  const myLoopId = ++bgmLoopId

  let Tone: ToneModule
  try {
    Tone = await loadTone()
  } catch {
    bgmPlaying = false
    currentBgmType.value = null
    return
  }

  if (!bgmEnabled.value || !bgmPlaying || myLoopId !== bgmLoopId) {
    if (myLoopId === bgmLoopId) {
      bgmPlaying = false
      currentBgmType.value = null
    }
    return
  }

  const config = BGM_CONFIG[type]

  melodySynth = new Tone.Synth({
    oscillator: { type: config.melodyWave },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.3 },
    volume: toDb(bgmVolume)
  }).toDestination()

  bassSynth = new Tone.Synth({
    oscillator: { type: config.bassWave },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 0.4 },
    volume: toDb(bgmVolume * 0.4)
  }).toDestination()

  // 环境音效
  if (config.ambient) {
    ambientFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: config.ambient.filterFreq
    }).toDestination()

    ambientNoise = new Tone.Noise(config.ambient.type)
    ;(ambientNoise as ToneNs.Noise).volume.value = toDb(config.ambient.volume)
    ;(ambientNoise as ToneNs.Noise).connect(ambientFilter as ToneNs.Filter)
    ;(ambientNoise as ToneNs.Noise).start()
  }

  let noteIndex = 0

  const playNext = (): void => {
    if (!bgmEnabled.value || !bgmPlaying || myLoopId !== bgmLoopId) {
      if (myLoopId === bgmLoopId) {
        bgmPlaying = false
        currentBgmType.value = null
        cleanupBgm()
      }
      return
    }

    if (!melodySynth || !bassSynth) return

    const freq = config.melody[noteIndex % config.melody.length]!

    try {
      ;(melodySynth as ToneNs.Synth).volume.value = toDb(bgmVolume)
      if (freq > 0) {
        ;(melodySynth as ToneNs.Synth).triggerAttackRelease(freq, config.noteDur * 0.7)
      }

      const bassInterval = config.bassInterval ?? 4
      if (noteIndex % bassInterval === 0) {
        const bassIndex = Math.floor(noteIndex / bassInterval) % config.bass.length
        const bassFreq = config.bass[bassIndex]!
        if (bassFreq > 0) {
          ;(bassSynth as ToneNs.Synth).volume.value = toDb(bgmVolume * 0.4)
          ;(bassSynth as ToneNs.Synth).triggerAttackRelease(bassFreq, config.noteDur * 2.5)
        }
      }
    } catch {
      /* synth may be disposed */
    }

    noteIndex++
    setTimeout(playNext, config.noteDur * 1000)
  }

  playNext()
}

const stopBgm = (): void => {
  bgmPlaying = false
  cleanupBgm()
}

// ====== 页面可见性处理 ======
let bgmWasPlayingBeforeHidden = false
let bgmTypeBeforeHidden: BgmType | null = null

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    bgmWasPlayingBeforeHidden = bgmPlaying
    bgmTypeBeforeHidden = currentBgmType.value
    if (bgmPlaying) stopBgm()
  } else {
    if (bgmWasPlayingBeforeHidden && bgmEnabled.value && bgmTypeBeforeHidden) {
      void playBgmLoop(bgmTypeBeforeHidden)
    }
    bgmWasPlayingBeforeHidden = false
    bgmTypeBeforeHidden = null
  }
})

// ====== 导出 composable ======
export const useAudio = () => {
  const toggleSfx = (): void => {
    sfxEnabled.value = !sfxEnabled.value
    try {
      localStorage.setItem(STORAGE_KEY_SFX, String(sfxEnabled.value))
    } catch {
      // localStorage 不可用时忽略
    }
  }

  const toggleBgm = (): void => {
    bgmEnabled.value = !bgmEnabled.value
    try {
      localStorage.setItem(STORAGE_KEY_BGM, String(bgmEnabled.value))
    } catch {
      // localStorage 不可用时忽略
    }
    if (bgmEnabled.value) {
      void playBgmLoop('sect_main')
    } else {
      stopBgm()
    }
  }

  const startBgm = (): void => {
    if (bgmEnabled.value && !bgmPlaying) {
      void playBgmLoop('sect_main')
    }
  }

  const switchBgm = (type: BgmType): void => {
    if (bgmEnabled.value) {
      void playBgmLoop(type)
    }
  }

  const getBgmList = (): { type: BgmType; name: string; category: string }[] => {
    return [
      // 门派场景
      { type: 'sect_main', name: '门派主殿', category: '门派' },
      { type: 'sect_bamboo', name: '小竹峰', category: '门派' },
      { type: 'sect_peak', name: '云顶峰', category: '门派' },
      { type: 'sect_pavilion', name: '藏经阁', category: '门派' },
      // 四季场景
      { type: 'spring_rain', name: '春风细雨', category: '四季' },
      { type: 'summer_storm', name: '夏日雷电', category: '四季' },
      { type: 'autumn_wind', name: '秋风落叶', category: '四季' },
      { type: 'winter_snow', name: '冬日雪景', category: '四季' },
      // 战斗场景
      { type: 'battle_normal', name: '普通战斗', category: '战斗' },
      { type: 'battle_boss', name: 'Boss战', category: '战斗' },
      { type: 'battle_phase2', name: 'Boss二阶段', category: '战斗' },
      // 特殊场景
      { type: 'adventure', name: '历险探索', category: '特殊' },
      { type: 'shop', name: '坊市', category: '特殊' },
      { type: 'tribulation', name: '渡劫', category: '特殊' }
    ]
  }

  const startCultivationBgm = (): void => switchBgm('sect_bamboo')
  const startAdventureBgm = (): void => switchBgm('adventure')
  const startShopBgm = (): void => switchBgm('shop')
  const startBattleBgm = (): void => switchBgm('battle_normal')
  const startBossBgm = (): void => switchBgm('battle_boss')
  const startTribulationBgm = (): void => switchBgm('tribulation')

  return {
    sfxEnabled,
    bgmEnabled,
    currentBgmType,
    toggleSfx,
    toggleBgm,
    startBgm,
    stopBgm,
    switchBgm,
    getBgmList,
    startCultivationBgm,
    startAdventureBgm,
    startShopBgm,
    startBattleBgm,
    startBossBgm,
    startTribulationBgm
  }
}

// ====== 导出音效列表（用于测试页面）======
export const SFX_LIST: { name: string; fn: () => void; description: string; category: string }[] = [
  // 基础交互
  { name: 'sfxClick', fn: sfxClick, description: '玉磬清音', category: '基础' },
  { name: 'sfxItem', fn: sfxItem, description: '仙音缭绕', category: '基础' },
  { name: 'sfxError', fn: sfxError, description: '警钟', category: '基础' },
  { name: 'sfxLevelUp', fn: sfxLevelUp, description: '灵光乍现', category: '基础' },
  { name: 'sfxSpiritStone', fn: sfxSpiritStone, description: '玉珠落盘', category: '基础' },
  { name: 'sfxSkillUp', fn: sfxSkillUp, description: '功法升级', category: '基础' },
  // 修炼
  { name: 'sfxMeditate', fn: sfxMeditate, description: '灵气入体', category: '修炼' },
  { name: 'sfxBreakthrough', fn: sfxBreakthrough, description: '天地共鸣', category: '修炼' },
  { name: 'sfxAlchemy', fn: sfxAlchemy, description: '丹炉火起', category: '修炼' },
  { name: 'sfxRest', fn: sfxRest, description: '心如止水', category: '修炼' },
  // 武器
  { name: 'sfxSword', fn: sfxSword, description: '剑鸣', category: '武器' },
  { name: 'sfxBlade', fn: sfxBlade, description: '刀啸', category: '武器' },
  { name: 'sfxStaff', fn: sfxStaff, description: '棍风', category: '武器' },
  { name: 'sfxSpear', fn: sfxSpear, description: '枪出', category: '武器' },
  { name: 'sfxFan', fn: sfxFan, description: '扇风', category: '武器' },
  { name: 'sfxQin', fn: sfxQin, description: '琴音', category: '武器' },
  { name: 'sfxFlute', fn: sfxFlute, description: '笛声', category: '武器' },
  // 战斗
  { name: 'sfxAttack', fn: sfxAttack, description: '剑气激荡', category: '战斗' },
  { name: 'sfxHeavyAttack', fn: sfxHeavyAttack, description: '力劈华山', category: '战斗' },
  { name: 'sfxDodge', fn: sfxDodge, description: '身法灵动', category: '战斗' },
  { name: 'sfxBlock', fn: sfxBlock, description: '金铁交鸣', category: '战斗' },
  { name: 'sfxHurt', fn: sfxHurt, description: '气血翻涌', category: '战斗' },
  { name: 'sfxCritical', fn: sfxCritical, description: '命悬一线', category: '战斗' },
  { name: 'sfxDeath', fn: sfxDeath, description: '魂飞魄散', category: '战斗' },
  { name: 'sfxVictory', fn: sfxVictory, description: '正气浩然', category: '战斗' },
  { name: 'sfxDefeat', fn: sfxDefeat, description: '功亏一篑', category: '战斗' },
  { name: 'sfxEncounter', fn: sfxEncounter, description: '阴风阵阵', category: '战斗' },
  // 仙法
  { name: 'sfxCastPrepare', fn: sfxCastPrepare, description: '灵力汇聚', category: '仙法' },
  { name: 'sfxFire', fn: sfxFire, description: '烈焰焚天', category: '仙法' },
  { name: 'sfxWater', fn: sfxWater, description: '寒冰刺骨', category: '仙法' },
  { name: 'sfxThunder', fn: sfxThunder, description: '雷霆万钧', category: '仙法' },
  { name: 'sfxWind', fn: sfxWind, description: '狂风呼啸', category: '仙法' },
  { name: 'sfxEarth', fn: sfxEarth, description: '大地崩裂', category: '仙法' },
  { name: 'sfxWood', fn: sfxWood, description: '万物复苏', category: '仙法' },
  { name: 'sfxMagicClash', fn: sfxMagicClash, description: '灵力激荡', category: '仙法' },
  { name: 'sfxTalisman', fn: sfxTalisman, description: '符文闪动', category: '仙法' },
  { name: 'sfxFormation', fn: sfxFormation, description: '法阵流转', category: '仙法' },
  // 天气
  { name: 'sfxSpringRain', fn: sfxSpringRain, description: '春风细雨', category: '天气' },
  { name: 'sfxSummerStorm', fn: sfxSummerStorm, description: '夏日雷电', category: '天气' },
  { name: 'sfxAutumnWind', fn: sfxAutumnWind, description: '秋风落叶', category: '天气' },
  { name: 'sfxWinterWind', fn: sfxWinterWind, description: '冬日寒风', category: '天气' },
  { name: 'sfxSnow', fn: sfxSnow, description: '大雪纷飞', category: '天气' },
  // 特殊
  { name: 'sfxBossAppear', fn: sfxBossAppear, description: '威压降临', category: '特殊' },
  { name: 'sfxBossPhase2', fn: sfxBossPhase2, description: '真身显现', category: '特殊' },
  { name: 'sfxTribulation', fn: sfxTribulation, description: '天雷滚滚', category: '特殊' },
  { name: 'sfxDivine', fn: sfxDivine, description: '仙缘降临', category: '特殊' },
  { name: 'sfxDiscovery', fn: sfxDiscovery, description: '仙缘巧合', category: '特殊' }
]

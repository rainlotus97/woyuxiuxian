import { ref } from 'vue'
import type * as ToneNs from 'tone'

// ====== Tone.js 延迟加载 ======
type ToneModule = typeof ToneNs
let T: ToneModule | null = null
let toneStarted = false

const loadTone = async (): Promise<ToneModule> => {
  if (!T) {
    T = await import('tone')
  }
  return T
}

const ensureToneStarted = async (): Promise<ToneModule> => {
  const Tone = await loadTone()
  if (!toneStarted) {
    await Tone.start()
    toneStarted = true
  }
  return Tone
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
const bgmEnabled = ref(getStoredBoolean(STORAGE_KEY_BGM, false))
const sfxVolume = 0.35
const bgmVolume = 0.16

const toDb = (v: number): number => (v <= 0 ? -Infinity : 20 * Math.log10(v))

// ====== 高级音效播放器 ======
type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth'
type PolyVoiceKind = 'synth' | 'fm' | 'am'
type MonoVoiceKind = 'mono' | 'fm'

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
  if (!sfxEnabled.value || document.hidden) return

  // 自动初始化 Tone.js（用户交互后才能启动 AudioContext）
  if (!T) {
    void ensureToneStarted()
    // Tone.js 尚未初始化，跳过本次播放（用户需要再次点击）
    return
  }

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
  if (!sfxEnabled.value || document.hidden) return

  if (!T) {
    void ensureToneStarted()
    return
  }

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
  if (!sfxEnabled.value || document.hidden) return

  if (!T) {
    void ensureToneStarted()
    return
  }

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
  if (!sfxEnabled.value || document.hidden) return

  if (!T) {
    void ensureToneStarted()
    return
  }

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

/** 治疗回响 - 灵息回流 */
export const sfxHealPulse = (): void => {
  playChord([392, 523, 659], 0.26, 'sine', 0.12)
  setTimeout(() => playSfx({ freq: 784, duration: 0.24, type: 'triangle', vol: 0.08, attack: 0.02, release: 0.18 }), 120)
}

/** 护盾凝成 - 灵障成形 */
export const sfxShield = (): void => {
  playChord([220, 330, 440], 0.24, 'triangle', 0.12)
  setTimeout(() => playGlissando(420, 620, 0.18, 'sine', 0.08), 60)
}

/** 招架反震 - 金铁回响 */
export const sfxParry = (): void => {
  playSfx({ freq: 520, duration: 0.08, type: 'square', vol: 0.2, attack: 0.002, release: 0.08 })
  setTimeout(() => playSfx({ freq: 980, duration: 0.1, type: 'triangle', vol: 0.14, attack: 0.002, release: 0.1 }), 24)
}

/** 斩杀收束 - 杀意定音 */
export const sfxFinisher = (): void => {
  playGlissando(260, 120, 0.18, 'sawtooth', 0.18)
  setTimeout(() => playChord([131, 196, 262], 0.32, 'square', 0.14), 100)
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

/** 故事文本收束 - 纸页轻响 */
export const sfxStoryTextSettle = (): void => {
  playSfx({ freq: 784, duration: 0.08, type: 'triangle', vol: 0.06, attack: 0.01, release: 0.1 })
  setTimeout(() => playSfx({ freq: 988, duration: 0.06, type: 'sine', vol: 0.04, attack: 0.01, release: 0.08 }), 40)
}

/** 对话切换 - 玉片轻触 */
export const sfxStoryDialog = (): void => {
  playSfx({ freq: 659, duration: 0.06, type: 'triangle', vol: 0.07, attack: 0.005, release: 0.08 })
}

/** 选项确认 - 定局 */
export const sfxStoryChoice = (): void => {
  playChord([523, 659], 0.12, 'sine', 0.07)
  setTimeout(() => playSfx({ freq: 784, duration: 0.12, type: 'triangle', vol: 0.05, release: 0.14 }), 60)
}

/** 回忆闪回 - 往事回潮 */
export const sfxMemoryFlash = (): void => {
  playGlissando(440, 880, 0.22, 'sine', 0.08)
  setTimeout(() => playChord([659, 784, 988], 0.3, 'sine', 0.06), 120)
}

/** 梦境涌现 - 幻雾轻旋 */
export const sfxDream = (): void => {
  playChord([392, 523, 784], 0.55, 'sine', 0.08)
  setTimeout(() => playGlissando(523, 660, 0.4, 'triangle', 0.05), 200)
}

/** 结界展开 - 灵壁铺开 */
export const sfxBarrier = (): void => {
  playChord([262, 392, 523], 0.38, 'triangle', 0.12)
  setTimeout(() => playNoise(0.4, 'white', 0.03, 2200), 40)
}

/** 符箓爆裂 - 灵纹炸开 */
export const sfxTalismanBurst = (): void => {
  sfxTalisman()
  setTimeout(() => playChord([523, 659, 880], 0.18, 'square', 0.14), 140)
}

/** 心碎/诀别 - 弦断 */
export const sfxHeartbreak = (): void => {
  playSfx({ freq: 659, duration: 0.12, type: 'triangle', vol: 0.08, release: 0.16 })
  setTimeout(() => playGlissando(523, 180, 0.4, 'sine', 0.1), 80)
}

/** 传送跃迁 - 阵光转移 */
export const sfxTeleport = (): void => {
  playGlissando(260, 1040, 0.16, 'sine', 0.12)
  setTimeout(() => playChord([784, 1047, 1319], 0.18, 'triangle', 0.1), 120)
}

/** 秘境开门 - 石门启封 */
export const sfxRealmGate = (): void => {
  playSfx({ freq: 90, duration: 0.45, type: 'sawtooth', vol: 0.16, attack: 0.08, release: 0.3 })
  setTimeout(() => playChord([196, 262, 330], 0.32, 'square', 0.12), 220)
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
  | 'moonlit_bamboo' // 月下竹海 - 夜修清寒
  | 'celestial_palace' // 天游仙阙 - 威仪庄重
  | 'jade_hall'      // 玉阙晨钟
  | 'spirit_orchard' // 灵田春晓
  | 'library_embers' // 残卷烛影
  // 四季场景
  | 'spring_rain'    // 春风细雨
  | 'summer_storm'   // 夏日雷电
  | 'autumn_wind'    // 秋风落叶
  | 'winter_snow'    // 冬日雪景
  | 'plum_blossom_snow' // 梅雪将融
  | 'lotus_night'    // 荷灯夜泊
  // 战斗场景
  | 'battle_normal'  // 普通战斗
  | 'battle_boss'    // Boss战斗
  | 'battle_phase2'  // Boss二阶段
  | 'battle_raid'    // 群魔围攻
  | 'duel_blade'     // 双锋对决
  | 'chase_drums'    // 逐杀鼓点
  // 特殊场景
  | 'adventure'      // 历险探索
  | 'story'          // 剧情卷宗
  | 'shop'           // 坊市
  | 'ancient_ruins'  // 上古遗迹
  | 'tribulation'    // 渡劫
  | 'warm_hearth'    // 灯下温酒
  | 'sworn_bond'     // 同行誓约
  | 'peach_blossom'  // 桃夭旧梦
  | 'broken_vow'     // 誓裂
  | 'grief_abyss'    // 深渊哀歌
  | 'funeral_wind'   // 纸灰风灯
  | 'empty_city'     // 空城无声
  | 'suspense_steps' // 暗阶轻步
  | 'mirror_dream'   // 镜梦
  | 'star_ritual'    // 星坛秘祭
  | 'mechanical_pulse' // 机关脉冲
  | 'neon_alchemy'   // 霓火炼丹
  | 'river_qin'      // 高山流水
  | 'bamboo_flute'   // 竹溪远笛
  | 'desert_bells'   // 荒漠驼铃
  | 'festival_lantern' // 灯市流光
  | 'dawn_return'    // 破晓归山
  | 'night_patrol'   // 巡夜
  | 'blood_moon'     // 血月
  | 'memory_shards'  // 记忆碎片
  | 'storm_siege'    // 风雷围城
  | 'void_signal'    // 虚空讯号
  | 'crystal_cavern' // 晶窟回响

const currentBgmType = ref<BgmType | null>(null)

// ============================================================
//                    BGM 旋律配置
// ============================================================

interface BgmConfig {
  name: string
  tempo: number
  subdivision: string
  swing?: number
  swingSubdivision?: string
  melody: Array<string | string[] | null>
  melodyDurations?: string[]
  harmony?: Array<string | string[] | null>
  harmonyDurations?: string[]
  bass: Array<string | null>
  bassDurations?: string[]
  accent?: Array<string | null>
  accentDurations?: string[]
  melodyWave: WaveType
  bassWave: WaveType
  harmonyWave?: WaveType
  accentWave?: WaveType
  melodyVoice?: PolyVoiceKind
  harmonyVoice?: PolyVoiceKind
  bassVoice?: MonoVoiceKind
  accentVoice?: PolyVoiceKind
  melodyVolume?: number
  harmonyVolume?: number
  bassVolume?: number
  accentVolume?: number
  filterFreq?: number
  filterQ?: number
  reverbWet?: number
  reverbRoomSize?: number
  reverbDampening?: number
  outputGain?: number
  melodyEnvelope?: { attack: number; decay: number; sustain: number; release: number }
  harmonyEnvelope?: { attack: number; decay: number; sustain: number; release: number }
  bassEnvelope?: { attack: number; decay: number; sustain: number; release: number }
  accentEnvelope?: { attack: number; decay: number; sustain: number; release: number }
  ambient?: {
    type: 'white' | 'pink' | 'brown'
    volume: number
    filterFreq: number
  }
}

function resolvePatternDuration(durations: string[] | undefined, index: number, fallback: string) {
  if (!durations?.length) return fallback
  return durations[index % durations.length] ?? fallback
}

const BGM_CONFIG: Record<BgmType, BgmConfig> = {
  sect_main: {
    name: '门派主殿',
    tempo: 74,
    subdivision: '8n',
    melody: [
      'G4', null, 'A4', null, 'C5', null, 'D5', null,
      'C5', null, 'A4', null, 'G4', null, 'D4', null
    ],
    harmony: [
      ['D4', 'G4'], null, ['E4', 'A4'], null, ['G4', 'C5'], null, ['A4', 'D5'], null,
      ['G4', 'C5'], null, ['E4', 'A4'], null, ['D4', 'G4'], null, ['C4', 'F4'], null
    ],
    bass: ['G2', null, null, 'D3', null, null, 'A2', null],
    accent: ['D5', null, null, null, null, null, 'A4', null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVolume: 0.11,
    harmonyVolume: 0.06,
    bassVolume: 0.05,
    melodyEnvelope: { attack: 0.08, decay: 0.22, sustain: 0.2, release: 0.42 },
    harmonyEnvelope: { attack: 0.14, decay: 0.18, sustain: 0.16, release: 0.6 },
    bassEnvelope: { attack: 0.02, decay: 0.28, sustain: 0.16, release: 0.5 },
    accentEnvelope: { attack: 0.01, decay: 0.16, sustain: 0.04, release: 0.18 }
  },

  sect_bamboo: {
    name: '小竹峰',
    tempo: 58,
    subdivision: '8n',
    swing: 0.08,
    swingSubdivision: '8n',
    melody: [
      'D4', null, 'F#4', 'A4', 'B4', 'A4', 'F#4', 'E4',
      'D4', null, 'E4', 'F#4', 'A4', 'B4', 'A4', 'F#4',
      'G4', null, 'A4', 'B4', 'D5', 'B4', 'A4', 'F#4',
      'E4', null, 'F#4', 'G4', 'A4', 'F#4', 'E4', 'D4'
    ],
    melodyDurations: ['4n', '8n', '8n', '8n', '4n', '8n', '8n', '8n'],
    harmony: [
      ['D3', 'A3', 'D4'], null, ['F#3', 'A3', 'D4'], null, ['G3', 'B3', 'D4'], null, ['A3', 'D4', 'F#4'], null,
      ['D3', 'A3', 'D4'], null, ['E3', 'A3', 'C#4'], null, ['F#3', 'A3', 'D4'], null, ['A3', 'D4', 'F#4'], null,
      ['G3', 'B3', 'D4'], null, ['A3', 'D4', 'F#4'], null, ['B3', 'D4', 'G4'], null, ['A3', 'D4', 'F#4'], null,
      ['E3', 'A3', 'C#4'], null, ['G3', 'B3', 'D4'], null, ['A3', 'D4', 'F#4'], null, ['D3', 'A3', 'D4'], null
    ],
    harmonyDurations: ['2n', '2n', '2n', '2n', '2n', '2n', '2n', '2n'],
    bass: ['D2', null, 'A1', null, 'G1', null, 'A1', null, 'E2', null, 'B1', null, 'G1', null, 'D2', null],
    bassDurations: ['2n.', '2n', '2n.', '2n', '2n.', '2n', '2n.', '2n'],
    accent: [null, 'A5', null, null, null, 'D6', null, null, null, 'A5', null, null, 'G5', null, null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    melodyVolume: 0.098,
    harmonyVolume: 0.052,
    bassVolume: 0.04,
    accentVolume: 0.032,
    filterFreq: 2800,
    filterQ: 0.68,
    reverbWet: 0.24,
    reverbRoomSize: 0.9,
    reverbDampening: 1800,
    outputGain: 0.88,
    melodyEnvelope: { attack: 0.1, decay: 0.12, sustain: 0.09, release: 0.82 },
    harmonyEnvelope: { attack: 0.24, decay: 0.1, sustain: 0.05, release: 1.12 },
    bassEnvelope: { attack: 0.08, decay: 0.16, sustain: 0.09, release: 0.64 },
    accentEnvelope: { attack: 0.04, decay: 0.08, sustain: 0.02, release: 0.26 },
    ambient: { type: 'brown', volume: 0.005, filterFreq: 920 }
  },

  sect_peak: {
    name: '云顶峰',
    tempo: 68,
    subdivision: '8n',
    melody: [
      'E5', null, 'G5', null, 'A5', null, 'G5', null,
      'E5', null, 'D5', null, 'C5', null, 'D5', null
    ],
    harmony: [
      ['B4', 'E5'], null, ['D5', 'G5'], null, ['E5', 'A5'], null, ['D5', 'G5'], null,
      ['B4', 'E5'], null, ['A4', 'D5'], null, ['G4', 'C5'], null, ['A4', 'D5'], null
    ],
    bass: ['E3', null, null, 'B2', null, null, 'A2', null],
    accent: ['E6', null, null, null, 'D6', null, null, null],
    melodyWave: 'sine',
    bassWave: 'triangle',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVolume: 0.09,
    harmonyVolume: 0.05,
    bassVolume: 0.03,
    melodyEnvelope: { attack: 0.16, decay: 0.18, sustain: 0.16, release: 0.55 },
    harmonyEnvelope: { attack: 0.2, decay: 0.16, sustain: 0.1, release: 0.72 },
    bassEnvelope: { attack: 0.05, decay: 0.22, sustain: 0.08, release: 0.6 },
    accentEnvelope: { attack: 0.03, decay: 0.12, sustain: 0.04, release: 0.26 },
    ambient: { type: 'white', volume: 0.006, filterFreq: 4200 }
  },

  sect_pavilion: {
    name: '藏经阁',
    tempo: 62,
    subdivision: '8n',
    melody: [
      'E4', null, 'G4', null, 'E4', null, 'D4', null,
      'C4', null, 'D4', null, 'E4', null, 'G4', null
    ],
    harmony: [
      ['B3', 'E4'], null, ['D4', 'G4'], null, ['B3', 'E4'], null, ['A3', 'D4'], null,
      ['G3', 'C4'], null, ['A3', 'D4'], null, ['B3', 'E4'], null, ['D4', 'G4'], null
    ],
    bass: ['E2', null, 'G2', null, 'D2', null, 'C2', null],
    accent: [null, 'E5', null, null, null, 'D5', null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVolume: 0.095,
    harmonyVolume: 0.052,
    bassVolume: 0.04,
    melodyEnvelope: { attack: 0.04, decay: 0.26, sustain: 0.18, release: 0.36 },
    harmonyEnvelope: { attack: 0.12, decay: 0.24, sustain: 0.16, release: 0.58 },
    bassEnvelope: { attack: 0.02, decay: 0.28, sustain: 0.12, release: 0.45 },
    accentEnvelope: { attack: 0.01, decay: 0.12, sustain: 0.04, release: 0.2 }
  },

  moonlit_bamboo: {
    name: '月下竹海',
    tempo: 52,
    subdivision: '4n',
    melody: [
      'D5', null, 'A4', null, 'G4', null, 'A4', null,
      'C5', null, 'A4', null, 'E4', null, 'G4', null
    ],
    harmony: [
      ['A4', 'D5'], null, ['E4', 'A4'], null, ['D4', 'G4'], null, ['E4', 'A4'], null,
      ['G4', 'C5'], null, ['E4', 'A4'], null, ['C4', 'E4'], null, ['D4', 'G4'], null
    ],
    bass: ['D2', null, 'A2', null, 'G2', null, 'A2', null],
    accent: [null, 'D6', null, null, null, 'A5', null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    melodyVolume: 0.075,
    harmonyVolume: 0.044,
    bassVolume: 0.026,
    melodyEnvelope: { attack: 0.22, decay: 0.12, sustain: 0.08, release: 0.88 },
    harmonyEnvelope: { attack: 0.28, decay: 0.08, sustain: 0.05, release: 1.02 },
    bassEnvelope: { attack: 0.16, decay: 0.14, sustain: 0.05, release: 0.92 },
    accentEnvelope: { attack: 0.06, decay: 0.08, sustain: 0.02, release: 0.26 },
    ambient: { type: 'brown', volume: 0.01, filterFreq: 720 }
  },

  celestial_palace: {
    name: '天游仙阙',
    tempo: 76,
    subdivision: '8n',
    melody: [
      'C5', null, 'E5', null, 'G5', null, 'A5', null,
      'G5', null, 'E5', null, 'D5', null, 'C5', null
    ],
    harmony: [
      ['G4', 'C5'], null, ['B4', 'E5'], null, ['D5', 'G5'], null, ['E5', 'A5'], null,
      ['D5', 'G5'], null, ['B4', 'E5'], null, ['A4', 'D5'], null, ['G4', 'C5'], null
    ],
    bass: ['C3', null, null, 'G2', null, null, 'A2', null],
    accent: ['C6', null, null, null, 'G5', null, 'A5', null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVoice: 'am',
    harmonyVoice: 'fm',
    accentVoice: 'fm',
    melodyVolume: 0.1,
    harmonyVolume: 0.058,
    bassVolume: 0.038,
    melodyEnvelope: { attack: 0.1, decay: 0.18, sustain: 0.14, release: 0.52 },
    harmonyEnvelope: { attack: 0.16, decay: 0.16, sustain: 0.1, release: 0.68 },
    bassEnvelope: { attack: 0.04, decay: 0.22, sustain: 0.1, release: 0.48 },
    accentEnvelope: { attack: 0.02, decay: 0.1, sustain: 0.02, release: 0.18 },
    ambient: { type: 'pink', volume: 0.005, filterFreq: 1700 }
  },

  jade_hall: {
    name: '玉阙晨钟',
    tempo: 80,
    subdivision: '8n',
    melody: [
      'D5', null, 'F5', null, 'A5', null, 'F5', null,
      'D5', null, 'E5', null, 'G5', null, 'A5', null
    ],
    harmony: [
      ['A4', 'D5'], null, ['C5', 'F5'], null, ['E5', 'A5'], null, ['C5', 'F5'], null,
      ['A4', 'D5'], null, ['B4', 'E5'], null, ['D5', 'G5'], null, ['E5', 'A5'], null
    ],
    bass: ['D3', null, null, 'A2', null, null, 'G2', null],
    accent: ['D6', null, null, null, 'A5', null, null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVoice: 'am',
    harmonyVoice: 'fm',
    melodyVolume: 0.1,
    harmonyVolume: 0.056,
    bassVolume: 0.034,
    melodyEnvelope: { attack: 0.08, decay: 0.18, sustain: 0.14, release: 0.46 },
    harmonyEnvelope: { attack: 0.16, decay: 0.14, sustain: 0.08, release: 0.62 },
    bassEnvelope: { attack: 0.04, decay: 0.2, sustain: 0.1, release: 0.44 },
    accentEnvelope: { attack: 0.02, decay: 0.08, sustain: 0.02, release: 0.16 }
  },

  spirit_orchard: {
    name: '灵田春晓',
    tempo: 74,
    subdivision: '8n',
    melody: [
      'G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'G4', null,
      'E4', 'G4', 'A4', 'B4', 'A4', 'G4', 'E4', null
    ],
    harmony: [
      ['D4', 'G4'], null, ['E4', 'A4'], null, ['G4', 'B4'], null, ['E4', 'A4'], null,
      ['C4', 'E4'], null, ['D4', 'G4'], null, ['E4', 'A4'], null, ['C4', 'E4'], null
    ],
    bass: ['G2', null, 'D3', null, 'E2', null, 'C3', null],
    accent: [null, 'D5', null, null, null, 'B4', null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVolume: 0.086,
    harmonyVolume: 0.048,
    bassVolume: 0.03,
    melodyEnvelope: { attack: 0.04, decay: 0.16, sustain: 0.1, release: 0.24 },
    harmonyEnvelope: { attack: 0.08, decay: 0.14, sustain: 0.08, release: 0.34 },
    bassEnvelope: { attack: 0.04, decay: 0.18, sustain: 0.1, release: 0.28 },
    accentEnvelope: { attack: 0.01, decay: 0.08, sustain: 0.02, release: 0.14 },
    ambient: { type: 'pink', volume: 0.01, filterFreq: 1800 }
  },

  library_embers: {
    name: '残卷烛影',
    tempo: 54,
    subdivision: '4n',
    melody: [
      'E4', null, 'G4', null, 'B4', null, 'A4', null,
      'G4', null, 'E4', null, 'D4', null, 'E4', null
    ],
    harmony: [
      ['B3', 'E4'], null, ['D4', 'G4'], null, ['G4', 'B4'], null, ['E4', 'A4'], null,
      ['D4', 'G4'], null, ['B3', 'E4'], null, ['A3', 'D4'], null, ['B3', 'E4'], null
    ],
    bass: ['E2', null, 'B1', null, 'A1', null, 'D2', null],
    accent: [null, null, 'E5', null, null, null, 'D5', null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    melodyVolume: 0.078,
    harmonyVolume: 0.044,
    bassVolume: 0.028,
    melodyEnvelope: { attack: 0.18, decay: 0.12, sustain: 0.08, release: 0.78 },
    harmonyEnvelope: { attack: 0.22, decay: 0.1, sustain: 0.05, release: 0.92 },
    bassEnvelope: { attack: 0.08, decay: 0.16, sustain: 0.08, release: 0.64 },
    accentEnvelope: { attack: 0.03, decay: 0.08, sustain: 0.02, release: 0.18 },
    ambient: { type: 'brown', volume: 0.008, filterFreq: 760 }
  },

  spring_rain: {
    name: '春风细雨',
    tempo: 72,
    subdivision: '8n',
    melody: [
      'A4', 'C5', 'A4', 'G4', 'A4', 'C5', 'D5', 'C5',
      'A4', 'G4', 'E4', 'G4', 'A4', null, 'G4', null
    ],
    harmony: [
      ['E4', 'A4'], null, ['E4', 'A4'], null, ['E4', 'A4'], null, ['G4', 'D5'], null,
      ['E4', 'A4'], null, ['C4', 'E4'], null, ['E4', 'A4'], null, ['D4', 'G4'], null
    ],
    bass: ['A2', null, 'C3', null, 'D3', null, 'G2', null],
    accent: [null, 'E5', null, null, null, null, 'D5', null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVolume: 0.08,
    harmonyVolume: 0.05,
    bassVolume: 0.03,
    melodyEnvelope: { attack: 0.03, decay: 0.14, sustain: 0.08, release: 0.2 },
    harmonyEnvelope: { attack: 0.08, decay: 0.14, sustain: 0.08, release: 0.28 },
    bassEnvelope: { attack: 0.04, decay: 0.18, sustain: 0.1, release: 0.3 },
    accentEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.02, release: 0.14 },
    ambient: { type: 'pink', volume: 0.012, filterFreq: 2000 }
  },

  summer_storm: {
    name: '夏日雷电',
    tempo: 84,
    subdivision: '8n',
    melody: [
      'G3', null, 'A3', null, 'C4', null, 'A3', null,
      'G3', null, 'F3', null, 'G3', null, null, 'D4'
    ],
    harmony: [
      ['D3', 'G3'], null, ['E3', 'A3'], null, ['G3', 'C4'], null, ['E3', 'A3'], null,
      ['D3', 'G3'], null, ['C3', 'F3'], null, ['D3', 'G3'], null, null, ['A3', 'D4']
    ],
    bass: ['G1', null, 'A1', null, 'C2', null, 'A1', null],
    accent: ['D5', null, null, null, null, null, 'C5', null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sawtooth',
    accentWave: 'square',
    melodyVolume: 0.085,
    harmonyVolume: 0.05,
    bassVolume: 0.045,
    melodyEnvelope: { attack: 0.04, decay: 0.18, sustain: 0.14, release: 0.24 },
    harmonyEnvelope: { attack: 0.02, decay: 0.18, sustain: 0.08, release: 0.22 },
    bassEnvelope: { attack: 0.02, decay: 0.2, sustain: 0.14, release: 0.36 },
    accentEnvelope: { attack: 0.001, decay: 0.08, sustain: 0.02, release: 0.12 },
    ambient: { type: 'white', volume: 0.025, filterFreq: 2000 }
  },

  autumn_wind: {
    name: '秋风落叶',
    tempo: 58,
    subdivision: '4n',
    melody: [
      'G4', null, 'E4', null, 'D4', null, 'C4', null,
      'A3', null, 'C4', null, 'D4', null, 'E4', null
    ],
    harmony: [
      ['D4', 'G4'], null, ['C4', 'E4'], null, ['A3', 'D4'], null, ['G3', 'C4'], null,
      ['E3', 'A3'], null, ['G3', 'C4'], null, ['A3', 'D4'], null, ['C4', 'E4'], null
    ],
    bass: ['G2', null, 'E2', null, 'D2', null, 'C2', null],
    accent: [null, null, 'D5', null, null, null, 'C5', null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVolume: 0.08,
    harmonyVolume: 0.045,
    bassVolume: 0.03,
    melodyEnvelope: { attack: 0.08, decay: 0.22, sustain: 0.16, release: 0.46 },
    harmonyEnvelope: { attack: 0.12, decay: 0.18, sustain: 0.08, release: 0.52 },
    bassEnvelope: { attack: 0.04, decay: 0.24, sustain: 0.08, release: 0.5 },
    accentEnvelope: { attack: 0.01, decay: 0.08, sustain: 0.02, release: 0.14 },
    ambient: { type: 'brown', volume: 0.03, filterFreq: 600 }
  },

  winter_snow: {
    name: '冬日雪景',
    tempo: 50,
    subdivision: '2n',
    melody: [
      'G5', null, 'E5', null, 'C5', null, 'E5', null,
      'D5', null, 'A4', null, 'G4', null, null, null
    ],
    harmony: [
      ['D5', 'G5'], null, ['B4', 'E5'], null, ['G4', 'C5'], null, ['B4', 'E5'], null,
      ['A4', 'D5'], null, ['E4', 'A4'], null, ['D4', 'G4'], null, null, null
    ],
    bass: ['G2', null, 'E2', null, 'C2', null, 'D2', null],
    accent: [null, 'G6', null, null, null, 'E6', null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVolume: 0.07,
    harmonyVolume: 0.045,
    bassVolume: 0.025,
    melodyEnvelope: { attack: 0.22, decay: 0.14, sustain: 0.08, release: 0.82 },
    harmonyEnvelope: { attack: 0.28, decay: 0.1, sustain: 0.05, release: 0.95 },
    bassEnvelope: { attack: 0.12, decay: 0.14, sustain: 0.06, release: 0.85 },
    accentEnvelope: { attack: 0.03, decay: 0.08, sustain: 0.02, release: 0.2 },
    ambient: { type: 'white', volume: 0.008, filterFreq: 5000 }
  },

  plum_blossom_snow: {
    name: '梅雪将融',
    tempo: 46,
    subdivision: '2n',
    melody: [
      'D5', null, 'A4', null, 'F4', null, 'A4', null,
      'C5', null, 'A4', null, 'D5', null, null, null
    ],
    harmony: [
      ['A4', 'D5'], null, ['F4', 'A4'], null, ['D4', 'F4'], null, ['F4', 'A4'], null,
      ['G4', 'C5'], null, ['E4', 'A4'], null, ['A4', 'D5'], null, null, null
    ],
    bass: ['D2', null, 'A1', null, 'F2', null, 'G2', null],
    accent: [null, 'D6', null, null, null, 'C6', null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVolume: 0.068,
    harmonyVolume: 0.042,
    bassVolume: 0.024,
    melodyEnvelope: { attack: 0.26, decay: 0.1, sustain: 0.06, release: 0.96 },
    harmonyEnvelope: { attack: 0.3, decay: 0.08, sustain: 0.04, release: 1.1 },
    bassEnvelope: { attack: 0.14, decay: 0.12, sustain: 0.04, release: 0.96 },
    accentEnvelope: { attack: 0.04, decay: 0.06, sustain: 0.02, release: 0.2 },
    ambient: { type: 'white', volume: 0.006, filterFreq: 5400 }
  },

  lotus_night: {
    name: '荷灯夜泊',
    tempo: 70,
    subdivision: '8n',
    melody: [
      'A4', null, 'C5', null, 'E5', null, 'D5', null,
      'C5', null, 'A4', null, 'G4', null, 'A4', null
    ],
    harmony: [
      ['E4', 'A4'], null, ['G4', 'C5'], null, ['B4', 'E5'], null, ['A4', 'D5'], null,
      ['G4', 'C5'], null, ['E4', 'A4'], null, ['D4', 'G4'], null, ['E4', 'A4'], null
    ],
    bass: ['A2', null, null, 'E2', null, null, 'D2', null],
    accent: [null, null, 'E6', null, null, 'D6', null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'am',
    harmonyVoice: 'fm',
    melodyVolume: 0.082,
    harmonyVolume: 0.048,
    bassVolume: 0.028,
    melodyEnvelope: { attack: 0.1, decay: 0.16, sustain: 0.1, release: 0.48 },
    harmonyEnvelope: { attack: 0.18, decay: 0.14, sustain: 0.08, release: 0.66 },
    bassEnvelope: { attack: 0.08, decay: 0.16, sustain: 0.08, release: 0.46 },
    accentEnvelope: { attack: 0.03, decay: 0.08, sustain: 0.02, release: 0.16 },
    ambient: { type: 'pink', volume: 0.008, filterFreq: 1500 }
  },

  battle_normal: {
    name: '战斗',
    tempo: 108,
    subdivision: '16n',
    swing: 0.02,
    swingSubdivision: '16n',
    melody: [
      'E4', null, 'G4', 'A4', 'B4', 'A4', 'G4', 'E4',
      'D4', 'E4', 'G4', 'A4', 'B4', 'A4', 'G4', 'D4',
      'E4', null, 'G4', 'B4', 'D5', 'B4', 'A4', 'G4',
      'A4', 'G4', 'E4', 'D4', 'B3', 'D4', 'E4', null
    ],
    harmony: [
      ['E3', 'B3'], null, ['G3', 'B3'], null, ['A3', 'D4'], null, ['G3', 'B3'], null,
      ['D3', 'A3'], null, ['E3', 'B3'], null, ['G3', 'D4'], null, ['A3', 'D4'], null,
      ['E3', 'B3'], null, ['G3', 'B3'], null, ['B3', 'E4'], null, ['A3', 'D4'], null,
      ['G3', 'D4'], null, ['A3', 'D4'], null, ['E3', 'B3'], null, ['D3', 'A3'], null
    ],
    bass: [
      'E2', null, 'B1', null, 'A1', null, 'G1', null,
      'D2', null, 'A1', null, 'E2', null, 'G1', null
    ],
    accent: [
      null, 'E5', null, null, 'B5', null, null, null,
      null, 'A5', null, null, 'D6', null, null, null
    ],
    melodyWave: 'triangle',
    bassWave: 'sawtooth',
    harmonyWave: 'square',
    accentWave: 'square',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    accentVoice: 'fm',
    melodyVolume: 0.098,
    harmonyVolume: 0.044,
    bassVolume: 0.074,
    accentVolume: 0.042,
    filterFreq: 5100,
    filterQ: 0.52,
    reverbWet: 0.08,
    reverbRoomSize: 0.54,
    reverbDampening: 3200,
    outputGain: 0.94,
    melodyEnvelope: { attack: 0.003, decay: 0.12, sustain: 0.07, release: 0.16 },
    harmonyEnvelope: { attack: 0.002, decay: 0.09, sustain: 0.03, release: 0.12 },
    bassEnvelope: { attack: 0.002, decay: 0.15, sustain: 0.16, release: 0.22 },
    accentEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.02, release: 0.08 }
  },

  battle_boss: {
    name: 'Boss战',
    tempo: 96,
    subdivision: '16n',
    melody: [
      'G3', 'G3', 'C4', 'G3', 'E4', 'C4', 'G3', 'F3',
      'A3', 'A3', 'D4', 'A3', 'F4', 'D4', 'A3', 'G3'
    ],
    harmony: [
      ['D3', 'G3'], null, ['G3', 'C4'], null, ['C4', 'E4'], null, ['D3', 'G3'], null,
      ['E3', 'A3'], null, ['A3', 'D4'], null, ['D4', 'F4'], null, ['E3', 'A3'], null
    ],
    bass: ['G1', null, 'G1', null, 'A1', null, 'A1', null],
    accent: ['D5', null, null, null, 'F5', null, null, null],
    melodyWave: 'sawtooth',
    bassWave: 'square',
    harmonyWave: 'square',
    accentWave: 'triangle',
    melodyVolume: 0.12,
    harmonyVolume: 0.06,
    bassVolume: 0.08,
    melodyEnvelope: { attack: 0.001, decay: 0.09, sustain: 0.08, release: 0.12 },
    harmonyEnvelope: { attack: 0.001, decay: 0.06, sustain: 0.04, release: 0.08 },
    bassEnvelope: { attack: 0.001, decay: 0.12, sustain: 0.12, release: 0.16 },
    accentEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.02, release: 0.08 }
  },

  battle_phase2: {
    name: 'Boss二阶段',
    tempo: 132,
    subdivision: '16n',
    melody: [
      'C4', 'E4', 'C4', 'G4', 'C4', 'A4', 'G4', 'E4',
      'D4', 'F4', 'D4', 'A4', 'D4', 'C5', 'A4', 'F4'
    ],
    harmony: [
      ['G3', 'C4'], null, ['G3', 'C4'], null, ['A3', 'E4'], null, ['G3', 'D4'], null,
      ['A3', 'D4'], null, ['A3', 'D4'], null, ['C4', 'G4'], null, ['A3', 'F4'], null
    ],
    bass: ['C2', 'C2', 'C2', 'C2', 'D2', 'D2', 'A1', 'A1'],
    accent: [null, 'G5', null, 'A5', null, 'C6', null, 'A5'],
    melodyWave: 'sawtooth',
    bassWave: 'square',
    harmonyWave: 'square',
    accentWave: 'triangle',
    melodyVolume: 0.13,
    harmonyVolume: 0.065,
    bassVolume: 0.085,
    melodyEnvelope: { attack: 0.001, decay: 0.07, sustain: 0.06, release: 0.1 },
    harmonyEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.03, release: 0.07 },
    bassEnvelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.12 },
    accentEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.02, release: 0.08 }
  },

  battle_raid: {
    name: '群魔围攻',
    tempo: 144,
    subdivision: '16n',
    melody: [
      'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'E4', 'A4',
      'E4', 'G4', 'A4', 'C5', 'A4', 'G4', 'E4', 'D4'
    ],
    harmony: [
      ['B3', 'E4'], null, ['D4', 'G4'], null, ['E4', 'A4'], null, ['D4', 'G4'], null,
      ['B3', 'E4'], null, ['D4', 'G4'], null, ['E4', 'A4'], null, ['C4', 'F4'], null
    ],
    bass: ['E2', 'E2', null, 'D2', 'A1', 'A1', null, 'G1'],
    accent: [null, 'E5', null, 'A5', null, 'G5', null, 'C6'],
    melodyWave: 'sawtooth',
    bassWave: 'square',
    harmonyWave: 'square',
    accentWave: 'triangle',
    melodyVolume: 0.125,
    harmonyVolume: 0.06,
    bassVolume: 0.082,
    melodyEnvelope: { attack: 0.001, decay: 0.06, sustain: 0.05, release: 0.08 },
    harmonyEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.03, release: 0.06 },
    bassEnvelope: { attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.1 },
    accentEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.02, release: 0.06 }
  },

  duel_blade: {
    name: '双锋对决',
    tempo: 122,
    subdivision: '16n',
    swing: 0,
    swingSubdivision: '16n',
    melody: [
      'E4', 'G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'G4',
      'E4', 'G4', 'B4', 'D5', 'E5', 'D5', 'B4', 'G4',
      'D4', 'F4', 'G4', 'A4', 'C5', 'A4', 'G4', 'F4',
      'E4', 'G4', 'A4', 'B4', 'A4', 'G4', 'E4', 'B3'
    ],
    harmony: [
      ['E3', 'B3'], null, ['G3', 'B3'], null, ['A3', 'D4'], null, ['G3', 'B3'], null,
      ['E3', 'B3'], null, ['B3', 'E4'], null, ['A3', 'D4'], null, ['G3', 'B3'], null,
      ['D3', 'A3'], null, ['F3', 'A3'], null, ['G3', 'C4'], null, ['F3', 'A3'], null,
      ['E3', 'B3'], null, ['G3', 'B3'], null, ['A3', 'D4'], null, ['E3', 'B3'], null
    ],
    bass: [
      'E2', null, 'B1', null, 'D2', null, 'G1', null,
      'E2', null, 'B1', null, 'A1', null, 'G1', null
    ],
    accent: [
      null, 'E5', null, null, 'D6', null, null, null,
      null, 'E6', null, null, 'C6', null, null, 'A5'
    ],
    melodyWave: 'triangle',
    bassWave: 'square',
    harmonyWave: 'square',
    accentWave: 'triangle',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    accentVoice: 'fm',
    melodyVolume: 0.102,
    harmonyVolume: 0.048,
    bassVolume: 0.08,
    accentVolume: 0.038,
    filterFreq: 4300,
    filterQ: 0.9,
    reverbWet: 0.06,
    reverbRoomSize: 0.38,
    reverbDampening: 3600,
    outputGain: 0.91,
    melodyEnvelope: { attack: 0.001, decay: 0.056, sustain: 0.044, release: 0.076 },
    harmonyEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.03, release: 0.06 },
    bassEnvelope: { attack: 0.001, decay: 0.1, sustain: 0.13, release: 0.1 },
    accentEnvelope: { attack: 0.001, decay: 0.032, sustain: 0.02, release: 0.054 }
  },

  chase_drums: {
    name: '逐杀鼓点',
    tempo: 152,
    subdivision: '16n',
    melody: [
      'C4', null, 'C4', 'D4', 'E4', null, 'E4', 'G4',
      'A4', null, 'A4', 'G4', 'E4', null, 'D4', 'C4'
    ],
    harmony: [
      ['G3', 'C4'], null, null, null, ['A3', 'D4'], null, null, null,
      ['C4', 'E4'], null, null, null, ['A3', 'D4'], null, null, null
    ],
    bass: ['C2', 'C2', 'D2', 'D2', 'E2', 'E2', 'G1', 'G1'],
    accent: ['C5', null, 'D5', null, 'E5', null, 'G5', null],
    melodyWave: 'sawtooth',
    bassWave: 'square',
    harmonyWave: 'square',
    accentWave: 'square',
    melodyVolume: 0.124,
    harmonyVolume: 0.046,
    bassVolume: 0.088,
    melodyEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.04, release: 0.06 },
    harmonyEnvelope: { attack: 0.001, decay: 0.03, sustain: 0.02, release: 0.05 },
    bassEnvelope: { attack: 0.001, decay: 0.06, sustain: 0.1, release: 0.08 },
    accentEnvelope: { attack: 0.001, decay: 0.03, sustain: 0.02, release: 0.05 }
  },

  adventure: {
    name: '历险探索',
    tempo: 72,
    subdivision: '8n',
    swing: 0.12,
    swingSubdivision: '8n',
    melody: [
      'E4', null, 'G4', 'A4', 'B4', null, 'A4', 'G4',
      'E4', null, 'D4', 'E4', 'G4', 'A4', 'B4', 'A4',
      'D5', null, 'B4', 'A4', 'G4', null, 'E4', 'G4',
      'A4', null, 'B4', 'D5', 'B4', 'A4', 'G4', 'E4'
    ],
    melodyDurations: ['4n', '8n', '8n', '8n', '4n', '8n', '8n', '8n'],
    harmony: [
      ['E3', 'B3'], null, ['G3', 'B3'], null, ['A3', 'D4'], null, ['G3', 'B3'], null,
      ['D3', 'A3'], null, ['E3', 'B3'], null, ['G3', 'D4'], null, ['A3', 'D4'], null,
      ['B3', 'D4'], null, ['A3', 'D4'], null, ['G3', 'B3'], null, ['E3', 'B3'], null,
      ['G3', 'D4'], null, ['A3', 'D4'], null, ['B3', 'E4'], null, ['E3', 'B3'], null
    ],
    harmonyDurations: ['2n', '2n', '2n', '2n', '2n', '2n', '2n', '2n'],
    bass: ['E2', null, 'B1', null, 'D2', null, 'A1', null, 'G1', null, 'D2', null, 'E2', null, 'D2', null],
    bassDurations: ['2n.', '2n', '2n.', '2n', '2n.', '2n', '2n.', '2n'],
    accent: [null, 'B4', null, null, null, 'D5', null, null, null, 'E5', null, null, 'D5', null, null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVolume: 0.088,
    harmonyVolume: 0.048,
    bassVolume: 0.032,
    accentVolume: 0.03,
    filterFreq: 3200,
    filterQ: 0.46,
    reverbWet: 0.18,
    reverbRoomSize: 0.76,
    reverbDampening: 2300,
    outputGain: 0.89,
    melodyEnvelope: { attack: 0.06, decay: 0.18, sustain: 0.15, release: 0.34 },
    harmonyEnvelope: { attack: 0.12, decay: 0.18, sustain: 0.1, release: 0.42 },
    bassEnvelope: { attack: 0.05, decay: 0.24, sustain: 0.11, release: 0.36 },
    accentEnvelope: { attack: 0.016, decay: 0.1, sustain: 0.02, release: 0.2 }
  },

  story: {
    name: '卷宗叙事',
    tempo: 40,
    subdivision: '8n',
    swing: 0.04,
    swingSubdivision: '8n',
    melody: [
      'E4', null, 'G4', 'B4', 'A4', null, 'G4', 'E4',
      'D4', null, 'E4', 'G4', 'A4', null, 'B4', 'A4',
      'G4', null, 'A4', 'B4', 'D5', null, 'B4', 'G4',
      'E4', null, 'G4', 'A4', 'B4', null, 'A4', 'G4',
      'C5', null, 'D5', 'E5', 'G5', null, 'E5', 'D5',
      'B4', null, 'A4', 'G4', 'E4', null, 'G4', 'A4',
      'B4', null, 'D5', 'E5', 'D5', null, 'B4', 'A4',
      'G4', null, 'E4', 'D4', 'E4', null, 'G4', 'E4'
    ],
    melodyDurations: ['2n', '8n', '8n', '4n', '2n', '8n', '8n', '8n'],
    harmony: [
      ['E3', 'B3', 'E4'], null, ['G3', 'D4', 'G4'], null, ['A3', 'E4', 'A4'], null, ['G3', 'D4', 'G4'], null,
      ['D3', 'A3', 'D4'], null, ['E3', 'B3', 'E4'], null, ['A3', 'E4', 'A4'], null, ['B3', 'F#4', 'B4'], null,
      ['G3', 'D4', 'G4'], null, ['A3', 'E4', 'A4'], null, ['D4', 'A4', 'D5'], null, ['B3', 'F#4', 'B4'], null,
      ['E3', 'B3', 'E4'], null, ['G3', 'D4', 'G4'], null, ['A3', 'E4', 'A4'], null, ['G3', 'D4', 'G4'], null,
      ['C4', 'G4', 'C5'], null, ['D4', 'A4', 'D5'], null, ['B3', 'F#4', 'B4'], null, ['A3', 'E4', 'A4'], null,
      ['G3', 'D4', 'G4'], null, ['E3', 'B3', 'E4'], null, ['D3', 'A3', 'D4'], null, ['E3', 'B3', 'E4'], null,
      ['G3', 'D4', 'G4'], null, ['A3', 'E4', 'A4'], null, ['B3', 'F#4', 'B4'], null, ['A3', 'E4', 'A4'], null,
      ['E3', 'B3', 'E4'], null, ['D3', 'A3', 'D4'], null, ['E3', 'B3', 'E4'], null, ['A3', 'E4', 'A4'], null
    ],
    harmonyDurations: ['2n', '2n', '2n', '2n', '2n', '2n', '2n', '2n'],
    bass: [
      'E2', null, 'G1', null, 'A1', null, 'G1', null,
      'D2', null, 'E2', null, 'A1', null, 'B1', null,
      'G1', null, 'A1', null, 'D2', null, 'B1', null,
      'C2', null, 'G1', null, 'A1', null, 'E2', null
    ],
    bassDurations: ['2n.', '2n', '2n.', '2n', '2n.', '2n', '2n.', '2n'],
    accent: [
      null, 'E5', null, null, null, 'B5', null, null,
      null, 'A5', null, null, null, 'G5', null, null,
      null, 'B5', null, null, null, 'E6', null, null,
      null, 'A5', null, null, null, 'D6', null, null
    ],
    accentDurations: ['8n', '8n', '4n', '8n', '8n', '8n', '8n', '8n'],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'am',
    harmonyVoice: 'fm',
    bassVoice: 'mono',
    accentVoice: 'fm',
    melodyVolume: 0.082,
    harmonyVolume: 0.044,
    bassVolume: 0.028,
    accentVolume: 0.02,
    filterFreq: 2400,
    filterQ: 0.74,
    reverbWet: 0.28,
    reverbRoomSize: 0.94,
    reverbDampening: 1600,
    outputGain: 0.84,
    melodyEnvelope: { attack: 0.24, decay: 0.08, sustain: 0.05, release: 1.6 },
    harmonyEnvelope: { attack: 0.42, decay: 0.05, sustain: 0.03, release: 2.0 },
    bassEnvelope: { attack: 0.18, decay: 0.08, sustain: 0.05, release: 1.3 },
    accentEnvelope: { attack: 0.08, decay: 0.04, sustain: 0.02, release: 0.56 },
    ambient: { type: 'brown', volume: 0.004, filterFreq: 780 }
  },

  shop: {
    name: '坊市',
    tempo: 98,
    subdivision: '8n',
    melody: [
      'G4', 'A4', 'C5', 'A4', 'G4', 'E4', 'G4', 'A4',
      'C5', 'A4', 'G4', 'E4', 'D4', 'E4', 'G4', null
    ],
    harmony: [
      ['D4', 'G4'], null, ['E4', 'A4'], null, ['G4', 'C5'], null, ['E4', 'A4'], null,
      ['D4', 'G4'], null, ['C4', 'E4'], null, ['A3', 'D4'], null, ['C4', 'E4'], null
    ],
    bass: ['G2', 'A2', 'C3', 'A2', 'E2', 'G2', 'A2', 'C3'],
    accent: [null, 'D5', null, null, null, 'E5', null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVolume: 0.085,
    harmonyVolume: 0.048,
    bassVolume: 0.03,
    melodyEnvelope: { attack: 0.02, decay: 0.15, sustain: 0.08, release: 0.18 },
    harmonyEnvelope: { attack: 0.04, decay: 0.14, sustain: 0.06, release: 0.22 },
    bassEnvelope: { attack: 0.03, decay: 0.16, sustain: 0.12, release: 0.22 },
    accentEnvelope: { attack: 0.01, decay: 0.08, sustain: 0.02, release: 0.12 }
  },

  ancient_ruins: {
    name: '上古遗迹',
    tempo: 64,
    subdivision: '8n',
    melody: [
      'E4', null, 'F4', null, 'A4', null, 'G4', null,
      'D4', null, 'E4', null, 'G4', null, 'C5', null
    ],
    harmony: [
      ['B3', 'E4'], null, ['C4', 'F4'], null, ['E4', 'A4'], null, ['D4', 'G4'], null,
      ['A3', 'D4'], null, ['B3', 'E4'], null, ['D4', 'G4'], null, ['G4', 'C5'], null
    ],
    bass: ['E2', null, 'F2', null, 'A1', null, 'G1', null],
    accent: [null, null, 'E5', null, null, 'D5', null, 'C5'],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    melodyVolume: 0.088,
    harmonyVolume: 0.05,
    bassVolume: 0.034,
    melodyEnvelope: { attack: 0.12, decay: 0.18, sustain: 0.14, release: 0.44 },
    harmonyEnvelope: { attack: 0.18, decay: 0.14, sustain: 0.08, release: 0.62 },
    bassEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.1, release: 0.5 },
    accentEnvelope: { attack: 0.02, decay: 0.08, sustain: 0.02, release: 0.14 },
    ambient: { type: 'brown', volume: 0.015, filterFreq: 880 }
  },

  tribulation: {
    name: '渡劫',
    tempo: 88,
    subdivision: '8n',
    melody: [
      'C3', null, 'E3', null, 'G3', null, 'E3', null,
      'C3', null, 'G2', null, 'C3', null, 'E3', null
    ],
    harmony: [
      ['G2', 'C3'], null, ['B2', 'E3'], null, ['D3', 'G3'], null, ['B2', 'E3'], null,
      ['G2', 'C3'], null, ['D2', 'G2'], null, ['G2', 'C3'], null, ['B2', 'E3'], null
    ],
    bass: ['C2', null, 'E2', null, 'G1', null, 'E2', null],
    accent: ['C5', null, null, null, 'G5', null, null, null],
    melodyWave: 'sawtooth',
    bassWave: 'sawtooth',
    harmonyWave: 'square',
    accentWave: 'triangle',
    melodyVolume: 0.11,
    harmonyVolume: 0.05,
    bassVolume: 0.07,
    melodyEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.18 },
    harmonyEnvelope: { attack: 0.02, decay: 0.08, sustain: 0.04, release: 0.14 },
    bassEnvelope: { attack: 0.001, decay: 0.12, sustain: 0.12, release: 0.2 },
    accentEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.02, release: 0.08 }
  },

  warm_hearth: {
    name: '灯下温酒',
    tempo: 64,
    subdivision: '8n',
    melody: [
      'G4', null, 'B4', null, 'D5', null, 'B4', null,
      'A4', null, 'G4', null, 'E4', null, 'G4', null
    ],
    harmony: [
      ['D4', 'G4'], null, ['G4', 'B4'], null, ['A4', 'D5'], null, ['G4', 'B4'], null,
      ['E4', 'A4'], null, ['D4', 'G4'], null, ['C4', 'E4'], null, ['D4', 'G4'], null
    ],
    bass: ['G2', null, 'D3', null, 'A2', null, 'C3', null],
    accent: [null, 'D5', null, null, null, 'B4', null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVolume: 0.084,
    harmonyVolume: 0.046,
    bassVolume: 0.03,
    melodyEnvelope: { attack: 0.08, decay: 0.16, sustain: 0.1, release: 0.42 },
    harmonyEnvelope: { attack: 0.14, decay: 0.14, sustain: 0.08, release: 0.56 },
    bassEnvelope: { attack: 0.05, decay: 0.18, sustain: 0.1, release: 0.4 },
    accentEnvelope: { attack: 0.02, decay: 0.08, sustain: 0.02, release: 0.16 }
  },

  sworn_bond: {
    name: '同行誓约',
    tempo: 76,
    subdivision: '8n',
    melody: [
      'A4', 'C5', 'E5', 'C5', 'A4', 'B4', 'D5', 'B4',
      'G4', 'A4', 'C5', 'A4', 'E4', 'G4', 'A4', null
    ],
    harmony: [
      ['E4', 'A4'], null, ['A4', 'C5'], null, ['G4', 'D5'], null, ['B4', 'D5'], null,
      ['D4', 'G4'], null, ['E4', 'A4'], null, ['C4', 'E4'], null, ['E4', 'A4'], null
    ],
    bass: ['A2', null, 'E2', null, 'G2', null, 'D2', null],
    accent: [null, 'E5', null, null, 'D5', null, null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'am',
    harmonyVoice: 'fm',
    melodyVolume: 0.09,
    harmonyVolume: 0.05,
    bassVolume: 0.03,
    melodyEnvelope: { attack: 0.04, decay: 0.14, sustain: 0.1, release: 0.24 },
    harmonyEnvelope: { attack: 0.1, decay: 0.14, sustain: 0.08, release: 0.38 },
    bassEnvelope: { attack: 0.04, decay: 0.16, sustain: 0.1, release: 0.28 },
    accentEnvelope: { attack: 0.01, decay: 0.06, sustain: 0.02, release: 0.14 }
  },

  peach_blossom: {
    name: '桃夭旧梦',
    tempo: 72,
    subdivision: '8n',
    melody: [
      'C5', null, 'E5', null, 'G5', null, 'E5', null,
      'D5', null, 'C5', null, 'A4', null, 'C5', null
    ],
    harmony: [
      ['G4', 'C5'], null, ['C5', 'E5'], null, ['E5', 'G5'], null, ['C5', 'E5'], null,
      ['A4', 'D5'], null, ['G4', 'C5'], null, ['E4', 'A4'], null, ['G4', 'C5'], null
    ],
    bass: ['C3', null, 'G2', null, 'A2', null, 'E2', null],
    accent: [null, 'G5', null, null, null, 'E5', null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVolume: 0.086,
    harmonyVolume: 0.048,
    bassVolume: 0.028,
    melodyEnvelope: { attack: 0.08, decay: 0.14, sustain: 0.08, release: 0.36 },
    harmonyEnvelope: { attack: 0.16, decay: 0.12, sustain: 0.06, release: 0.54 },
    bassEnvelope: { attack: 0.06, decay: 0.16, sustain: 0.08, release: 0.4 },
    accentEnvelope: { attack: 0.03, decay: 0.08, sustain: 0.02, release: 0.16 },
    ambient: { type: 'pink', volume: 0.007, filterFreq: 1450 }
  },

  broken_vow: {
    name: '誓裂',
    tempo: 58,
    subdivision: '8n',
    melody: [
      'A4', null, 'G4', null, 'E4', null, 'D4', null,
      'C4', null, 'D4', null, 'E4', null, 'G4', null
    ],
    harmony: [
      ['E4', 'A4'], null, ['D4', 'G4'], null, ['C4', 'E4'], null, ['A3', 'D4'], null,
      ['G3', 'C4'], null, ['A3', 'D4'], null, ['C4', 'E4'], null, ['D4', 'G4'], null
    ],
    bass: ['A2', null, 'G2', null, 'E2', null, 'D2', null],
    accent: [null, null, 'E5', null, null, null, 'D5', null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'triangle',
    melodyVolume: 0.078,
    harmonyVolume: 0.042,
    bassVolume: 0.028,
    melodyEnvelope: { attack: 0.14, decay: 0.12, sustain: 0.08, release: 0.68 },
    harmonyEnvelope: { attack: 0.2, decay: 0.1, sustain: 0.05, release: 0.82 },
    bassEnvelope: { attack: 0.08, decay: 0.16, sustain: 0.08, release: 0.58 },
    accentEnvelope: { attack: 0.02, decay: 0.08, sustain: 0.02, release: 0.14 }
  },

  grief_abyss: {
    name: '深渊哀歌',
    tempo: 42,
    subdivision: '2n',
    melody: [
      'E4', null, 'D4', null, 'B3', null, 'A3', null,
      'G3', null, 'A3', null, 'B3', null, null, null
    ],
    harmony: [
      ['B3', 'E4'], null, ['A3', 'D4'], null, ['G3', 'B3'], null, ['E3', 'A3'], null,
      ['D3', 'G3'], null, ['E3', 'A3'], null, ['G3', 'B3'], null, null, null
    ],
    bass: ['E2', null, 'D2', null, 'B1', null, 'A1', null],
    accent: [null, 'E5', null, null, null, 'D5', null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    melodyVolume: 0.072,
    harmonyVolume: 0.04,
    bassVolume: 0.026,
    melodyEnvelope: { attack: 0.28, decay: 0.08, sustain: 0.04, release: 1.04 },
    harmonyEnvelope: { attack: 0.34, decay: 0.06, sustain: 0.03, release: 1.18 },
    bassEnvelope: { attack: 0.18, decay: 0.12, sustain: 0.04, release: 0.98 },
    accentEnvelope: { attack: 0.04, decay: 0.06, sustain: 0.02, release: 0.2 },
    ambient: { type: 'brown', volume: 0.012, filterFreq: 520 }
  },

  funeral_wind: {
    name: '纸灰风灯',
    tempo: 50,
    subdivision: '4n',
    melody: [
      'D4', null, 'F4', null, 'E4', null, 'D4', null,
      'A3', null, 'C4', null, 'D4', null, 'F4', null
    ],
    harmony: [
      ['A3', 'D4'], null, ['C4', 'F4'], null, ['B3', 'E4'], null, ['A3', 'D4'], null,
      ['E3', 'A3'], null, ['G3', 'C4'], null, ['A3', 'D4'], null, ['C4', 'F4'], null
    ],
    bass: ['D2', null, 'F2', null, 'E2', null, 'A1', null],
    accent: [null, null, 'D5', null, null, null, 'C5', null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVolume: 0.074,
    harmonyVolume: 0.042,
    bassVolume: 0.026,
    melodyEnvelope: { attack: 0.16, decay: 0.12, sustain: 0.08, release: 0.72 },
    harmonyEnvelope: { attack: 0.24, decay: 0.08, sustain: 0.04, release: 0.88 },
    bassEnvelope: { attack: 0.1, decay: 0.14, sustain: 0.08, release: 0.64 },
    accentEnvelope: { attack: 0.03, decay: 0.08, sustain: 0.02, release: 0.16 },
    ambient: { type: 'brown', volume: 0.014, filterFreq: 640 }
  },

  empty_city: {
    name: '空城无声',
    tempo: 48,
    subdivision: '4n',
    melody: [
      'G4', null, null, null, 'D4', null, null, null,
      'E4', null, null, null, 'C4', null, null, null
    ],
    harmony: [
      ['D4', 'G4'], null, null, null, ['A3', 'D4'], null, null, null,
      ['B3', 'E4'], null, null, null, ['G3', 'C4'], null, null, null
    ],
    bass: ['G2', null, null, null, 'D2', null, null, null],
    accent: [null, null, 'G5', null, null, null, 'D5', null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVolume: 0.062,
    harmonyVolume: 0.036,
    bassVolume: 0.022,
    melodyEnvelope: { attack: 0.24, decay: 0.08, sustain: 0.04, release: 1.1 },
    harmonyEnvelope: { attack: 0.32, decay: 0.05, sustain: 0.03, release: 1.22 },
    bassEnvelope: { attack: 0.16, decay: 0.1, sustain: 0.04, release: 1.0 },
    accentEnvelope: { attack: 0.05, decay: 0.04, sustain: 0.02, release: 0.18 },
    ambient: { type: 'white', volume: 0.004, filterFreq: 3600 }
  },

  suspense_steps: {
    name: '暗阶轻步',
    tempo: 92,
    subdivision: '16n',
    melody: [
      'E4', null, 'F4', null, 'E4', null, 'D4', null,
      'E4', null, 'G4', null, 'A4', null, 'G4', null
    ],
    harmony: [
      ['B3', 'E4'], null, null, null, ['C4', 'F4'], null, null, null,
      ['B3', 'E4'], null, null, null, ['D4', 'G4'], null, null, null
    ],
    bass: ['E2', null, 'F2', null, 'E2', null, 'D2', null],
    accent: ['E5', null, null, null, 'G5', null, null, null],
    melodyWave: 'square',
    bassWave: 'sawtooth',
    harmonyWave: 'triangle',
    accentWave: 'square',
    melodyVolume: 0.092,
    harmonyVolume: 0.038,
    bassVolume: 0.056,
    melodyEnvelope: { attack: 0.001, decay: 0.06, sustain: 0.04, release: 0.08 },
    harmonyEnvelope: { attack: 0.01, decay: 0.06, sustain: 0.03, release: 0.1 },
    bassEnvelope: { attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.12 },
    accentEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.02, release: 0.06 }
  },

  mirror_dream: {
    name: '镜梦',
    tempo: 66,
    subdivision: '8n',
    melody: [
      'E5', null, 'C5', null, 'A4', null, 'C5', null,
      'G4', null, 'A4', null, 'E5', null, 'C5', null
    ],
    harmony: [
      ['C5', 'E5'], null, ['A4', 'C5'], null, ['E4', 'A4'], null, ['A4', 'C5'], null,
      ['D4', 'G4'], null, ['E4', 'A4'], null, ['C5', 'E5'], null, ['A4', 'C5'], null
    ],
    bass: ['A2', null, 'E2', null, 'G2', null, 'D2', null],
    accent: [null, 'E6', null, null, null, 'C6', null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    melodyVolume: 0.08,
    harmonyVolume: 0.044,
    bassVolume: 0.026,
    melodyEnvelope: { attack: 0.16, decay: 0.1, sustain: 0.06, release: 0.76 },
    harmonyEnvelope: { attack: 0.22, decay: 0.08, sustain: 0.04, release: 0.9 },
    bassEnvelope: { attack: 0.08, decay: 0.12, sustain: 0.06, release: 0.66 },
    accentEnvelope: { attack: 0.04, decay: 0.06, sustain: 0.02, release: 0.18 },
    ambient: { type: 'pink', volume: 0.006, filterFreq: 1250 }
  },

  star_ritual: {
    name: '星坛秘祭',
    tempo: 78,
    subdivision: '8n',
    melody: [
      'F4', null, 'A4', null, 'C5', null, 'E5', null,
      'D5', null, 'C5', null, 'A4', null, 'F4', null
    ],
    harmony: [
      ['C4', 'F4'], null, ['E4', 'A4'], null, ['G4', 'C5'], null, ['B4', 'E5'], null,
      ['A4', 'D5'], null, ['G4', 'C5'], null, ['E4', 'A4'], null, ['C4', 'F4'], null
    ],
    bass: ['F2', null, 'C2', null, 'A1', null, 'D2', null],
    accent: ['F5', null, null, null, 'E5', null, null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'am',
    harmonyVoice: 'fm',
    melodyVolume: 0.088,
    harmonyVolume: 0.05,
    bassVolume: 0.032,
    melodyEnvelope: { attack: 0.08, decay: 0.16, sustain: 0.12, release: 0.42 },
    harmonyEnvelope: { attack: 0.18, decay: 0.12, sustain: 0.06, release: 0.64 },
    bassEnvelope: { attack: 0.06, decay: 0.16, sustain: 0.08, release: 0.48 },
    accentEnvelope: { attack: 0.03, decay: 0.08, sustain: 0.02, release: 0.18 }
  },

  mechanical_pulse: {
    name: '机关脉冲',
    tempo: 112,
    subdivision: '16n',
    melody: [
      'E4', null, 'E4', 'G4', null, 'B4', null, 'G4',
      'D4', null, 'D4', 'F4', null, 'A4', null, 'F4'
    ],
    harmony: [
      ['B3', 'E4'], null, null, null, ['E4', 'G4'], null, null, null,
      ['A3', 'D4'], null, null, null, ['D4', 'F4'], null, null, null
    ],
    bass: ['E2', 'E2', null, 'E2', 'D2', 'D2', null, 'D2'],
    accent: ['E5', null, 'G5', null, 'D5', null, 'F5', null],
    melodyWave: 'square',
    bassWave: 'square',
    harmonyWave: 'sawtooth',
    accentWave: 'square',
    melodyVoice: 'am',
    harmonyVoice: 'am',
    melodyVolume: 0.11,
    harmonyVolume: 0.044,
    bassVolume: 0.078,
    melodyEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.04, release: 0.06 },
    harmonyEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.02, release: 0.05 },
    bassEnvelope: { attack: 0.001, decay: 0.06, sustain: 0.12, release: 0.08 },
    accentEnvelope: { attack: 0.001, decay: 0.03, sustain: 0.02, release: 0.05 }
  },

  neon_alchemy: {
    name: '霓火炼丹',
    tempo: 118,
    subdivision: '16n',
    melody: [
      'A4', null, 'C5', 'E5', null, 'G5', null, 'E5',
      'B4', null, 'D5', 'F5', null, 'A5', null, 'F5'
    ],
    harmony: [
      ['E4', 'A4'], null, null, null, ['G4', 'C5'], null, null, null,
      ['F4', 'B4'], null, null, null, ['A4', 'D5'], null, null, null
    ],
    bass: ['A2', 'A2', null, 'G2', 'B2', 'B2', null, 'A2'],
    accent: ['E6', null, 'G6', null, 'F6', null, 'A6', null],
    melodyWave: 'sawtooth',
    bassWave: 'square',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    accentVoice: 'fm',
    melodyVolume: 0.112,
    harmonyVolume: 0.042,
    bassVolume: 0.074,
    melodyEnvelope: { attack: 0.001, decay: 0.06, sustain: 0.04, release: 0.06 },
    harmonyEnvelope: { attack: 0.01, decay: 0.06, sustain: 0.03, release: 0.08 },
    bassEnvelope: { attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.08 },
    accentEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.02, release: 0.06 }
  },

  river_qin: {
    name: '高山流水',
    tempo: 42,
    subdivision: '8n',
    swing: 0.06,
    swingSubdivision: '8n',
    melody: [
      'D4', null, 'F#4', 'A4', 'D5', null, 'A4', 'F#4',
      'E4', null, 'F#4', 'A4', 'B4', null, 'A4', 'F#4',
      'G4', null, 'B4', 'D5', 'E5', null, 'D5', 'B4',
      'A4', null, 'F#4', 'E4', 'D4', null, 'F#4', 'A4'
    ],
    harmony: [
      ['D3', 'A3', 'D4'], null, ['F#3', 'A3', 'D4'], null, ['A3', 'D4', 'F#4'], null, ['F#3', 'A3', 'D4'], null,
      ['E3', 'A3', 'C#4'], null, ['F#3', 'A3', 'D4'], null, ['G3', 'B3', 'D4'], null, ['F#3', 'A3', 'D4'], null,
      ['G3', 'B3', 'D4'], null, ['A3', 'C#4', 'E4'], null, ['D4', 'F#4', 'A4'], null, ['G3', 'B3', 'D4'], null,
      ['E3', 'A3', 'C#4'], null, ['D3', 'A3', 'D4'], null, ['G3', 'B3', 'D4'], null, ['D3', 'A3', 'D4'], null
    ],
    bass: ['D2', null, 'A1', null, 'D2', null, 'A1', null, 'E2', null, 'A1', null, 'G1', null, 'D2', 'A1'],
    accent: [null, 'A4', null, null, 'D5', null, null, null, null, 'B4', null, null, 'D6', null, null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'am',
    harmonyVoice: 'fm',
    accentVoice: 'fm',
    melodyVolume: 0.078,
    harmonyVolume: 0.042,
    bassVolume: 0.024,
    accentVolume: 0.022,
    filterFreq: 2100,
    filterQ: 0.82,
    reverbWet: 0.3,
    reverbRoomSize: 0.96,
    reverbDampening: 1500,
    outputGain: 0.82,
    melodyEnvelope: { attack: 0.28, decay: 0.12, sustain: 0.07, release: 1.34 },
    harmonyEnvelope: { attack: 0.38, decay: 0.1, sustain: 0.05, release: 1.5 },
    bassEnvelope: { attack: 0.16, decay: 0.16, sustain: 0.07, release: 1.12 },
    accentEnvelope: { attack: 0.08, decay: 0.08, sustain: 0.02, release: 0.4 },
    ambient: { type: 'brown', volume: 0.004, filterFreq: 860 }
  },

  bamboo_flute: {
    name: '竹溪远笛',
    tempo: 63,
    subdivision: '4n',
    melody: [
      'G5', null, 'E5', 'D5', 'E5', null, 'G5', null,
      'A5', null, 'G5', 'E5', 'D5', null, 'B4', null,
      'D5', null, 'E5', 'G5', 'A5', null, 'G5', 'E5',
      'D5', null, 'E5', 'D5', 'B4', null, 'G4', null
    ],
    harmony: [
      ['D5', 'G5'], null, ['B4', 'E5'], null, ['A4', 'D5'], null, ['B4', 'E5'], null,
      ['E5', 'A5'], null, ['D5', 'G5'], null, ['B4', 'E5'], null, ['A4', 'D5'], null,
      ['A4', 'D5'], null, ['B4', 'E5'], null, ['E5', 'A5'], null, ['D5', 'G5'], null,
      ['B4', 'E5'], null, ['A4', 'D5'], null, ['G4', 'B4'], null, ['D4', 'G4'], null
    ],
    bass: [
      'G2', null, 'E2', null, 'D2', null, 'B1', null,
      'A2', null, 'G2', null, 'E2', null, 'D2', null
    ],
    accent: [
      null, 'G6', null, null, null, 'E6', null, null,
      null, 'A6', null, null, null, 'G6', null, null
    ],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    accentVoice: 'fm',
    melodyVolume: 0.082,
    harmonyVolume: 0.044,
    bassVolume: 0.026,
    melodyEnvelope: { attack: 0.16, decay: 0.12, sustain: 0.06, release: 0.82 },
    harmonyEnvelope: { attack: 0.22, decay: 0.08, sustain: 0.04, release: 1.02 },
    bassEnvelope: { attack: 0.1, decay: 0.14, sustain: 0.06, release: 0.82 },
    accentEnvelope: { attack: 0.04, decay: 0.08, sustain: 0.02, release: 0.18 },
    ambient: { type: 'brown', volume: 0.008, filterFreq: 780 }
  },

  desert_bells: {
    name: '荒漠驼铃',
    tempo: 78,
    subdivision: '8n',
    melody: [
      'D4', null, 'F4', null, 'A4', null, 'F4', null,
      'C5', null, 'A4', null, 'G4', null, 'F4', null
    ],
    harmony: [
      ['A3', 'D4'], null, ['C4', 'F4'], null, ['E4', 'A4'], null, ['C4', 'F4'], null,
      ['G4', 'C5'], null, ['E4', 'A4'], null, ['D4', 'G4'], null, ['C4', 'F4'], null
    ],
    bass: ['D2', null, 'A1', null, 'C2', null, 'G1', null],
    accent: ['D5', null, null, null, 'C5', null, null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'triangle',
    melodyVolume: 0.086,
    harmonyVolume: 0.046,
    bassVolume: 0.032,
    melodyEnvelope: { attack: 0.04, decay: 0.16, sustain: 0.1, release: 0.28 },
    harmonyEnvelope: { attack: 0.12, decay: 0.14, sustain: 0.08, release: 0.44 },
    bassEnvelope: { attack: 0.06, decay: 0.18, sustain: 0.08, release: 0.36 },
    accentEnvelope: { attack: 0.01, decay: 0.08, sustain: 0.02, release: 0.14 },
    ambient: { type: 'brown', volume: 0.02, filterFreq: 700 }
  },

  festival_lantern: {
    name: '灯市流光',
    tempo: 106,
    subdivision: '8n',
    melody: [
      'G4', 'B4', 'D5', 'B4', 'C5', 'E5', 'G5', 'E5',
      'D5', 'B4', 'G4', 'A4', 'C5', 'D5', 'E5', null
    ],
    harmony: [
      ['D4', 'G4'], null, ['G4', 'B4'], null, ['G4', 'C5'], null, ['C5', 'E5'], null,
      ['A4', 'D5'], null, ['D4', 'G4'], null, ['E4', 'A4'], null, ['G4', 'C5'], null
    ],
    bass: ['G2', 'D3', 'G2', 'C3', 'D3', 'G2', 'A2', 'C3'],
    accent: [null, 'D5', null, 'G5', null, 'E5', null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'triangle',
    melodyVolume: 0.092,
    harmonyVolume: 0.05,
    bassVolume: 0.032,
    melodyEnvelope: { attack: 0.02, decay: 0.14, sustain: 0.08, release: 0.16 },
    harmonyEnvelope: { attack: 0.04, decay: 0.12, sustain: 0.06, release: 0.2 },
    bassEnvelope: { attack: 0.03, decay: 0.16, sustain: 0.1, release: 0.2 },
    accentEnvelope: { attack: 0.01, decay: 0.06, sustain: 0.02, release: 0.12 }
  },

  dawn_return: {
    name: '破晓归山',
    tempo: 72,
    subdivision: '8n',
    melody: [
      'C5', null, 'E5', null, 'G5', null, 'A5', null,
      'G5', null, 'E5', null, 'D5', null, 'C5', null
    ],
    harmony: [
      ['G4', 'C5'], null, ['B4', 'E5'], null, ['D5', 'G5'], null, ['E5', 'A5'], null,
      ['D5', 'G5'], null, ['B4', 'E5'], null, ['A4', 'D5'], null, ['G4', 'C5'], null
    ],
    bass: ['C3', null, 'G2', null, 'A2', null, 'D2', null],
    accent: [null, 'C6', null, null, null, 'G5', null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'am',
    harmonyVoice: 'fm',
    melodyVolume: 0.09,
    harmonyVolume: 0.05,
    bassVolume: 0.03,
    melodyEnvelope: { attack: 0.08, decay: 0.16, sustain: 0.1, release: 0.42 },
    harmonyEnvelope: { attack: 0.16, decay: 0.14, sustain: 0.08, release: 0.56 },
    bassEnvelope: { attack: 0.06, decay: 0.18, sustain: 0.08, release: 0.42 },
    accentEnvelope: { attack: 0.02, decay: 0.06, sustain: 0.02, release: 0.14 }
  },

  night_patrol: {
    name: '巡夜',
    tempo: 88,
    subdivision: '16n',
    melody: [
      'D4', null, 'F4', null, 'D4', null, 'A3', null,
      'C4', null, 'E4', null, 'C4', null, 'G3', null
    ],
    harmony: [
      ['A3', 'D4'], null, null, null, ['F3', 'A3'], null, null, null,
      ['G3', 'C4'], null, null, null, ['E3', 'G3'], null, null, null
    ],
    bass: ['D2', null, 'A1', null, 'C2', null, 'G1', null],
    accent: ['D5', null, null, null, 'C5', null, null, null],
    melodyWave: 'square',
    bassWave: 'sawtooth',
    harmonyWave: 'triangle',
    accentWave: 'square',
    melodyVolume: 0.088,
    harmonyVolume: 0.036,
    bassVolume: 0.054,
    melodyEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.04, release: 0.08 },
    harmonyEnvelope: { attack: 0.01, decay: 0.05, sustain: 0.03, release: 0.1 },
    bassEnvelope: { attack: 0.001, decay: 0.08, sustain: 0.08, release: 0.12 },
    accentEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.02, release: 0.06 }
  },

  blood_moon: {
    name: '血月',
    tempo: 90,
    subdivision: '8n',
    melody: [
      'C4', null, 'D#4', null, 'G4', null, 'F4', null,
      'C4', null, 'A#3', null, 'G3', null, 'F3', null
    ],
    harmony: [
      ['G3', 'C4'], null, ['A#3', 'D#4'], null, ['D4', 'G4'], null, ['C4', 'F4'], null,
      ['G3', 'C4'], null, ['F3', 'A#3'], null, ['D3', 'G3'], null, ['C3', 'F3'], null
    ],
    bass: ['C2', null, 'A#1', null, 'G1', null, 'F1', null],
    accent: ['C5', null, null, null, 'G5', null, null, null],
    melodyWave: 'sawtooth',
    bassWave: 'square',
    harmonyWave: 'square',
    accentWave: 'triangle',
    melodyVolume: 0.104,
    harmonyVolume: 0.05,
    bassVolume: 0.074,
    melodyEnvelope: { attack: 0.01, decay: 0.08, sustain: 0.08, release: 0.14 },
    harmonyEnvelope: { attack: 0.02, decay: 0.06, sustain: 0.04, release: 0.1 },
    bassEnvelope: { attack: 0.001, decay: 0.1, sustain: 0.12, release: 0.14 },
    accentEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.02, release: 0.08 }
  },

  memory_shards: {
    name: '记忆碎片',
    tempo: 68,
    subdivision: '16n',
    melody: [
      'E5', null, 'B4', 'G4', null, 'E4', null, 'G4',
      'D5', null, 'A4', 'F4', null, 'D4', null, 'F4'
    ],
    harmony: [
      ['B4', 'E5'], null, null, null, ['G4', 'B4'], null, null, null,
      ['A4', 'D5'], null, null, null, ['F4', 'A4'], null, null, null
    ],
    bass: ['E2', null, 'B1', null, 'D2', null, 'A1', null],
    accent: [null, 'E6', null, null, null, 'D6', null, null],
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'sine',
    accentWave: 'sine',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    melodyVolume: 0.082,
    harmonyVolume: 0.04,
    bassVolume: 0.026,
    melodyEnvelope: { attack: 0.06, decay: 0.08, sustain: 0.04, release: 0.2 },
    harmonyEnvelope: { attack: 0.14, decay: 0.08, sustain: 0.03, release: 0.32 },
    bassEnvelope: { attack: 0.06, decay: 0.12, sustain: 0.08, release: 0.26 },
    accentEnvelope: { attack: 0.03, decay: 0.05, sustain: 0.02, release: 0.14 }
  },

  storm_siege: {
    name: '风雷围城',
    tempo: 138,
    subdivision: '16n',
    melody: [
      'D4', 'F4', 'A4', 'F4', 'D4', 'G4', 'A4', 'C5',
      'D5', 'C5', 'A4', 'G4', 'F4', 'D4', 'C4', 'A3'
    ],
    harmony: [
      ['A3', 'D4'], null, ['C4', 'F4'], null, ['D4', 'G4'], null, ['F4', 'A4'], null,
      ['A4', 'D5'], null, ['G4', 'C5'], null, ['F4', 'A4'], null, ['D4', 'G4'], null
    ],
    bass: ['D2', 'D2', 'G1', 'G1', 'A1', 'A1', 'C2', 'C2'],
    accent: ['D5', null, 'F5', null, 'A5', null, 'C6', null],
    melodyWave: 'sawtooth',
    bassWave: 'square',
    harmonyWave: 'square',
    accentWave: 'triangle',
    melodyVolume: 0.122,
    harmonyVolume: 0.056,
    bassVolume: 0.086,
    melodyEnvelope: { attack: 0.001, decay: 0.06, sustain: 0.05, release: 0.08 },
    harmonyEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.03, release: 0.06 },
    bassEnvelope: { attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.08 },
    accentEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.02, release: 0.06 }
  },

  void_signal: {
    name: '虚空讯号',
    tempo: 96,
    subdivision: '16n',
    melody: [
      'E4', null, 'A#4', null, 'F#4', null, 'C5', null,
      'D#4', null, 'A4', null, 'F4', null, 'B4', null
    ],
    harmony: [
      ['B3', 'E4'], null, null, null, ['F4', 'A#4'], null, null, null,
      ['A3', 'D#4'], null, null, null, ['F#4', 'B4'], null, null, null
    ],
    bass: ['E2', null, 'A#1', null, 'D#2', null, 'F#1', null],
    accent: ['E5', null, 'C6', null, 'D#5', null, 'B5', null],
    melodyWave: 'square',
    bassWave: 'square',
    harmonyWave: 'sawtooth',
    accentWave: 'square',
    melodyVoice: 'fm',
    harmonyVoice: 'am',
    accentVoice: 'fm',
    melodyVolume: 0.108,
    harmonyVolume: 0.04,
    bassVolume: 0.07,
    melodyEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.04, release: 0.06 },
    harmonyEnvelope: { attack: 0.001, decay: 0.04, sustain: 0.02, release: 0.05 },
    bassEnvelope: { attack: 0.001, decay: 0.06, sustain: 0.1, release: 0.08 },
    accentEnvelope: { attack: 0.001, decay: 0.03, sustain: 0.02, release: 0.05 }
  },

  crystal_cavern: {
    name: '晶窟回响',
    tempo: 62,
    subdivision: '8n',
    melody: [
      'E5', null, 'G5', null, 'B5', null, 'G5', null,
      'D5', null, 'F5', null, 'A5', null, 'F5', null
    ],
    harmony: [
      ['B4', 'E5'], null, ['D5', 'G5'], null, ['G5', 'B5'], null, ['D5', 'G5'], null,
      ['A4', 'D5'], null, ['C5', 'F5'], null, ['F5', 'A5'], null, ['C5', 'F5'], null
    ],
    bass: ['E2', null, 'B2', null, 'D2', null, 'A2', null],
    accent: [null, 'E6', null, null, null, 'D6', null, null],
    melodyWave: 'sine',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    accentWave: 'sine',
    melodyVoice: 'am',
    harmonyVoice: 'fm',
    melodyVolume: 0.08,
    harmonyVolume: 0.046,
    bassVolume: 0.028,
    melodyEnvelope: { attack: 0.12, decay: 0.1, sustain: 0.06, release: 0.58 },
    harmonyEnvelope: { attack: 0.2, decay: 0.08, sustain: 0.04, release: 0.76 },
    bassEnvelope: { attack: 0.08, decay: 0.12, sustain: 0.06, release: 0.54 },
    accentEnvelope: { attack: 0.04, decay: 0.06, sustain: 0.02, release: 0.18 },
    ambient: { type: 'white', volume: 0.009, filterFreq: 4600 }
  }
}

// ====== BGM 播放核心 ======
let bgmPlaying = false
let bgmLoopId = 0
let melodySynth: unknown = null
let harmonySynth: unknown = null
let bassSynth: unknown = null
let accentSynth: unknown = null
let ambientNoise: unknown = null
let ambientFilter: unknown = null
let bgmOutput: unknown = null
let bgmFilter: unknown = null
let bgmReverb: unknown = null
let bgmScheduleId: number | null = null

const createPolySynth = (
  Tone: ToneModule,
  kind: PolyVoiceKind,
  wave: WaveType,
  envelope: { attack: number; decay: number; sustain: number; release: number },
  volume: number,
  destination: ToneNs.ToneAudioNode
) => {
  const options = {
    oscillator: { type: wave },
    envelope,
    volume: toDb(volume)
  }

  switch (kind) {
    case 'fm':
      return new Tone.PolySynth(Tone.FMSynth, {
        ...options,
        harmonicity: 1.5,
        modulationIndex: 4
      }).connect(destination)
    case 'am':
      return new Tone.PolySynth(Tone.AMSynth, {
        ...options,
        harmonicity: 1.25
      }).connect(destination)
    default:
      return new Tone.PolySynth(Tone.Synth, options).connect(destination)
  }
}

const createBassSynth = (
  Tone: ToneModule,
  kind: MonoVoiceKind,
  wave: WaveType,
  envelope: { attack: number; decay: number; sustain: number; release: number },
  volume: number,
  destination: ToneNs.ToneAudioNode
) => {
  if (kind === 'fm') {
    return new Tone.FMSynth({
      oscillator: { type: wave },
      envelope,
      harmonicity: 0.5,
      modulationIndex: 2,
      volume: toDb(volume)
    }).connect(destination)
  }

  return new Tone.MonoSynth({
    oscillator: { type: wave },
    envelope,
    volume: toDb(volume)
  }).connect(destination)
}

const cleanupBgm = (): void => {
  safeDispose(melodySynth)
  safeDispose(harmonySynth)
  safeDispose(bassSynth)
  safeDispose(accentSynth)
  safeDispose(ambientNoise)
  safeDispose(ambientFilter)
  safeDispose(bgmReverb)
  safeDispose(bgmFilter)
  safeDispose(bgmOutput)
  melodySynth = null
  harmonySynth = null
  bassSynth = null
  accentSynth = null
  ambientNoise = null
  ambientFilter = null
  bgmReverb = null
  bgmFilter = null
  bgmOutput = null
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
    Tone = await ensureToneStarted()
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
  Tone.Transport.bpm.value = config.tempo
  Tone.Transport.swing = config.swing ?? 0
  Tone.Transport.swingSubdivision = config.swingSubdivision ?? config.subdivision
  Tone.Transport.stop()
  if (bgmScheduleId !== null) {
    Tone.Transport.clear(bgmScheduleId)
    bgmScheduleId = null
  }

  bgmOutput = new Tone.Gain(config.outputGain ?? 0.92).toDestination()
  bgmFilter = new Tone.Filter({
    type: 'lowpass',
    frequency: config.filterFreq ?? (type.startsWith('battle') ? 5400 : 4200),
    Q: config.filterQ ?? 0.4
  })
  bgmReverb = new Tone.Freeverb({
    roomSize: config.reverbRoomSize ?? (type.startsWith('battle') ? 0.6 : 0.84),
    dampening: config.reverbDampening ?? (type.startsWith('battle') ? 2800 : 2200),
    wet: config.reverbWet ?? (type.startsWith('battle') ? 0.1 : 0.16)
  })

  ;(bgmFilter as ToneNs.Filter).connect(bgmOutput as ToneNs.Gain)
  ;(bgmFilter as ToneNs.Filter).connect(bgmReverb as ToneNs.Freeverb)
  ;(bgmReverb as ToneNs.Freeverb).connect(bgmOutput as ToneNs.Gain)

  melodySynth = createPolySynth(
    Tone,
    config.melodyVoice ?? 'synth',
    config.melodyWave,
    config.melodyEnvelope ?? { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.3 },
    config.melodyVolume ?? bgmVolume,
    bgmFilter as ToneNs.ToneAudioNode
  )

  harmonySynth = createPolySynth(
    Tone,
    config.harmonyVoice ?? 'synth',
    config.harmonyWave ?? 'sine',
    config.harmonyEnvelope ?? { attack: 0.12, decay: 0.16, sustain: 0.12, release: 0.45 },
    config.harmonyVolume ?? bgmVolume * 0.45,
    bgmFilter as ToneNs.ToneAudioNode
  )

  bassSynth = createBassSynth(
    Tone,
    config.bassVoice ?? 'mono',
    config.bassWave,
    config.bassEnvelope ?? { attack: 0.05, decay: 0.3, sustain: 0.2, release: 0.4 },
    config.bassVolume ?? bgmVolume * 0.4,
    bgmFilter as ToneNs.ToneAudioNode
  )

  accentSynth = createPolySynth(
    Tone,
    config.accentVoice ?? 'synth',
    config.accentWave ?? 'triangle',
    config.accentEnvelope ?? { attack: 0.01, decay: 0.12, sustain: 0.02, release: 0.15 },
    config.accentVolume ?? (config.melodyVolume ?? bgmVolume) * 0.55,
    bgmFilter as ToneNs.ToneAudioNode
  )

  if (config.ambient) {
    ambientFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: config.ambient.filterFreq
    }).connect(bgmOutput as ToneNs.Gain)

    ambientNoise = new Tone.Noise(config.ambient.type)
    ;(ambientNoise as ToneNs.Noise).volume.value = toDb(config.ambient.volume)
    ;(ambientNoise as ToneNs.Noise).connect(ambientFilter as ToneNs.Filter)
    ;(ambientNoise as ToneNs.Noise).start()
  }

  let noteIndex = 0
  const patternLength = Math.max(
    config.melody.length,
    config.harmony?.length ?? 0,
    config.bass.length,
    config.accent?.length ?? 0
  )

  const triggerPattern = (time: number): void => {
    if (!bgmEnabled.value || !bgmPlaying || myLoopId !== bgmLoopId) {
      if (myLoopId === bgmLoopId) {
        bgmPlaying = false
        currentBgmType.value = null
        cleanupBgm()
      }
      return
    }

    if (!melodySynth || !harmonySynth || !bassSynth || !accentSynth) return

    const melodyNote = config.melody[noteIndex % config.melody.length] ?? null
    const harmonyNote = config.harmony?.[noteIndex % (config.harmony?.length || 1)] ?? null
    const bassNote = config.bass[noteIndex % config.bass.length] ?? null
    const accentNote = config.accent?.[noteIndex % (config.accent?.length || 1)] ?? null

    try {
      if (melodyNote) {
        ;(melodySynth as ToneNs.PolySynth).triggerAttackRelease(
          melodyNote,
          resolvePatternDuration(config.melodyDurations, noteIndex, config.subdivision),
          time
        )
      }
      if (harmonyNote) {
        ;(harmonySynth as ToneNs.PolySynth).triggerAttackRelease(
          harmonyNote,
          resolvePatternDuration(config.harmonyDurations, noteIndex, '4n'),
          time
        )
      }
      if (bassNote) {
        ;(bassSynth as ToneNs.MonoSynth).triggerAttackRelease(
          bassNote,
          resolvePatternDuration(config.bassDurations, noteIndex, '4n'),
          time
        )
      }
      if (accentNote) {
        ;(accentSynth as ToneNs.PolySynth).triggerAttackRelease(
          accentNote,
          resolvePatternDuration(config.accentDurations, noteIndex, '16n'),
          time
        )
      }
    } catch {
      /* synth may be disposed */
    }

    noteIndex = (noteIndex + 1) % Math.max(patternLength, 1)
  }

  bgmScheduleId = Tone.Transport.scheduleRepeat(triggerPattern, config.subdivision)
  if (Tone.Transport.state !== 'started') {
    Tone.Transport.start('+0.05')
  }
}

const stopBgm = (): void => {
  bgmPlaying = false
  if (T && bgmScheduleId !== null) {
    T.Transport.clear(bgmScheduleId)
    bgmScheduleId = null
    T.Transport.stop()
  }
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
      void playBgmLoop(currentBgmType.value ?? 'sect_main')
    } else {
      stopBgm()
    }
  }

  const setBgmEnabled = (enabled: boolean): void => {
    if (bgmEnabled.value === enabled) {
      if (!enabled) stopBgm()
      return
    }
    toggleBgm()
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
      { type: 'moonlit_bamboo', name: '月下竹海', category: '门派' },
      { type: 'celestial_palace', name: '天游仙阙', category: '门派' },
      { type: 'jade_hall', name: '玉阙晨钟', category: '门派' },
      { type: 'spirit_orchard', name: '灵田春晓', category: '门派' },
      { type: 'library_embers', name: '残卷烛影', category: '门派' },
      // 四季场景
      { type: 'spring_rain', name: '春风细雨', category: '四季' },
      { type: 'summer_storm', name: '夏日雷电', category: '四季' },
      { type: 'autumn_wind', name: '秋风落叶', category: '四季' },
      { type: 'winter_snow', name: '冬日雪景', category: '四季' },
      { type: 'plum_blossom_snow', name: '梅雪将融', category: '四季' },
      { type: 'lotus_night', name: '荷灯夜泊', category: '四季' },
      // 战斗场景
      { type: 'battle_normal', name: '普通战斗', category: '战斗' },
      { type: 'battle_boss', name: 'Boss战', category: '战斗' },
      { type: 'battle_phase2', name: 'Boss二阶段', category: '战斗' },
      { type: 'battle_raid', name: '群魔围攻', category: '战斗' },
      { type: 'duel_blade', name: '双锋对决', category: '战斗' },
      { type: 'chase_drums', name: '逐杀鼓点', category: '战斗' },
      // 特殊场景
      { type: 'adventure', name: '历险探索', category: '特殊' },
      { type: 'story', name: '卷宗叙事', category: '特殊' },
      { type: 'shop', name: '坊市', category: '特殊' },
      { type: 'ancient_ruins', name: '上古遗迹', category: '特殊' },
      { type: 'tribulation', name: '渡劫', category: '特殊' },
      { type: 'warm_hearth', name: '灯下温酒', category: '剧情' },
      { type: 'sworn_bond', name: '同行誓约', category: '剧情' },
      { type: 'peach_blossom', name: '桃夭旧梦', category: '剧情' },
      { type: 'broken_vow', name: '誓裂', category: '剧情' },
      { type: 'grief_abyss', name: '深渊哀歌', category: '剧情' },
      { type: 'funeral_wind', name: '纸灰风灯', category: '剧情' },
      { type: 'empty_city', name: '空城无声', category: '剧情' },
      { type: 'suspense_steps', name: '暗阶轻步', category: '剧情' },
      { type: 'mirror_dream', name: '镜梦', category: '剧情' },
      { type: 'star_ritual', name: '星坛秘祭', category: '剧情' },
      { type: 'mechanical_pulse', name: '机关脉冲', category: '实验' },
      { type: 'neon_alchemy', name: '霓火炼丹', category: '实验' },
      { type: 'river_qin', name: '高山流水', category: '国风' },
      { type: 'bamboo_flute', name: '竹溪远笛', category: '国风' },
      { type: 'desert_bells', name: '荒漠驼铃', category: '地域' },
      { type: 'festival_lantern', name: '灯市流光', category: '地域' },
      { type: 'dawn_return', name: '破晓归山', category: '剧情' },
      { type: 'night_patrol', name: '巡夜', category: '剧情' },
      { type: 'blood_moon', name: '血月', category: '剧情' },
      { type: 'memory_shards', name: '记忆碎片', category: '剧情' },
      { type: 'storm_siege', name: '风雷围城', category: '剧情' },
      { type: 'void_signal', name: '虚空讯号', category: '实验' },
      { type: 'crystal_cavern', name: '晶窟回响', category: '地域' }
    ]
  }

  const startCultivationBgm = (): void => switchBgm('sect_bamboo')
  const startAdventureBgm = (): void => switchBgm('adventure')
  const startStoryBgm = (): void => switchBgm('story')
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
    setBgmEnabled,
    startBgm,
    stopBgm,
    switchBgm,
    getBgmList,
    startCultivationBgm,
    startAdventureBgm,
    startStoryBgm,
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
  { name: 'sfxHealPulse', fn: sfxHealPulse, description: '灵息回流', category: '战斗' },
  { name: 'sfxShield', fn: sfxShield, description: '灵障成形', category: '战斗' },
  { name: 'sfxParry', fn: sfxParry, description: '金铁回响', category: '战斗' },
  { name: 'sfxFinisher', fn: sfxFinisher, description: '杀意定音', category: '战斗' },
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
  { name: 'sfxDiscovery', fn: sfxDiscovery, description: '仙缘巧合', category: '特殊' },
  { name: 'sfxStoryTextSettle', fn: sfxStoryTextSettle, description: '纸页轻响', category: '剧情' },
  { name: 'sfxStoryDialog', fn: sfxStoryDialog, description: '玉片轻触', category: '剧情' },
  { name: 'sfxStoryChoice', fn: sfxStoryChoice, description: '定局', category: '剧情' },
  { name: 'sfxMemoryFlash', fn: sfxMemoryFlash, description: '往事回潮', category: '剧情' },
  { name: 'sfxDream', fn: sfxDream, description: '幻雾轻旋', category: '剧情' },
  { name: 'sfxHeartbreak', fn: sfxHeartbreak, description: '弦断诀别', category: '剧情' },
  { name: 'sfxBarrier', fn: sfxBarrier, description: '灵壁铺开', category: '法阵' },
  { name: 'sfxTalismanBurst', fn: sfxTalismanBurst, description: '灵纹炸开', category: '法阵' },
  { name: 'sfxTeleport', fn: sfxTeleport, description: '阵光转移', category: '法阵' },
  { name: 'sfxRealmGate', fn: sfxRealmGate, description: '石门启封', category: '法阵' }
]

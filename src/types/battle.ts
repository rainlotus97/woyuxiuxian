import type { Unit } from './unit'

// ====== 战斗阶段 ======
export type BattlePhase =
  | 'preparing'      // 战斗开始准备
  | 'speed_bar'       // 速度条填充中
  | 'select_action'   // 玩家选择行动
  | 'select_target'   // 玩家选择目标
  | 'executing'       // 执行行动动画
  | 'enemy_turn'      // 敌方回合
  | 'checking'       // 检查胜负条件
  | 'ended'           // 战斗结束

// ====== 行动类型 ======
export type BattleActionType = 'attack' | 'skill' | 'defend' | 'item' | 'flee'

export interface BattleAction {
  type: BattleActionType
  actorId: string
  targetIds: string[]
  skillId?: string
  itemId?: string
}

// ====== 伤害结果 ======
export interface DamageResult {
  attackerId: string
  targetId: string
  damage: number
  isCrit: boolean
  isBlocked: boolean
  elementType?: string
  isEffective: boolean       // 元素克制
  isWeak: boolean             // 元素被克
}

// ====== 战斗日志 ======
export interface BattleLogEntry {
  turn: number
  actorName: string
  action: string
  targetName?: string
  result?: string
  timestamp: number
}

// ====== 战斗奖励 ======
export interface BattleRewards {
  cultivation: number  // 修为
  gold: number
  items: { itemId: string; quantity: number }[]
}

// ====== 战斗状态 ======
export interface BattleState {
  phase: BattlePhase
  turnCount: number

  // 场上单位
  allyUnits: Unit[]          // 我方单位（最多 6 个：1 主角 + 5 伙伴/妖宠）
  enemyUnits: Unit[]         // 敌方单位

  // 速度条系统
  speedBar: Map<string, number>  // 单位 ID -> 进度 (0-100)
  currentActingUnitId: string | null

  // 行动队列
  actionQueue: BattleAction[]

  // 当前选择
  selectedAction: BattleActionType | null
  selectedSkillId: string | null
  selectedTargetIds: string[]

  // 战斗日志
  battleLog: BattleLogEntry[]

  // 结果
  result: 'victory' | 'defeat' | 'fled' | null
  rewards?: BattleRewards
}

// ====== 飘字动画数据 ======
export interface DamageNumberData {
  id: string
  targetId: string
  value: number
  isCrit: boolean
  isHeal: boolean
  position: { x: number; y: number }
  timestamp: number
}

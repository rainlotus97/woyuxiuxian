import type { SkillBranch, SkillTreeNode } from '@/types/skill'

export const SKILL_TREE: Record<SkillBranch, SkillTreeNode[]> = {
  attack: [
    { skillId: 'basic_sword', position: { x: 0, y: 0 }, connections: ['sword_qi', 'thunder_strike'] },
    { skillId: 'sword_qi', position: { x: -1, y: 1 }, connections: ['sword_rain'] },
    { skillId: 'thunder_strike', position: { x: 1, y: 1 }, connections: [] },
    { skillId: 'sword_rain', position: { x: -1, y: 2 }, connections: [] }
  ],
  defense: [
    { skillId: 'basic_defense', position: { x: 0, y: 0 }, connections: ['iron_skin', 'shield'] },
    { skillId: 'iron_skin', position: { x: -1, y: 1 }, connections: [] },
    { skillId: 'shield', position: { x: 1, y: 1 }, connections: [] }
  ],
  cultivation: [
    { skillId: 'gathering_qi', position: { x: 0, y: 0 }, connections: ['meditation', 'heal'] },
    { skillId: 'meditation', position: { x: -1, y: 1 }, connections: [] },
    { skillId: 'heal', position: { x: 1, y: 1 }, connections: ['team_heal'] },
    { skillId: 'team_heal', position: { x: 1, y: 2 }, connections: [] }
  ],
  special: [
    { skillId: 'fireball', position: { x: 0, y: 0 }, connections: ['poison_fog', 'critical_eye'] },
    { skillId: 'poison_fog', position: { x: -1, y: 1 }, connections: [] },
    { skillId: 'critical_eye', position: { x: 1, y: 1 }, connections: [] }
  ]
}

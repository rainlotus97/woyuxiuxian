import type { ShopItemDefinition } from './shopCatalog'

export interface ShopMerchantItemRule {
  id: string
  matchKeywords: string[]
  minFavor?: number
  minDebt?: number
  item: ShopItemDefinition
}

export const SHOP_MERCHANT_ITEM_RULES: ShopMerchantItemRule[] = [
  {
    id: 'merchant_medicine_elixir',
    matchKeywords: ['炼丹', '丹修', '药', 'medicine_body', '药王谷真传'],
    minFavor: 45,
    item: {
      id: 'merchant_pill_bai_ruoli_001',
      definitionId: 'pill_baicao_life',
      name: '百草续命丹',
      icon: '续',
      category: 'pill',
      type: 'consumable',
      quality: 'excellent',
      basePrice: 260,
      description: '药脉人物私下流通的疗伤丹，恢复大量气血并稳定灵力。',
      effects: [
        { type: 'hp', value: 160 },
        { type: 'mp', value: 60 }
      ],
      stockRange: [1, 2],
      refreshWeight: 1
    }
  },
  {
    id: 'merchant_forge_charm',
    matchKeywords: ['锻造', '铸', '炼器', 'forge'],
    minFavor: 35,
    item: {
      id: 'merchant_material_forge_001',
      definitionId: 'material_tempered_iron',
      name: '百炼玄铁',
      icon: '炼',
      category: 'material',
      type: 'material',
      quality: 'excellent',
      basePrice: 180,
      description: '锻造人物留出的精炼玄铁，后续可接入强化与炼器。',
      stockRange: [1, 3],
      refreshWeight: 1
    }
  },
  {
    id: 'merchant_array_ink',
    matchKeywords: ['阵法', '符箓', '天机', '推衍', 'void', '空'],
    minDebt: 20,
    item: {
      id: 'merchant_sect_array_001',
      definitionId: 'sect_secret_array_ink',
      name: '秘演阵墨',
      icon: '演',
      category: 'sect',
      type: 'material',
      quality: 'excellent',
      basePrice: 240,
      contributionCost: 28,
      description: '擅长阵法推衍者带来的阵墨，可用于后续宗门阵法与剧情道具。',
      stockRange: [1, 2],
      refreshWeight: 1
    }
  }
]

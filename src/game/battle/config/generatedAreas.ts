import type { AreaDefinition } from '@/types/adventure'

/**
 * 自动生成的完整历练地图 — 288个区域, 864个关卡
 * 覆盖8个境界, 每个境界9个等级, 每个等级4个区域
 */
export const GENERATED_AREAS: AreaDefinition[] = [
  {
    "id": "area_炼气_01_00",
    "name": "翠竹幽谷",
    "icon": "Leaf",
    "description": "位于炼气界的翠竹幽谷，适合炼气1层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 1,
    "staminaCost": 6,
    "difficulty": "easy",
    "recommendedPower": 120,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_1_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在翠竹幽谷中获得的灵草"
      },
      {
        "id": "mat_炼气_1_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在翠竹幽谷中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 12,
      "max": 23
    },
    "goldReward": {
      "min": 8,
      "max": 15
    },
    "background": "你踏入了翠竹幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_01_01",
    "name": "荒芜东沙漠",
    "icon": "Wind",
    "description": "位于炼气界的荒芜东沙漠，适合炼气1层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 1,
    "staminaCost": 6,
    "difficulty": "easy",
    "recommendedPower": 156,
    "enemies": [
      "sand_worm",
      "desert_scorpion"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_1_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在荒芜东沙漠中获得的灵草"
      },
      {
        "id": "mat_炼气_1_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在荒芜东沙漠中获得的狼牙"
      },
      {
        "id": "mat_炼气_1_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在荒芜东沙漠中获得的蛛丝"
      }
    ],
    "expReward": {
      "min": 12,
      "max": 23
    },
    "goldReward": {
      "min": 8,
      "max": 15
    },
    "background": "你踏入了荒芜东沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_01_02",
    "name": "万仞西剑峰",
    "icon": "Sword",
    "description": "位于炼气界的万仞西剑峰，适合炼气1层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 1,
    "staminaCost": 6,
    "difficulty": "easy",
    "recommendedPower": 192,
    "enemies": [
      "sword_spirit",
      "wind_blade",
      "stone_warrior"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_1_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的灵草"
      },
      {
        "id": "mat_炼气_1_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的狼牙"
      },
      {
        "id": "mat_炼气_1_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的蛛丝"
      },
      {
        "id": "mat_炼气_1_铁矿",
        "name": "铁矿石",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的铁矿石"
      }
    ],
    "expReward": {
      "min": 12,
      "max": 23
    },
    "goldReward": {
      "min": 8,
      "max": 15
    },
    "background": "你踏入了万仞西剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_01_03",
    "name": "熔岩南火山",
    "icon": "Flame",
    "description": "位于炼气界的熔岩南火山，适合炼气1层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 1,
    "staminaCost": 6,
    "difficulty": "easy",
    "recommendedPower": 228,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_1_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在熔岩南火山中获得的灵草"
      },
      {
        "id": "mat_炼气_1_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在熔岩南火山中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 12,
      "max": 23
    },
    "goldReward": {
      "min": 8,
      "max": 15
    },
    "background": "你踏入了熔岩南火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_02_00",
    "name": "雷霆崖顶",
    "icon": "Zap",
    "description": "位于炼气界的雷霆崖顶，适合炼气2层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 2,
    "staminaCost": 7,
    "difficulty": "easy",
    "recommendedPower": 140,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_2_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在雷霆崖顶中获得的灵草"
      },
      {
        "id": "mat_炼气_2_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在雷霆崖顶中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 14,
      "max": 27
    },
    "goldReward": {
      "min": 9,
      "max": 18
    },
    "background": "你踏入了雷霆崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_02_01",
    "name": "深渊东裂隙",
    "icon": "Orbit",
    "description": "位于炼气界的深渊东裂隙，适合炼气2层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 2,
    "staminaCost": 7,
    "difficulty": "easy",
    "recommendedPower": 182,
    "enemies": [
      "demon_lord",
      "void_walker"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_2_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在深渊东裂隙中获得的灵草"
      },
      {
        "id": "mat_炼气_2_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在深渊东裂隙中获得的狼牙"
      },
      {
        "id": "mat_炼气_2_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在深渊东裂隙中获得的蛛丝"
      }
    ],
    "expReward": {
      "min": 14,
      "max": 27
    },
    "goldReward": {
      "min": 9,
      "max": 18
    },
    "background": "你踏入了深渊东裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_02_02",
    "name": "幽暗西洞穴",
    "icon": "Mountain",
    "description": "位于炼气界的幽暗西洞穴，适合炼气2层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 2,
    "staminaCost": 7,
    "difficulty": "easy",
    "recommendedPower": 224,
    "enemies": [
      "cave_bat",
      "rock_golem",
      "shadow_snake"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_2_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的灵草"
      },
      {
        "id": "mat_炼气_2_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的狼牙"
      },
      {
        "id": "mat_炼气_2_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的蛛丝"
      },
      {
        "id": "mat_炼气_2_铁矿",
        "name": "铁矿石",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的铁矿石"
      }
    ],
    "expReward": {
      "min": 14,
      "max": 27
    },
    "goldReward": {
      "min": 9,
      "max": 18
    },
    "background": "你踏入了幽暗西洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_02_03",
    "name": "血月南祭坛",
    "icon": "Skull",
    "description": "位于炼气界的血月南祭坛，适合炼气2层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 2,
    "staminaCost": 7,
    "difficulty": "easy",
    "recommendedPower": 266,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_2_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在血月南祭坛中获得的灵草"
      },
      {
        "id": "mat_炼气_2_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在血月南祭坛中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 14,
      "max": 27
    },
    "goldReward": {
      "min": 9,
      "max": 18
    },
    "background": "你踏入了血月南祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_03_00",
    "name": "冰封雪原",
    "icon": "Snowflake",
    "description": "位于炼气界的冰封雪原，适合炼气3层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 3,
    "staminaCost": 7,
    "difficulty": "normal",
    "recommendedPower": 160,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_3_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在冰封雪原中获得的灵草"
      },
      {
        "id": "mat_炼气_3_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在冰封雪原中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 16,
      "max": 31
    },
    "goldReward": {
      "min": 11,
      "max": 20
    },
    "background": "你踏入了冰封雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_03_01",
    "name": "碧波东龙宫",
    "icon": "Droplets",
    "description": "位于炼气界的碧波东龙宫，适合炼气3层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 3,
    "staminaCost": 7,
    "difficulty": "normal",
    "recommendedPower": 208,
    "enemies": [
      "water_serpent",
      "coral_guardian"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_3_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在碧波东龙宫中获得的灵草"
      },
      {
        "id": "mat_炼气_3_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在碧波东龙宫中获得的狼牙"
      },
      {
        "id": "mat_炼气_3_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在碧波东龙宫中获得的蛛丝"
      }
    ],
    "expReward": {
      "min": 16,
      "max": 31
    },
    "goldReward": {
      "min": 11,
      "max": 20
    },
    "background": "你踏入了碧波东龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_03_02",
    "name": "天界西遗迹",
    "icon": "Star",
    "description": "位于炼气界的天界西遗迹，适合炼气3层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 3,
    "staminaCost": 7,
    "difficulty": "normal",
    "recommendedPower": 256,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith",
      "celestial_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_3_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的灵草"
      },
      {
        "id": "mat_炼气_3_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的狼牙"
      },
      {
        "id": "mat_炼气_3_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的蛛丝"
      },
      {
        "id": "mat_炼气_3_铁矿",
        "name": "铁矿石",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的铁矿石"
      }
    ],
    "expReward": {
      "min": 16,
      "max": 31
    },
    "goldReward": {
      "min": 11,
      "max": 20
    },
    "background": "你踏入了天界西遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_03_03",
    "name": "迷雾南森林",
    "icon": "Swords",
    "description": "位于炼气界的迷雾南森林，适合炼气3层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 3,
    "staminaCost": 7,
    "difficulty": "normal",
    "recommendedPower": 304,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_3_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在迷雾南森林中获得的灵草"
      },
      {
        "id": "mat_炼气_3_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在迷雾南森林中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 16,
      "max": 31
    },
    "goldReward": {
      "min": 11,
      "max": 20
    },
    "background": "你踏入了迷雾南森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_04_00",
    "name": "翠竹幽谷",
    "icon": "Leaf",
    "description": "位于炼气界的翠竹幽谷，适合炼气4层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 4,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 180,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_4_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在翠竹幽谷中获得的灵草"
      },
      {
        "id": "mat_炼气_4_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在翠竹幽谷中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 18,
      "max": 35
    },
    "goldReward": {
      "min": 12,
      "max": 23
    },
    "background": "你踏入了翠竹幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_04_01",
    "name": "荒芜东沙漠",
    "icon": "Wind",
    "description": "位于炼气界的荒芜东沙漠，适合炼气4层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 4,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 234,
    "enemies": [
      "sand_worm",
      "desert_scorpion"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_4_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在荒芜东沙漠中获得的灵草"
      },
      {
        "id": "mat_炼气_4_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在荒芜东沙漠中获得的狼牙"
      },
      {
        "id": "mat_炼气_4_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在荒芜东沙漠中获得的蛛丝"
      }
    ],
    "expReward": {
      "min": 18,
      "max": 35
    },
    "goldReward": {
      "min": 12,
      "max": 23
    },
    "background": "你踏入了荒芜东沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_04_02",
    "name": "万仞西剑峰",
    "icon": "Sword",
    "description": "位于炼气界的万仞西剑峰，适合炼气4层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 4,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 288,
    "enemies": [
      "sword_spirit",
      "wind_blade",
      "stone_warrior"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_4_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的灵草"
      },
      {
        "id": "mat_炼气_4_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的狼牙"
      },
      {
        "id": "mat_炼气_4_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的蛛丝"
      },
      {
        "id": "mat_炼气_4_铁矿",
        "name": "铁矿石",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的铁矿石"
      }
    ],
    "expReward": {
      "min": 18,
      "max": 35
    },
    "goldReward": {
      "min": 12,
      "max": 23
    },
    "background": "你踏入了万仞西剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_04_03",
    "name": "熔岩南火山",
    "icon": "Flame",
    "description": "位于炼气界的熔岩南火山，适合炼气4层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 4,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 342,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_4_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在熔岩南火山中获得的灵草"
      },
      {
        "id": "mat_炼气_4_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在熔岩南火山中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 18,
      "max": 35
    },
    "goldReward": {
      "min": 12,
      "max": 23
    },
    "background": "你踏入了熔岩南火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_05_00",
    "name": "雷霆崖顶",
    "icon": "Zap",
    "description": "位于炼气界的雷霆崖顶，适合炼气5层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 5,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 200,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_5_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在雷霆崖顶中获得的灵草"
      },
      {
        "id": "mat_炼气_5_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在雷霆崖顶中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 21,
      "max": 39
    },
    "goldReward": {
      "min": 14,
      "max": 26
    },
    "background": "你踏入了雷霆崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_05_01",
    "name": "深渊东裂隙",
    "icon": "Orbit",
    "description": "位于炼气界的深渊东裂隙，适合炼气5层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 5,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 260,
    "enemies": [
      "demon_lord",
      "void_walker"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_5_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在深渊东裂隙中获得的灵草"
      },
      {
        "id": "mat_炼气_5_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在深渊东裂隙中获得的狼牙"
      },
      {
        "id": "mat_炼气_5_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在深渊东裂隙中获得的蛛丝"
      }
    ],
    "expReward": {
      "min": 21,
      "max": 39
    },
    "goldReward": {
      "min": 14,
      "max": 26
    },
    "background": "你踏入了深渊东裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_05_02",
    "name": "幽暗西洞穴",
    "icon": "Mountain",
    "description": "位于炼气界的幽暗西洞穴，适合炼气5层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 5,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 320,
    "enemies": [
      "cave_bat",
      "rock_golem",
      "shadow_snake"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_5_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的灵草"
      },
      {
        "id": "mat_炼气_5_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的狼牙"
      },
      {
        "id": "mat_炼气_5_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的蛛丝"
      },
      {
        "id": "mat_炼气_5_铁矿",
        "name": "铁矿石",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的铁矿石"
      }
    ],
    "expReward": {
      "min": 21,
      "max": 39
    },
    "goldReward": {
      "min": 14,
      "max": 26
    },
    "background": "你踏入了幽暗西洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_05_03",
    "name": "血月南祭坛",
    "icon": "Skull",
    "description": "位于炼气界的血月南祭坛，适合炼气5层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 5,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 380,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_5_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在血月南祭坛中获得的灵草"
      },
      {
        "id": "mat_炼气_5_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在血月南祭坛中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 21,
      "max": 39
    },
    "goldReward": {
      "min": 14,
      "max": 26
    },
    "background": "你踏入了血月南祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_06_00",
    "name": "冰封雪原",
    "icon": "Snowflake",
    "description": "位于炼气界的冰封雪原，适合炼气6层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 6,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 220,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_6_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在冰封雪原中获得的灵草"
      },
      {
        "id": "mat_炼气_6_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在冰封雪原中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 42
    },
    "goldReward": {
      "min": 15,
      "max": 28
    },
    "background": "你踏入了冰封雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_06_01",
    "name": "碧波东龙宫",
    "icon": "Droplets",
    "description": "位于炼气界的碧波东龙宫，适合炼气6层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 6,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 286,
    "enemies": [
      "water_serpent",
      "coral_guardian"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_6_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在碧波东龙宫中获得的灵草"
      },
      {
        "id": "mat_炼气_6_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在碧波东龙宫中获得的狼牙"
      },
      {
        "id": "mat_炼气_6_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在碧波东龙宫中获得的蛛丝"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 42
    },
    "goldReward": {
      "min": 15,
      "max": 28
    },
    "background": "你踏入了碧波东龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_06_02",
    "name": "天界西遗迹",
    "icon": "Star",
    "description": "位于炼气界的天界西遗迹，适合炼气6层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 6,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 352,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith",
      "celestial_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_6_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的灵草"
      },
      {
        "id": "mat_炼气_6_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的狼牙"
      },
      {
        "id": "mat_炼气_6_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的蛛丝"
      },
      {
        "id": "mat_炼气_6_铁矿",
        "name": "铁矿石",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的铁矿石"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 42
    },
    "goldReward": {
      "min": 15,
      "max": 28
    },
    "background": "你踏入了天界西遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_06_03",
    "name": "迷雾南森林",
    "icon": "Swords",
    "description": "位于炼气界的迷雾南森林，适合炼气6层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 6,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 418,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_6_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在迷雾南森林中获得的灵草"
      },
      {
        "id": "mat_炼气_6_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在迷雾南森林中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 42
    },
    "goldReward": {
      "min": 15,
      "max": 28
    },
    "background": "你踏入了迷雾南森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_07_00",
    "name": "翠竹幽谷",
    "icon": "Leaf",
    "description": "位于炼气界的翠竹幽谷，适合炼气7层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 7,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 240,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_7_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在翠竹幽谷中获得的灵草"
      },
      {
        "id": "mat_炼气_7_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在翠竹幽谷中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 46
    },
    "goldReward": {
      "min": 16,
      "max": 31
    },
    "background": "你踏入了翠竹幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_07_01",
    "name": "荒芜东沙漠",
    "icon": "Wind",
    "description": "位于炼气界的荒芜东沙漠，适合炼气7层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 7,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 312,
    "enemies": [
      "sand_worm",
      "desert_scorpion"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_7_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在荒芜东沙漠中获得的灵草"
      },
      {
        "id": "mat_炼气_7_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在荒芜东沙漠中获得的狼牙"
      },
      {
        "id": "mat_炼气_7_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在荒芜东沙漠中获得的蛛丝"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 46
    },
    "goldReward": {
      "min": 16,
      "max": 31
    },
    "background": "你踏入了荒芜东沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_07_02",
    "name": "万仞西剑峰",
    "icon": "Sword",
    "description": "位于炼气界的万仞西剑峰，适合炼气7层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 7,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 384,
    "enemies": [
      "sword_spirit",
      "wind_blade",
      "stone_warrior"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_7_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的灵草"
      },
      {
        "id": "mat_炼气_7_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的狼牙"
      },
      {
        "id": "mat_炼气_7_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的蛛丝"
      },
      {
        "id": "mat_炼气_7_铁矿",
        "name": "铁矿石",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在万仞西剑峰中获得的铁矿石"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 46
    },
    "goldReward": {
      "min": 16,
      "max": 31
    },
    "background": "你踏入了万仞西剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_07_03",
    "name": "熔岩南火山",
    "icon": "Flame",
    "description": "位于炼气界的熔岩南火山，适合炼气7层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 7,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 456,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_炼气_7_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在熔岩南火山中获得的灵草"
      },
      {
        "id": "mat_炼气_7_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在熔岩南火山中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 46
    },
    "goldReward": {
      "min": 16,
      "max": 31
    },
    "background": "你踏入了熔岩南火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_08_00",
    "name": "雷霆崖顶",
    "icon": "Zap",
    "description": "位于炼气界的雷霆崖顶，适合炼气8层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 8,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 260,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_8_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在雷霆崖顶中获得的灵草"
      },
      {
        "id": "mat_炼气_8_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在雷霆崖顶中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 27,
      "max": 50
    },
    "goldReward": {
      "min": 18,
      "max": 33
    },
    "background": "你踏入了雷霆崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_08_01",
    "name": "深渊东裂隙",
    "icon": "Orbit",
    "description": "位于炼气界的深渊东裂隙，适合炼气8层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 8,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 338,
    "enemies": [
      "demon_lord",
      "void_walker"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_8_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在深渊东裂隙中获得的灵草"
      },
      {
        "id": "mat_炼气_8_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在深渊东裂隙中获得的狼牙"
      },
      {
        "id": "mat_炼气_8_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在深渊东裂隙中获得的蛛丝"
      }
    ],
    "expReward": {
      "min": 27,
      "max": 50
    },
    "goldReward": {
      "min": 18,
      "max": 33
    },
    "background": "你踏入了深渊东裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_08_02",
    "name": "幽暗西洞穴",
    "icon": "Mountain",
    "description": "位于炼气界的幽暗西洞穴，适合炼气8层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 8,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 416,
    "enemies": [
      "cave_bat",
      "rock_golem",
      "shadow_snake"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_8_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的灵草"
      },
      {
        "id": "mat_炼气_8_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的狼牙"
      },
      {
        "id": "mat_炼气_8_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的蛛丝"
      },
      {
        "id": "mat_炼气_8_铁矿",
        "name": "铁矿石",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在幽暗西洞穴中获得的铁矿石"
      }
    ],
    "expReward": {
      "min": 27,
      "max": 50
    },
    "goldReward": {
      "min": 18,
      "max": 33
    },
    "background": "你踏入了幽暗西洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_08_03",
    "name": "血月南祭坛",
    "icon": "Skull",
    "description": "位于炼气界的血月南祭坛，适合炼气8层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 8,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 494,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_炼气_8_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在血月南祭坛中获得的灵草"
      },
      {
        "id": "mat_炼气_8_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在血月南祭坛中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 27,
      "max": 50
    },
    "goldReward": {
      "min": 18,
      "max": 33
    },
    "background": "你踏入了血月南祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_09_00",
    "name": "冰封雪原",
    "icon": "Snowflake",
    "description": "位于炼气界的冰封雪原，适合炼气9层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 9,
    "staminaCost": 10,
    "difficulty": "nightmare",
    "recommendedPower": 280,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_9_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在冰封雪原中获得的灵草"
      },
      {
        "id": "mat_炼气_9_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.5,
        "description": "在冰封雪原中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 29,
      "max": 54
    },
    "goldReward": {
      "min": 19,
      "max": 36
    },
    "background": "你踏入了冰封雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_09_01",
    "name": "碧波东龙宫",
    "icon": "Droplets",
    "description": "位于炼气界的碧波东龙宫，适合炼气9层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 9,
    "staminaCost": 10,
    "difficulty": "nightmare",
    "recommendedPower": 364,
    "enemies": [
      "water_serpent",
      "coral_guardian"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_9_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在碧波东龙宫中获得的灵草"
      },
      {
        "id": "mat_炼气_9_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在碧波东龙宫中获得的狼牙"
      },
      {
        "id": "mat_炼气_9_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.45,
        "description": "在碧波东龙宫中获得的蛛丝"
      }
    ],
    "expReward": {
      "min": 29,
      "max": 54
    },
    "goldReward": {
      "min": 19,
      "max": 36
    },
    "background": "你踏入了碧波东龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_09_02",
    "name": "天界西遗迹",
    "icon": "Star",
    "description": "位于炼气界的天界西遗迹，适合炼气9层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 9,
    "staminaCost": 10,
    "difficulty": "nightmare",
    "recommendedPower": 448,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith",
      "celestial_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_9_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的灵草"
      },
      {
        "id": "mat_炼气_9_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的狼牙"
      },
      {
        "id": "mat_炼气_9_蛛丝",
        "name": "蛛丝",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的蛛丝"
      },
      {
        "id": "mat_炼气_9_铁矿",
        "name": "铁矿石",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.4,
        "description": "在天界西遗迹中获得的铁矿石"
      }
    ],
    "expReward": {
      "min": 29,
      "max": 54
    },
    "goldReward": {
      "min": 19,
      "max": 36
    },
    "background": "你踏入了天界西遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_炼气_09_03",
    "name": "迷雾南森林",
    "icon": "Swords",
    "description": "位于炼气界的迷雾南森林，适合炼气9层修士历练。",
    "requiredRealm": "炼气",
    "requiredRealmLevel": 9,
    "staminaCost": 10,
    "difficulty": "nightmare",
    "recommendedPower": 532,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_炼气_9_灵草",
        "name": "灵草",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在迷雾南森林中获得的灵草"
      },
      {
        "id": "mat_炼气_9_狼牙",
        "name": "狼牙",
        "icon": "剑",
        "type": "material",
        "quality": "common",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在迷雾南森林中获得的狼牙"
      }
    ],
    "expReward": {
      "min": 29,
      "max": 54
    },
    "goldReward": {
      "min": 19,
      "max": 36
    },
    "background": "你踏入了迷雾南森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_01_00",
    "name": "碧波龙宫",
    "icon": "Droplets",
    "description": "位于筑基界的碧波龙宫，适合筑基1层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 1,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 170,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_1_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在碧波龙宫中获得的沙晶"
      },
      {
        "id": "mat_筑基_1_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在碧波龙宫中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 17,
      "max": 32
    },
    "goldReward": {
      "min": 11,
      "max": 22
    },
    "background": "你踏入了碧波龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_01_01",
    "name": "天界东遗迹",
    "icon": "Star",
    "description": "位于筑基界的天界东遗迹，适合筑基1层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 1,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 221,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_1_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在天界东遗迹中获得的沙晶"
      },
      {
        "id": "mat_筑基_1_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在天界东遗迹中获得的蝎尾"
      },
      {
        "id": "mat_筑基_1_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在天界东遗迹中获得的寒霜精华"
      }
    ],
    "expReward": {
      "min": 17,
      "max": 32
    },
    "goldReward": {
      "min": 11,
      "max": 22
    },
    "background": "你踏入了天界东遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_01_02",
    "name": "迷雾西森林",
    "icon": "Swords",
    "description": "位于筑基界的迷雾西森林，适合筑基1层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 1,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 272,
    "enemies": [
      "slime",
      "wild_wolf",
      "forest_spider"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_1_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的沙晶"
      },
      {
        "id": "mat_筑基_1_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的蝎尾"
      },
      {
        "id": "mat_筑基_1_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的寒霜精华"
      },
      {
        "id": "mat_筑基_1_冰晶",
        "name": "冰晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的冰晶"
      }
    ],
    "expReward": {
      "min": 17,
      "max": 32
    },
    "goldReward": {
      "min": 11,
      "max": 22
    },
    "background": "你踏入了迷雾西森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_01_03",
    "name": "翠竹南幽谷",
    "icon": "Leaf",
    "description": "位于筑基界的翠竹南幽谷，适合筑基1层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 1,
    "staminaCost": 8,
    "difficulty": "normal",
    "recommendedPower": 323,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_1_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在翠竹南幽谷中获得的沙晶"
      },
      {
        "id": "mat_筑基_1_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在翠竹南幽谷中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 17,
      "max": 32
    },
    "goldReward": {
      "min": 11,
      "max": 22
    },
    "background": "你踏入了翠竹南幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_02_00",
    "name": "荒芜沙漠",
    "icon": "Wind",
    "description": "位于筑基界的荒芜沙漠，适合筑基2层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 2,
    "staminaCost": 9,
    "difficulty": "normal",
    "recommendedPower": 190,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_2_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在荒芜沙漠中获得的沙晶"
      },
      {
        "id": "mat_筑基_2_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在荒芜沙漠中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 19,
      "max": 36
    },
    "goldReward": {
      "min": 13,
      "max": 24
    },
    "background": "你踏入了荒芜沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_02_01",
    "name": "万仞东剑峰",
    "icon": "Sword",
    "description": "位于筑基界的万仞东剑峰，适合筑基2层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 2,
    "staminaCost": 9,
    "difficulty": "normal",
    "recommendedPower": 247,
    "enemies": [
      "sword_spirit",
      "wind_blade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_2_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在万仞东剑峰中获得的沙晶"
      },
      {
        "id": "mat_筑基_2_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在万仞东剑峰中获得的蝎尾"
      },
      {
        "id": "mat_筑基_2_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在万仞东剑峰中获得的寒霜精华"
      }
    ],
    "expReward": {
      "min": 19,
      "max": 36
    },
    "goldReward": {
      "min": 13,
      "max": 24
    },
    "background": "你踏入了万仞东剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_02_02",
    "name": "熔岩西火山",
    "icon": "Flame",
    "description": "位于筑基界的熔岩西火山，适合筑基2层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 2,
    "staminaCost": 9,
    "difficulty": "normal",
    "recommendedPower": 304,
    "enemies": [
      "fire_elemental",
      "lava_golem",
      "phoenix_chick"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_2_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的沙晶"
      },
      {
        "id": "mat_筑基_2_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的蝎尾"
      },
      {
        "id": "mat_筑基_2_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的寒霜精华"
      },
      {
        "id": "mat_筑基_2_冰晶",
        "name": "冰晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的冰晶"
      }
    ],
    "expReward": {
      "min": 19,
      "max": 36
    },
    "goldReward": {
      "min": 13,
      "max": 24
    },
    "background": "你踏入了熔岩西火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_02_03",
    "name": "雷霆南崖顶",
    "icon": "Zap",
    "description": "位于筑基界的雷霆南崖顶，适合筑基2层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 2,
    "staminaCost": 9,
    "difficulty": "normal",
    "recommendedPower": 361,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_2_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在雷霆南崖顶中获得的沙晶"
      },
      {
        "id": "mat_筑基_2_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在雷霆南崖顶中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 19,
      "max": 36
    },
    "goldReward": {
      "min": 13,
      "max": 24
    },
    "background": "你踏入了雷霆南崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_03_00",
    "name": "深渊裂隙",
    "icon": "Orbit",
    "description": "位于筑基界的深渊裂隙，适合筑基3层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 3,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 210,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_3_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在深渊裂隙中获得的沙晶"
      },
      {
        "id": "mat_筑基_3_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在深渊裂隙中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 21,
      "max": 40
    },
    "goldReward": {
      "min": 14,
      "max": 27
    },
    "background": "你踏入了深渊裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_03_01",
    "name": "幽暗东洞穴",
    "icon": "Mountain",
    "description": "位于筑基界的幽暗东洞穴，适合筑基3层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 3,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 273,
    "enemies": [
      "cave_bat",
      "rock_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_3_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在幽暗东洞穴中获得的沙晶"
      },
      {
        "id": "mat_筑基_3_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在幽暗东洞穴中获得的蝎尾"
      },
      {
        "id": "mat_筑基_3_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在幽暗东洞穴中获得的寒霜精华"
      }
    ],
    "expReward": {
      "min": 21,
      "max": 40
    },
    "goldReward": {
      "min": 14,
      "max": 27
    },
    "background": "你踏入了幽暗东洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_03_02",
    "name": "血月西祭坛",
    "icon": "Skull",
    "description": "位于筑基界的血月西祭坛，适合筑基3层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 3,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 336,
    "enemies": [
      "blood_shade",
      "dark_cultist",
      "nightmare_weaver"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_3_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的沙晶"
      },
      {
        "id": "mat_筑基_3_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的蝎尾"
      },
      {
        "id": "mat_筑基_3_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的寒霜精华"
      },
      {
        "id": "mat_筑基_3_冰晶",
        "name": "冰晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的冰晶"
      }
    ],
    "expReward": {
      "min": 21,
      "max": 40
    },
    "goldReward": {
      "min": 14,
      "max": 27
    },
    "background": "你踏入了血月西祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_03_03",
    "name": "冰封南雪原",
    "icon": "Snowflake",
    "description": "位于筑基界的冰封南雪原，适合筑基3层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 3,
    "staminaCost": 9,
    "difficulty": "hard",
    "recommendedPower": 399,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_3_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在冰封南雪原中获得的沙晶"
      },
      {
        "id": "mat_筑基_3_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在冰封南雪原中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 21,
      "max": 40
    },
    "goldReward": {
      "min": 14,
      "max": 27
    },
    "background": "你踏入了冰封南雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_04_00",
    "name": "碧波龙宫",
    "icon": "Droplets",
    "description": "位于筑基界的碧波龙宫，适合筑基4层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 4,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 229,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_4_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在碧波龙宫中获得的沙晶"
      },
      {
        "id": "mat_筑基_4_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在碧波龙宫中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 44
    },
    "goldReward": {
      "min": 16,
      "max": 29
    },
    "background": "你踏入了碧波龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_04_01",
    "name": "天界东遗迹",
    "icon": "Star",
    "description": "位于筑基界的天界东遗迹，适合筑基4层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 4,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 299,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_4_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在天界东遗迹中获得的沙晶"
      },
      {
        "id": "mat_筑基_4_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在天界东遗迹中获得的蝎尾"
      },
      {
        "id": "mat_筑基_4_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在天界东遗迹中获得的寒霜精华"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 44
    },
    "goldReward": {
      "min": 16,
      "max": 29
    },
    "background": "你踏入了天界东遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_04_02",
    "name": "迷雾西森林",
    "icon": "Swords",
    "description": "位于筑基界的迷雾西森林，适合筑基4层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 4,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 368,
    "enemies": [
      "slime",
      "wild_wolf",
      "forest_spider"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_4_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的沙晶"
      },
      {
        "id": "mat_筑基_4_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的蝎尾"
      },
      {
        "id": "mat_筑基_4_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的寒霜精华"
      },
      {
        "id": "mat_筑基_4_冰晶",
        "name": "冰晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的冰晶"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 44
    },
    "goldReward": {
      "min": 16,
      "max": 29
    },
    "background": "你踏入了迷雾西森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_04_03",
    "name": "翠竹南幽谷",
    "icon": "Leaf",
    "description": "位于筑基界的翠竹南幽谷，适合筑基4层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 4,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 436,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_4_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在翠竹南幽谷中获得的沙晶"
      },
      {
        "id": "mat_筑基_4_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在翠竹南幽谷中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 44
    },
    "goldReward": {
      "min": 16,
      "max": 29
    },
    "background": "你踏入了翠竹南幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_05_00",
    "name": "荒芜沙漠",
    "icon": "Wind",
    "description": "位于筑基界的荒芜沙漠，适合筑基5层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 5,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 250,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_5_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在荒芜沙漠中获得的沙晶"
      },
      {
        "id": "mat_筑基_5_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在荒芜沙漠中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 48
    },
    "goldReward": {
      "min": 17,
      "max": 32
    },
    "background": "你踏入了荒芜沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_05_01",
    "name": "万仞东剑峰",
    "icon": "Sword",
    "description": "位于筑基界的万仞东剑峰，适合筑基5层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 5,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 325,
    "enemies": [
      "sword_spirit",
      "wind_blade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_5_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在万仞东剑峰中获得的沙晶"
      },
      {
        "id": "mat_筑基_5_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在万仞东剑峰中获得的蝎尾"
      },
      {
        "id": "mat_筑基_5_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在万仞东剑峰中获得的寒霜精华"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 48
    },
    "goldReward": {
      "min": 17,
      "max": 32
    },
    "background": "你踏入了万仞东剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_05_02",
    "name": "熔岩西火山",
    "icon": "Flame",
    "description": "位于筑基界的熔岩西火山，适合筑基5层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 5,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 400,
    "enemies": [
      "fire_elemental",
      "lava_golem",
      "phoenix_chick"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_5_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的沙晶"
      },
      {
        "id": "mat_筑基_5_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的蝎尾"
      },
      {
        "id": "mat_筑基_5_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的寒霜精华"
      },
      {
        "id": "mat_筑基_5_冰晶",
        "name": "冰晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的冰晶"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 48
    },
    "goldReward": {
      "min": 17,
      "max": 32
    },
    "background": "你踏入了熔岩西火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_05_03",
    "name": "雷霆南崖顶",
    "icon": "Zap",
    "description": "位于筑基界的雷霆南崖顶，适合筑基5层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 5,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 475,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_5_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在雷霆南崖顶中获得的沙晶"
      },
      {
        "id": "mat_筑基_5_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在雷霆南崖顶中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 48
    },
    "goldReward": {
      "min": 17,
      "max": 32
    },
    "background": "你踏入了雷霆南崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_06_00",
    "name": "深渊裂隙",
    "icon": "Orbit",
    "description": "位于筑基界的深渊裂隙，适合筑基6层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 6,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 270,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_6_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在深渊裂隙中获得的沙晶"
      },
      {
        "id": "mat_筑基_6_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在深渊裂隙中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 28,
      "max": 52
    },
    "goldReward": {
      "min": 18,
      "max": 35
    },
    "background": "你踏入了深渊裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_06_01",
    "name": "幽暗东洞穴",
    "icon": "Mountain",
    "description": "位于筑基界的幽暗东洞穴，适合筑基6层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 6,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 351,
    "enemies": [
      "cave_bat",
      "rock_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_6_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在幽暗东洞穴中获得的沙晶"
      },
      {
        "id": "mat_筑基_6_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在幽暗东洞穴中获得的蝎尾"
      },
      {
        "id": "mat_筑基_6_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在幽暗东洞穴中获得的寒霜精华"
      }
    ],
    "expReward": {
      "min": 28,
      "max": 52
    },
    "goldReward": {
      "min": 18,
      "max": 35
    },
    "background": "你踏入了幽暗东洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_06_02",
    "name": "血月西祭坛",
    "icon": "Skull",
    "description": "位于筑基界的血月西祭坛，适合筑基6层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 6,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 432,
    "enemies": [
      "blood_shade",
      "dark_cultist",
      "nightmare_weaver"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_6_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的沙晶"
      },
      {
        "id": "mat_筑基_6_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的蝎尾"
      },
      {
        "id": "mat_筑基_6_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的寒霜精华"
      },
      {
        "id": "mat_筑基_6_冰晶",
        "name": "冰晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的冰晶"
      }
    ],
    "expReward": {
      "min": 28,
      "max": 52
    },
    "goldReward": {
      "min": 18,
      "max": 35
    },
    "background": "你踏入了血月西祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_06_03",
    "name": "冰封南雪原",
    "icon": "Snowflake",
    "description": "位于筑基界的冰封南雪原，适合筑基6层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 6,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 513,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_6_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在冰封南雪原中获得的沙晶"
      },
      {
        "id": "mat_筑基_6_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在冰封南雪原中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 28,
      "max": 52
    },
    "goldReward": {
      "min": 18,
      "max": 35
    },
    "background": "你踏入了冰封南雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_07_00",
    "name": "碧波龙宫",
    "icon": "Droplets",
    "description": "位于筑基界的碧波龙宫，适合筑基7层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 7,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 290,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_7_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在碧波龙宫中获得的沙晶"
      },
      {
        "id": "mat_筑基_7_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在碧波龙宫中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 30,
      "max": 55
    },
    "goldReward": {
      "min": 20,
      "max": 37
    },
    "background": "你踏入了碧波龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_07_01",
    "name": "天界东遗迹",
    "icon": "Star",
    "description": "位于筑基界的天界东遗迹，适合筑基7层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 7,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 377,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_7_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在天界东遗迹中获得的沙晶"
      },
      {
        "id": "mat_筑基_7_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在天界东遗迹中获得的蝎尾"
      },
      {
        "id": "mat_筑基_7_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在天界东遗迹中获得的寒霜精华"
      }
    ],
    "expReward": {
      "min": 30,
      "max": 55
    },
    "goldReward": {
      "min": 20,
      "max": 37
    },
    "background": "你踏入了天界东遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_07_02",
    "name": "迷雾西森林",
    "icon": "Swords",
    "description": "位于筑基界的迷雾西森林，适合筑基7层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 7,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 464,
    "enemies": [
      "slime",
      "wild_wolf",
      "forest_spider"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_7_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的沙晶"
      },
      {
        "id": "mat_筑基_7_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的蝎尾"
      },
      {
        "id": "mat_筑基_7_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的寒霜精华"
      },
      {
        "id": "mat_筑基_7_冰晶",
        "name": "冰晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在迷雾西森林中获得的冰晶"
      }
    ],
    "expReward": {
      "min": 30,
      "max": 55
    },
    "goldReward": {
      "min": 20,
      "max": 37
    },
    "background": "你踏入了迷雾西森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_07_03",
    "name": "翠竹南幽谷",
    "icon": "Leaf",
    "description": "位于筑基界的翠竹南幽谷，适合筑基7层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 7,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 551,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_筑基_7_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在翠竹南幽谷中获得的沙晶"
      },
      {
        "id": "mat_筑基_7_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在翠竹南幽谷中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 30,
      "max": 55
    },
    "goldReward": {
      "min": 20,
      "max": 37
    },
    "background": "你踏入了翠竹南幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_08_00",
    "name": "荒芜沙漠",
    "icon": "Wind",
    "description": "位于筑基界的荒芜沙漠，适合筑基8层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 8,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 310,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_8_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在荒芜沙漠中获得的沙晶"
      },
      {
        "id": "mat_筑基_8_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在荒芜沙漠中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 32,
      "max": 59
    },
    "goldReward": {
      "min": 21,
      "max": 40
    },
    "background": "你踏入了荒芜沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_08_01",
    "name": "万仞东剑峰",
    "icon": "Sword",
    "description": "位于筑基界的万仞东剑峰，适合筑基8层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 8,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 403,
    "enemies": [
      "sword_spirit",
      "wind_blade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_8_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在万仞东剑峰中获得的沙晶"
      },
      {
        "id": "mat_筑基_8_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在万仞东剑峰中获得的蝎尾"
      },
      {
        "id": "mat_筑基_8_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在万仞东剑峰中获得的寒霜精华"
      }
    ],
    "expReward": {
      "min": 32,
      "max": 59
    },
    "goldReward": {
      "min": 21,
      "max": 40
    },
    "background": "你踏入了万仞东剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_08_02",
    "name": "熔岩西火山",
    "icon": "Flame",
    "description": "位于筑基界的熔岩西火山，适合筑基8层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 8,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 496,
    "enemies": [
      "fire_elemental",
      "lava_golem",
      "phoenix_chick"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_8_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的沙晶"
      },
      {
        "id": "mat_筑基_8_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的蝎尾"
      },
      {
        "id": "mat_筑基_8_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的寒霜精华"
      },
      {
        "id": "mat_筑基_8_冰晶",
        "name": "冰晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在熔岩西火山中获得的冰晶"
      }
    ],
    "expReward": {
      "min": 32,
      "max": 59
    },
    "goldReward": {
      "min": 21,
      "max": 40
    },
    "background": "你踏入了熔岩西火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_08_03",
    "name": "雷霆南崖顶",
    "icon": "Zap",
    "description": "位于筑基界的雷霆南崖顶，适合筑基8层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 8,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 589,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_筑基_8_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在雷霆南崖顶中获得的沙晶"
      },
      {
        "id": "mat_筑基_8_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在雷霆南崖顶中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 32,
      "max": 59
    },
    "goldReward": {
      "min": 21,
      "max": 40
    },
    "background": "你踏入了雷霆南崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_09_00",
    "name": "深渊裂隙",
    "icon": "Orbit",
    "description": "位于筑基界的深渊裂隙，适合筑基9层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 9,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 330,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_9_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在深渊裂隙中获得的沙晶"
      },
      {
        "id": "mat_筑基_9_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.47,
        "description": "在深渊裂隙中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 34,
      "max": 63
    },
    "goldReward": {
      "min": 23,
      "max": 42
    },
    "background": "你踏入了深渊裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_09_01",
    "name": "幽暗东洞穴",
    "icon": "Mountain",
    "description": "位于筑基界的幽暗东洞穴，适合筑基9层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 9,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 429,
    "enemies": [
      "cave_bat",
      "rock_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_9_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在幽暗东洞穴中获得的沙晶"
      },
      {
        "id": "mat_筑基_9_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在幽暗东洞穴中获得的蝎尾"
      },
      {
        "id": "mat_筑基_9_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.42,
        "description": "在幽暗东洞穴中获得的寒霜精华"
      }
    ],
    "expReward": {
      "min": 34,
      "max": 63
    },
    "goldReward": {
      "min": 23,
      "max": 42
    },
    "background": "你踏入了幽暗东洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_09_02",
    "name": "血月西祭坛",
    "icon": "Skull",
    "description": "位于筑基界的血月西祭坛，适合筑基9层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 9,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 528,
    "enemies": [
      "blood_shade",
      "dark_cultist",
      "nightmare_weaver"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_9_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的沙晶"
      },
      {
        "id": "mat_筑基_9_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的蝎尾"
      },
      {
        "id": "mat_筑基_9_寒霜",
        "name": "寒霜精华",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的寒霜精华"
      },
      {
        "id": "mat_筑基_9_冰晶",
        "name": "冰晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.37,
        "description": "在血月西祭坛中获得的冰晶"
      }
    ],
    "expReward": {
      "min": 34,
      "max": 63
    },
    "goldReward": {
      "min": 23,
      "max": 42
    },
    "background": "你踏入了血月西祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_筑基_09_03",
    "name": "冰封南雪原",
    "icon": "Snowflake",
    "description": "位于筑基界的冰封南雪原，适合筑基9层修士历练。",
    "requiredRealm": "筑基",
    "requiredRealmLevel": 9,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 627,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_筑基_9_沙晶",
        "name": "沙晶",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在冰封南雪原中获得的沙晶"
      },
      {
        "id": "mat_筑基_9_蝎尾",
        "name": "蝎尾",
        "icon": "剑",
        "type": "material",
        "quality": "fine",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在冰封南雪原中获得的蝎尾"
      }
    ],
    "expReward": {
      "min": 34,
      "max": 63
    },
    "goldReward": {
      "min": 23,
      "max": 42
    },
    "background": "你踏入了冰封南雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_01_00",
    "name": "幽暗洞穴",
    "icon": "Mountain",
    "description": "位于金丹界的幽暗洞穴，适合金丹1层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 1,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 220,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_1_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在幽暗洞穴中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_1_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在幽暗洞穴中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 42
    },
    "goldReward": {
      "min": 15,
      "max": 28
    },
    "background": "你踏入了幽暗洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_01_01",
    "name": "血月东祭坛",
    "icon": "Skull",
    "description": "位于金丹界的血月东祭坛，适合金丹1层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 1,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 286,
    "enemies": [
      "blood_shade",
      "dark_cultist"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_1_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在血月东祭坛中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_1_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在血月东祭坛中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_1_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在血月东祭坛中获得的天界玉"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 42
    },
    "goldReward": {
      "min": 15,
      "max": 28
    },
    "background": "你踏入了血月东祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_01_02",
    "name": "冰封西雪原",
    "icon": "Snowflake",
    "description": "位于金丹界的冰封西雪原，适合金丹1层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 1,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 352,
    "enemies": [
      "ice_wolf",
      "frost_giant",
      "snow_demon"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_1_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_1_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_1_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的天界玉"
      },
      {
        "id": "mat_金丹_1_灵魄",
        "name": "灵魄精华",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的灵魄精华"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 42
    },
    "goldReward": {
      "min": 15,
      "max": 28
    },
    "background": "你踏入了冰封西雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_01_03",
    "name": "碧波南龙宫",
    "icon": "Droplets",
    "description": "位于金丹界的碧波南龙宫，适合金丹1层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 1,
    "staminaCost": 10,
    "difficulty": "hard",
    "recommendedPower": 418,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_1_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在碧波南龙宫中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_1_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在碧波南龙宫中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 23,
      "max": 42
    },
    "goldReward": {
      "min": 15,
      "max": 28
    },
    "background": "你踏入了碧波南龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_02_00",
    "name": "天界遗迹",
    "icon": "Star",
    "description": "位于金丹界的天界遗迹，适合金丹2层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 2,
    "staminaCost": 11,
    "difficulty": "hard",
    "recommendedPower": 240,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_2_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在天界遗迹中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_2_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在天界遗迹中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 46
    },
    "goldReward": {
      "min": 16,
      "max": 31
    },
    "background": "你踏入了天界遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_02_01",
    "name": "迷雾东森林",
    "icon": "Swords",
    "description": "位于金丹界的迷雾东森林，适合金丹2层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 2,
    "staminaCost": 11,
    "difficulty": "hard",
    "recommendedPower": 312,
    "enemies": [
      "slime",
      "wild_wolf"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_2_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在迷雾东森林中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_2_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在迷雾东森林中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_2_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在迷雾东森林中获得的天界玉"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 46
    },
    "goldReward": {
      "min": 16,
      "max": 31
    },
    "background": "你踏入了迷雾东森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_02_02",
    "name": "翠竹西幽谷",
    "icon": "Leaf",
    "description": "位于金丹界的翠竹西幽谷，适合金丹2层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 2,
    "staminaCost": 11,
    "difficulty": "hard",
    "recommendedPower": 384,
    "enemies": [
      "bamboo_spirit",
      "wood_elf",
      "violet_mist"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_2_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_2_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_2_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的天界玉"
      },
      {
        "id": "mat_金丹_2_灵魄",
        "name": "灵魄精华",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的灵魄精华"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 46
    },
    "goldReward": {
      "min": 16,
      "max": 31
    },
    "background": "你踏入了翠竹西幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_02_03",
    "name": "荒芜南沙漠",
    "icon": "Wind",
    "description": "位于金丹界的荒芜南沙漠，适合金丹2层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 2,
    "staminaCost": 11,
    "difficulty": "hard",
    "recommendedPower": 456,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_2_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在荒芜南沙漠中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_2_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在荒芜南沙漠中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 25,
      "max": 46
    },
    "goldReward": {
      "min": 16,
      "max": 31
    },
    "background": "你踏入了荒芜南沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_03_00",
    "name": "万仞剑峰",
    "icon": "Sword",
    "description": "位于金丹界的万仞剑峰，适合金丹3层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 3,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 260,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_3_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在万仞剑峰中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_3_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在万仞剑峰中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 27,
      "max": 50
    },
    "goldReward": {
      "min": 18,
      "max": 33
    },
    "background": "你踏入了万仞剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_03_01",
    "name": "熔岩东火山",
    "icon": "Flame",
    "description": "位于金丹界的熔岩东火山，适合金丹3层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 3,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 338,
    "enemies": [
      "fire_elemental",
      "lava_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_3_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在熔岩东火山中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_3_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在熔岩东火山中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_3_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在熔岩东火山中获得的天界玉"
      }
    ],
    "expReward": {
      "min": 27,
      "max": 50
    },
    "goldReward": {
      "min": 18,
      "max": 33
    },
    "background": "你踏入了熔岩东火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_03_02",
    "name": "雷霆西崖顶",
    "icon": "Zap",
    "description": "位于金丹界的雷霆西崖顶，适合金丹3层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 3,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 416,
    "enemies": [
      "thunder_bird",
      "storm_elemental",
      "lightning_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_3_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_3_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_3_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的天界玉"
      },
      {
        "id": "mat_金丹_3_灵魄",
        "name": "灵魄精华",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的灵魄精华"
      }
    ],
    "expReward": {
      "min": 27,
      "max": 50
    },
    "goldReward": {
      "min": 18,
      "max": 33
    },
    "background": "你踏入了雷霆西崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_03_03",
    "name": "深渊南裂隙",
    "icon": "Orbit",
    "description": "位于金丹界的深渊南裂隙，适合金丹3层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 3,
    "staminaCost": 11,
    "difficulty": "nightmare",
    "recommendedPower": 494,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_3_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在深渊南裂隙中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_3_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在深渊南裂隙中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 27,
      "max": 50
    },
    "goldReward": {
      "min": 18,
      "max": 33
    },
    "background": "你踏入了深渊南裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_04_00",
    "name": "幽暗洞穴",
    "icon": "Mountain",
    "description": "位于金丹界的幽暗洞穴，适合金丹4层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 4,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 280,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_4_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在幽暗洞穴中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_4_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在幽暗洞穴中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 29,
      "max": 54
    },
    "goldReward": {
      "min": 19,
      "max": 36
    },
    "background": "你踏入了幽暗洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_04_01",
    "name": "血月东祭坛",
    "icon": "Skull",
    "description": "位于金丹界的血月东祭坛，适合金丹4层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 4,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 364,
    "enemies": [
      "blood_shade",
      "dark_cultist"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_4_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在血月东祭坛中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_4_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在血月东祭坛中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_4_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在血月东祭坛中获得的天界玉"
      }
    ],
    "expReward": {
      "min": 29,
      "max": 54
    },
    "goldReward": {
      "min": 19,
      "max": 36
    },
    "background": "你踏入了血月东祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_04_02",
    "name": "冰封西雪原",
    "icon": "Snowflake",
    "description": "位于金丹界的冰封西雪原，适合金丹4层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 4,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 448,
    "enemies": [
      "ice_wolf",
      "frost_giant",
      "snow_demon"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_4_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_4_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_4_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的天界玉"
      },
      {
        "id": "mat_金丹_4_灵魄",
        "name": "灵魄精华",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的灵魄精华"
      }
    ],
    "expReward": {
      "min": 29,
      "max": 54
    },
    "goldReward": {
      "min": 19,
      "max": 36
    },
    "background": "你踏入了冰封西雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_04_03",
    "name": "碧波南龙宫",
    "icon": "Droplets",
    "description": "位于金丹界的碧波南龙宫，适合金丹4层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 4,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 532,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_4_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在碧波南龙宫中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_4_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在碧波南龙宫中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 29,
      "max": 54
    },
    "goldReward": {
      "min": 19,
      "max": 36
    },
    "background": "你踏入了碧波南龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_05_00",
    "name": "天界遗迹",
    "icon": "Star",
    "description": "位于金丹界的天界遗迹，适合金丹5层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 5,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 300,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_5_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在天界遗迹中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_5_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在天界遗迹中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 31,
      "max": 58
    },
    "goldReward": {
      "min": 21,
      "max": 39
    },
    "background": "你踏入了天界遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_05_01",
    "name": "迷雾东森林",
    "icon": "Swords",
    "description": "位于金丹界的迷雾东森林，适合金丹5层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 5,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 390,
    "enemies": [
      "slime",
      "wild_wolf"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_5_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在迷雾东森林中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_5_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在迷雾东森林中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_5_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在迷雾东森林中获得的天界玉"
      }
    ],
    "expReward": {
      "min": 31,
      "max": 58
    },
    "goldReward": {
      "min": 21,
      "max": 39
    },
    "background": "你踏入了迷雾东森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_05_02",
    "name": "翠竹西幽谷",
    "icon": "Leaf",
    "description": "位于金丹界的翠竹西幽谷，适合金丹5层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 5,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 480,
    "enemies": [
      "bamboo_spirit",
      "wood_elf",
      "violet_mist"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_5_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_5_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_5_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的天界玉"
      },
      {
        "id": "mat_金丹_5_灵魄",
        "name": "灵魄精华",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的灵魄精华"
      }
    ],
    "expReward": {
      "min": 31,
      "max": 58
    },
    "goldReward": {
      "min": 21,
      "max": 39
    },
    "background": "你踏入了翠竹西幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_05_03",
    "name": "荒芜南沙漠",
    "icon": "Wind",
    "description": "位于金丹界的荒芜南沙漠，适合金丹5层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 5,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 570,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_5_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在荒芜南沙漠中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_5_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在荒芜南沙漠中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 31,
      "max": 58
    },
    "goldReward": {
      "min": 21,
      "max": 39
    },
    "background": "你踏入了荒芜南沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_06_00",
    "name": "万仞剑峰",
    "icon": "Sword",
    "description": "位于金丹界的万仞剑峰，适合金丹6层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 6,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 320,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_6_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在万仞剑峰中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_6_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在万仞剑峰中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 33,
      "max": 62
    },
    "goldReward": {
      "min": 22,
      "max": 41
    },
    "background": "你踏入了万仞剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_06_01",
    "name": "熔岩东火山",
    "icon": "Flame",
    "description": "位于金丹界的熔岩东火山，适合金丹6层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 6,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 416,
    "enemies": [
      "fire_elemental",
      "lava_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_6_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在熔岩东火山中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_6_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在熔岩东火山中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_6_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在熔岩东火山中获得的天界玉"
      }
    ],
    "expReward": {
      "min": 33,
      "max": 62
    },
    "goldReward": {
      "min": 22,
      "max": 41
    },
    "background": "你踏入了熔岩东火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_06_02",
    "name": "雷霆西崖顶",
    "icon": "Zap",
    "description": "位于金丹界的雷霆西崖顶，适合金丹6层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 6,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 512,
    "enemies": [
      "thunder_bird",
      "storm_elemental",
      "lightning_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_6_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_6_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_6_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的天界玉"
      },
      {
        "id": "mat_金丹_6_灵魄",
        "name": "灵魄精华",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的灵魄精华"
      }
    ],
    "expReward": {
      "min": 33,
      "max": 62
    },
    "goldReward": {
      "min": 22,
      "max": 41
    },
    "background": "你踏入了雷霆西崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_06_03",
    "name": "深渊南裂隙",
    "icon": "Orbit",
    "description": "位于金丹界的深渊南裂隙，适合金丹6层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 6,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 608,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_6_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在深渊南裂隙中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_6_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在深渊南裂隙中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 33,
      "max": 62
    },
    "goldReward": {
      "min": 22,
      "max": 41
    },
    "background": "你踏入了深渊南裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_07_00",
    "name": "幽暗洞穴",
    "icon": "Mountain",
    "description": "位于金丹界的幽暗洞穴，适合金丹7层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 7,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 340,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_7_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在幽暗洞穴中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_7_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在幽暗洞穴中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 35,
      "max": 66
    },
    "goldReward": {
      "min": 23,
      "max": 44
    },
    "background": "你踏入了幽暗洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_07_01",
    "name": "血月东祭坛",
    "icon": "Skull",
    "description": "位于金丹界的血月东祭坛，适合金丹7层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 7,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 442,
    "enemies": [
      "blood_shade",
      "dark_cultist"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_7_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在血月东祭坛中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_7_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在血月东祭坛中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_7_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在血月东祭坛中获得的天界玉"
      }
    ],
    "expReward": {
      "min": 35,
      "max": 66
    },
    "goldReward": {
      "min": 23,
      "max": 44
    },
    "background": "你踏入了血月东祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_07_02",
    "name": "冰封西雪原",
    "icon": "Snowflake",
    "description": "位于金丹界的冰封西雪原，适合金丹7层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 7,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 544,
    "enemies": [
      "ice_wolf",
      "frost_giant",
      "snow_demon"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_7_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_7_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_7_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的天界玉"
      },
      {
        "id": "mat_金丹_7_灵魄",
        "name": "灵魄精华",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在冰封西雪原中获得的灵魄精华"
      }
    ],
    "expReward": {
      "min": 35,
      "max": 66
    },
    "goldReward": {
      "min": 23,
      "max": 44
    },
    "background": "你踏入了冰封西雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_07_03",
    "name": "碧波南龙宫",
    "icon": "Droplets",
    "description": "位于金丹界的碧波南龙宫，适合金丹7层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 7,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 646,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_金丹_7_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在碧波南龙宫中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_7_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在碧波南龙宫中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 35,
      "max": 66
    },
    "goldReward": {
      "min": 23,
      "max": 44
    },
    "background": "你踏入了碧波南龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_08_00",
    "name": "天界遗迹",
    "icon": "Star",
    "description": "位于金丹界的天界遗迹，适合金丹8层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 8,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 360,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_8_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在天界遗迹中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_8_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在天界遗迹中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 37,
      "max": 70
    },
    "goldReward": {
      "min": 25,
      "max": 46
    },
    "background": "你踏入了天界遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_08_01",
    "name": "迷雾东森林",
    "icon": "Swords",
    "description": "位于金丹界的迷雾东森林，适合金丹8层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 8,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 468,
    "enemies": [
      "slime",
      "wild_wolf"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_8_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在迷雾东森林中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_8_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在迷雾东森林中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_8_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在迷雾东森林中获得的天界玉"
      }
    ],
    "expReward": {
      "min": 37,
      "max": 70
    },
    "goldReward": {
      "min": 25,
      "max": 46
    },
    "background": "你踏入了迷雾东森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_08_02",
    "name": "翠竹西幽谷",
    "icon": "Leaf",
    "description": "位于金丹界的翠竹西幽谷，适合金丹8层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 8,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 576,
    "enemies": [
      "bamboo_spirit",
      "wood_elf",
      "violet_mist"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_8_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_8_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_8_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的天界玉"
      },
      {
        "id": "mat_金丹_8_灵魄",
        "name": "灵魄精华",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在翠竹西幽谷中获得的灵魄精华"
      }
    ],
    "expReward": {
      "min": 37,
      "max": 70
    },
    "goldReward": {
      "min": 25,
      "max": 46
    },
    "background": "你踏入了翠竹西幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_08_03",
    "name": "荒芜南沙漠",
    "icon": "Wind",
    "description": "位于金丹界的荒芜南沙漠，适合金丹8层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 8,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 684,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_金丹_8_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在荒芜南沙漠中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_8_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在荒芜南沙漠中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 37,
      "max": 70
    },
    "goldReward": {
      "min": 25,
      "max": 46
    },
    "background": "你踏入了荒芜南沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_09_00",
    "name": "万仞剑峰",
    "icon": "Sword",
    "description": "位于金丹界的万仞剑峰，适合金丹9层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 9,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 380,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_9_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在万仞剑峰中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_9_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.44,
        "description": "在万仞剑峰中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 39,
      "max": 74
    },
    "goldReward": {
      "min": 26,
      "max": 49
    },
    "background": "你踏入了万仞剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_09_01",
    "name": "熔岩东火山",
    "icon": "Flame",
    "description": "位于金丹界的熔岩东火山，适合金丹9层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 9,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 494,
    "enemies": [
      "fire_elemental",
      "lava_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_9_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在熔岩东火山中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_9_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在熔岩东火山中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_9_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.39,
        "description": "在熔岩东火山中获得的天界玉"
      }
    ],
    "expReward": {
      "min": 39,
      "max": 74
    },
    "goldReward": {
      "min": 26,
      "max": 49
    },
    "background": "你踏入了熔岩东火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_09_02",
    "name": "雷霆西崖顶",
    "icon": "Zap",
    "description": "位于金丹界的雷霆西崖顶，适合金丹9层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 9,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 608,
    "enemies": [
      "thunder_bird",
      "storm_elemental",
      "lightning_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_9_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_9_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的凤凰羽毛"
      },
      {
        "id": "mat_金丹_9_天界",
        "name": "天界玉",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的天界玉"
      },
      {
        "id": "mat_金丹_9_灵魄",
        "name": "灵魄精华",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.34,
        "description": "在雷霆西崖顶中获得的灵魄精华"
      }
    ],
    "expReward": {
      "min": 39,
      "max": 74
    },
    "goldReward": {
      "min": 26,
      "max": 49
    },
    "background": "你踏入了雷霆西崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_金丹_09_03",
    "name": "深渊南裂隙",
    "icon": "Orbit",
    "description": "位于金丹界的深渊南裂隙，适合金丹9层修士历练。",
    "requiredRealm": "金丹",
    "requiredRealmLevel": 9,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 722,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_金丹_9_熔岩",
        "name": "熔岩核心",
        "icon": "剑",
        "type": "material",
        "quality": "rare",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在深渊南裂隙中获得的熔岩核心"
      },
      {
        "id": "mat_金丹_9_凤凰",
        "name": "凤凰羽毛",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在深渊南裂隙中获得的凤凰羽毛"
      }
    ],
    "expReward": {
      "min": 39,
      "max": 74
    },
    "goldReward": {
      "min": 26,
      "max": 49
    },
    "background": "你踏入了深渊南裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_01_00",
    "name": "熔岩火山",
    "icon": "Flame",
    "description": "位于元婴界的熔岩火山，适合元婴1层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 1,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 270,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_1_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在熔岩火山中获得的魔血"
      },
      {
        "id": "mat_元婴_1_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在熔岩火山中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 28,
      "max": 52
    },
    "goldReward": {
      "min": 18,
      "max": 35
    },
    "background": "你踏入了熔岩火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_01_01",
    "name": "雷霆东崖顶",
    "icon": "Zap",
    "description": "位于元婴界的雷霆东崖顶，适合元婴1层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 1,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 351,
    "enemies": [
      "thunder_bird",
      "storm_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_1_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在雷霆东崖顶中获得的魔血"
      },
      {
        "id": "mat_元婴_1_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在雷霆东崖顶中获得的虚空晶"
      },
      {
        "id": "mat_元婴_1_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在雷霆东崖顶中获得的混沌精华"
      }
    ],
    "expReward": {
      "min": 28,
      "max": 52
    },
    "goldReward": {
      "min": 18,
      "max": 35
    },
    "background": "你踏入了雷霆东崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_01_02",
    "name": "深渊西裂隙",
    "icon": "Orbit",
    "description": "位于元婴界的深渊西裂隙，适合元婴1层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 1,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 432,
    "enemies": [
      "demon_lord",
      "void_walker",
      "chaos_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_1_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的魔血"
      },
      {
        "id": "mat_元婴_1_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的虚空晶"
      },
      {
        "id": "mat_元婴_1_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的混沌精华"
      },
      {
        "id": "mat_元婴_1_龙鳞",
        "name": "龙鳞",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的龙鳞"
      }
    ],
    "expReward": {
      "min": 28,
      "max": 52
    },
    "goldReward": {
      "min": 18,
      "max": 35
    },
    "background": "你踏入了深渊西裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_01_03",
    "name": "幽暗南洞穴",
    "icon": "Mountain",
    "description": "位于元婴界的幽暗南洞穴，适合元婴1层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 1,
    "staminaCost": 12,
    "difficulty": "nightmare",
    "recommendedPower": 513,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_1_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在幽暗南洞穴中获得的魔血"
      },
      {
        "id": "mat_元婴_1_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在幽暗南洞穴中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 28,
      "max": 52
    },
    "goldReward": {
      "min": 18,
      "max": 35
    },
    "background": "你踏入了幽暗南洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_02_00",
    "name": "血月祭坛",
    "icon": "Skull",
    "description": "位于元婴界的血月祭坛，适合元婴2层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 2,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 290,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_2_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在血月祭坛中获得的魔血"
      },
      {
        "id": "mat_元婴_2_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在血月祭坛中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 30,
      "max": 55
    },
    "goldReward": {
      "min": 20,
      "max": 37
    },
    "background": "你踏入了血月祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_02_01",
    "name": "冰封东雪原",
    "icon": "Snowflake",
    "description": "位于元婴界的冰封东雪原，适合元婴2层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 2,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 377,
    "enemies": [
      "ice_wolf",
      "frost_giant"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_2_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在冰封东雪原中获得的魔血"
      },
      {
        "id": "mat_元婴_2_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在冰封东雪原中获得的虚空晶"
      },
      {
        "id": "mat_元婴_2_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在冰封东雪原中获得的混沌精华"
      }
    ],
    "expReward": {
      "min": 30,
      "max": 55
    },
    "goldReward": {
      "min": 20,
      "max": 37
    },
    "background": "你踏入了冰封东雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_02_02",
    "name": "碧波西龙宫",
    "icon": "Droplets",
    "description": "位于元婴界的碧波西龙宫，适合元婴2层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 2,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 464,
    "enemies": [
      "water_serpent",
      "coral_guardian",
      "tide_hunter"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_2_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的魔血"
      },
      {
        "id": "mat_元婴_2_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的虚空晶"
      },
      {
        "id": "mat_元婴_2_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的混沌精华"
      },
      {
        "id": "mat_元婴_2_龙鳞",
        "name": "龙鳞",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的龙鳞"
      }
    ],
    "expReward": {
      "min": 30,
      "max": 55
    },
    "goldReward": {
      "min": 20,
      "max": 37
    },
    "background": "你踏入了碧波西龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_02_03",
    "name": "天界南遗迹",
    "icon": "Star",
    "description": "位于元婴界的天界南遗迹，适合元婴2层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 2,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 551,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_2_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在天界南遗迹中获得的魔血"
      },
      {
        "id": "mat_元婴_2_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在天界南遗迹中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 30,
      "max": 55
    },
    "goldReward": {
      "min": 20,
      "max": 37
    },
    "background": "你踏入了天界南遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_03_00",
    "name": "迷雾森林",
    "icon": "Swords",
    "description": "位于元婴界的迷雾森林，适合元婴3层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 3,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 310,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_3_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在迷雾森林中获得的魔血"
      },
      {
        "id": "mat_元婴_3_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在迷雾森林中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 32,
      "max": 59
    },
    "goldReward": {
      "min": 21,
      "max": 40
    },
    "background": "你踏入了迷雾森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_03_01",
    "name": "翠竹东幽谷",
    "icon": "Leaf",
    "description": "位于元婴界的翠竹东幽谷，适合元婴3层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 3,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 403,
    "enemies": [
      "bamboo_spirit",
      "wood_elf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_3_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在翠竹东幽谷中获得的魔血"
      },
      {
        "id": "mat_元婴_3_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在翠竹东幽谷中获得的虚空晶"
      },
      {
        "id": "mat_元婴_3_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在翠竹东幽谷中获得的混沌精华"
      }
    ],
    "expReward": {
      "min": 32,
      "max": 59
    },
    "goldReward": {
      "min": 21,
      "max": 40
    },
    "background": "你踏入了翠竹东幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_03_02",
    "name": "荒芜西沙漠",
    "icon": "Wind",
    "description": "位于元婴界的荒芜西沙漠，适合元婴3层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 3,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 496,
    "enemies": [
      "sand_worm",
      "desert_scorpion",
      "mummy_warrior"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_3_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的魔血"
      },
      {
        "id": "mat_元婴_3_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的虚空晶"
      },
      {
        "id": "mat_元婴_3_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的混沌精华"
      },
      {
        "id": "mat_元婴_3_龙鳞",
        "name": "龙鳞",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的龙鳞"
      }
    ],
    "expReward": {
      "min": 32,
      "max": 59
    },
    "goldReward": {
      "min": 21,
      "max": 40
    },
    "background": "你踏入了荒芜西沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_03_03",
    "name": "万仞南剑峰",
    "icon": "Sword",
    "description": "位于元婴界的万仞南剑峰，适合元婴3层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 3,
    "staminaCost": 13,
    "difficulty": "nightmare",
    "recommendedPower": 589,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_3_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在万仞南剑峰中获得的魔血"
      },
      {
        "id": "mat_元婴_3_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在万仞南剑峰中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 32,
      "max": 59
    },
    "goldReward": {
      "min": 21,
      "max": 40
    },
    "background": "你踏入了万仞南剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_04_00",
    "name": "熔岩火山",
    "icon": "Flame",
    "description": "位于元婴界的熔岩火山，适合元婴4层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 4,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 330,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_4_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在熔岩火山中获得的魔血"
      },
      {
        "id": "mat_元婴_4_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在熔岩火山中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 34,
      "max": 63
    },
    "goldReward": {
      "min": 23,
      "max": 42
    },
    "background": "你踏入了熔岩火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_04_01",
    "name": "雷霆东崖顶",
    "icon": "Zap",
    "description": "位于元婴界的雷霆东崖顶，适合元婴4层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 4,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 429,
    "enemies": [
      "thunder_bird",
      "storm_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_4_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在雷霆东崖顶中获得的魔血"
      },
      {
        "id": "mat_元婴_4_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在雷霆东崖顶中获得的虚空晶"
      },
      {
        "id": "mat_元婴_4_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在雷霆东崖顶中获得的混沌精华"
      }
    ],
    "expReward": {
      "min": 34,
      "max": 63
    },
    "goldReward": {
      "min": 23,
      "max": 42
    },
    "background": "你踏入了雷霆东崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_04_02",
    "name": "深渊西裂隙",
    "icon": "Orbit",
    "description": "位于元婴界的深渊西裂隙，适合元婴4层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 4,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 528,
    "enemies": [
      "demon_lord",
      "void_walker",
      "chaos_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_4_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的魔血"
      },
      {
        "id": "mat_元婴_4_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的虚空晶"
      },
      {
        "id": "mat_元婴_4_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的混沌精华"
      },
      {
        "id": "mat_元婴_4_龙鳞",
        "name": "龙鳞",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的龙鳞"
      }
    ],
    "expReward": {
      "min": 34,
      "max": 63
    },
    "goldReward": {
      "min": 23,
      "max": 42
    },
    "background": "你踏入了深渊西裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_04_03",
    "name": "幽暗南洞穴",
    "icon": "Mountain",
    "description": "位于元婴界的幽暗南洞穴，适合元婴4层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 4,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 627,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_4_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在幽暗南洞穴中获得的魔血"
      },
      {
        "id": "mat_元婴_4_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在幽暗南洞穴中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 34,
      "max": 63
    },
    "goldReward": {
      "min": 23,
      "max": 42
    },
    "background": "你踏入了幽暗南洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_05_00",
    "name": "血月祭坛",
    "icon": "Skull",
    "description": "位于元婴界的血月祭坛，适合元婴5层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 5,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 350,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_5_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在血月祭坛中获得的魔血"
      },
      {
        "id": "mat_元婴_5_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在血月祭坛中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 36,
      "max": 67
    },
    "goldReward": {
      "min": 24,
      "max": 45
    },
    "background": "你踏入了血月祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_05_01",
    "name": "冰封东雪原",
    "icon": "Snowflake",
    "description": "位于元婴界的冰封东雪原，适合元婴5层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 5,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 455,
    "enemies": [
      "ice_wolf",
      "frost_giant"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_5_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在冰封东雪原中获得的魔血"
      },
      {
        "id": "mat_元婴_5_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在冰封东雪原中获得的虚空晶"
      },
      {
        "id": "mat_元婴_5_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在冰封东雪原中获得的混沌精华"
      }
    ],
    "expReward": {
      "min": 36,
      "max": 67
    },
    "goldReward": {
      "min": 24,
      "max": 45
    },
    "background": "你踏入了冰封东雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_05_02",
    "name": "碧波西龙宫",
    "icon": "Droplets",
    "description": "位于元婴界的碧波西龙宫，适合元婴5层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 5,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 560,
    "enemies": [
      "water_serpent",
      "coral_guardian",
      "tide_hunter"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_5_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的魔血"
      },
      {
        "id": "mat_元婴_5_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的虚空晶"
      },
      {
        "id": "mat_元婴_5_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的混沌精华"
      },
      {
        "id": "mat_元婴_5_龙鳞",
        "name": "龙鳞",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的龙鳞"
      }
    ],
    "expReward": {
      "min": 36,
      "max": 67
    },
    "goldReward": {
      "min": 24,
      "max": 45
    },
    "background": "你踏入了碧波西龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_05_03",
    "name": "天界南遗迹",
    "icon": "Star",
    "description": "位于元婴界的天界南遗迹，适合元婴5层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 5,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 665,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_5_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在天界南遗迹中获得的魔血"
      },
      {
        "id": "mat_元婴_5_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在天界南遗迹中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 36,
      "max": 67
    },
    "goldReward": {
      "min": 24,
      "max": 45
    },
    "background": "你踏入了天界南遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_06_00",
    "name": "迷雾森林",
    "icon": "Swords",
    "description": "位于元婴界的迷雾森林，适合元婴6层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 6,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 370,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_6_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在迷雾森林中获得的魔血"
      },
      {
        "id": "mat_元婴_6_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在迷雾森林中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 38,
      "max": 71
    },
    "goldReward": {
      "min": 25,
      "max": 48
    },
    "background": "你踏入了迷雾森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_06_01",
    "name": "翠竹东幽谷",
    "icon": "Leaf",
    "description": "位于元婴界的翠竹东幽谷，适合元婴6层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 6,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 481,
    "enemies": [
      "bamboo_spirit",
      "wood_elf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_6_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在翠竹东幽谷中获得的魔血"
      },
      {
        "id": "mat_元婴_6_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在翠竹东幽谷中获得的虚空晶"
      },
      {
        "id": "mat_元婴_6_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在翠竹东幽谷中获得的混沌精华"
      }
    ],
    "expReward": {
      "min": 38,
      "max": 71
    },
    "goldReward": {
      "min": 25,
      "max": 48
    },
    "background": "你踏入了翠竹东幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_06_02",
    "name": "荒芜西沙漠",
    "icon": "Wind",
    "description": "位于元婴界的荒芜西沙漠，适合元婴6层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 6,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 592,
    "enemies": [
      "sand_worm",
      "desert_scorpion",
      "mummy_warrior"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_6_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的魔血"
      },
      {
        "id": "mat_元婴_6_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的虚空晶"
      },
      {
        "id": "mat_元婴_6_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的混沌精华"
      },
      {
        "id": "mat_元婴_6_龙鳞",
        "name": "龙鳞",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的龙鳞"
      }
    ],
    "expReward": {
      "min": 38,
      "max": 71
    },
    "goldReward": {
      "min": 25,
      "max": 48
    },
    "background": "你踏入了荒芜西沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_06_03",
    "name": "万仞南剑峰",
    "icon": "Sword",
    "description": "位于元婴界的万仞南剑峰，适合元婴6层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 6,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 703,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_6_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在万仞南剑峰中获得的魔血"
      },
      {
        "id": "mat_元婴_6_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在万仞南剑峰中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 38,
      "max": 71
    },
    "goldReward": {
      "min": 25,
      "max": 48
    },
    "background": "你踏入了万仞南剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_07_00",
    "name": "熔岩火山",
    "icon": "Flame",
    "description": "位于元婴界的熔岩火山，适合元婴7层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 7,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 390,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_7_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在熔岩火山中获得的魔血"
      },
      {
        "id": "mat_元婴_7_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在熔岩火山中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 40,
      "max": 75
    },
    "goldReward": {
      "min": 27,
      "max": 50
    },
    "background": "你踏入了熔岩火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_07_01",
    "name": "雷霆东崖顶",
    "icon": "Zap",
    "description": "位于元婴界的雷霆东崖顶，适合元婴7层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 7,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 507,
    "enemies": [
      "thunder_bird",
      "storm_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_7_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在雷霆东崖顶中获得的魔血"
      },
      {
        "id": "mat_元婴_7_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在雷霆东崖顶中获得的虚空晶"
      },
      {
        "id": "mat_元婴_7_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在雷霆东崖顶中获得的混沌精华"
      }
    ],
    "expReward": {
      "min": 40,
      "max": 75
    },
    "goldReward": {
      "min": 27,
      "max": 50
    },
    "background": "你踏入了雷霆东崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_07_02",
    "name": "深渊西裂隙",
    "icon": "Orbit",
    "description": "位于元婴界的深渊西裂隙，适合元婴7层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 7,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 624,
    "enemies": [
      "demon_lord",
      "void_walker",
      "chaos_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_7_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的魔血"
      },
      {
        "id": "mat_元婴_7_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的虚空晶"
      },
      {
        "id": "mat_元婴_7_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的混沌精华"
      },
      {
        "id": "mat_元婴_7_龙鳞",
        "name": "龙鳞",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在深渊西裂隙中获得的龙鳞"
      }
    ],
    "expReward": {
      "min": 40,
      "max": 75
    },
    "goldReward": {
      "min": 27,
      "max": 50
    },
    "background": "你踏入了深渊西裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_07_03",
    "name": "幽暗南洞穴",
    "icon": "Mountain",
    "description": "位于元婴界的幽暗南洞穴，适合元婴7层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 7,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 741,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_元婴_7_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在幽暗南洞穴中获得的魔血"
      },
      {
        "id": "mat_元婴_7_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在幽暗南洞穴中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 40,
      "max": 75
    },
    "goldReward": {
      "min": 27,
      "max": 50
    },
    "background": "你踏入了幽暗南洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_08_00",
    "name": "血月祭坛",
    "icon": "Skull",
    "description": "位于元婴界的血月祭坛，适合元婴8层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 8,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 409,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_8_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在血月祭坛中获得的魔血"
      },
      {
        "id": "mat_元婴_8_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在血月祭坛中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 79
    },
    "goldReward": {
      "min": 28,
      "max": 53
    },
    "background": "你踏入了血月祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_08_01",
    "name": "冰封东雪原",
    "icon": "Snowflake",
    "description": "位于元婴界的冰封东雪原，适合元婴8层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 8,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 533,
    "enemies": [
      "ice_wolf",
      "frost_giant"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_8_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在冰封东雪原中获得的魔血"
      },
      {
        "id": "mat_元婴_8_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在冰封东雪原中获得的虚空晶"
      },
      {
        "id": "mat_元婴_8_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在冰封东雪原中获得的混沌精华"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 79
    },
    "goldReward": {
      "min": 28,
      "max": 53
    },
    "background": "你踏入了冰封东雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_08_02",
    "name": "碧波西龙宫",
    "icon": "Droplets",
    "description": "位于元婴界的碧波西龙宫，适合元婴8层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 8,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 656,
    "enemies": [
      "water_serpent",
      "coral_guardian",
      "tide_hunter"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_8_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的魔血"
      },
      {
        "id": "mat_元婴_8_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的虚空晶"
      },
      {
        "id": "mat_元婴_8_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的混沌精华"
      },
      {
        "id": "mat_元婴_8_龙鳞",
        "name": "龙鳞",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在碧波西龙宫中获得的龙鳞"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 79
    },
    "goldReward": {
      "min": 28,
      "max": 53
    },
    "background": "你踏入了碧波西龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_08_03",
    "name": "天界南遗迹",
    "icon": "Star",
    "description": "位于元婴界的天界南遗迹，适合元婴8层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 8,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 778,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_元婴_8_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在天界南遗迹中获得的魔血"
      },
      {
        "id": "mat_元婴_8_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在天界南遗迹中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 79
    },
    "goldReward": {
      "min": 28,
      "max": 53
    },
    "background": "你踏入了天界南遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_09_00",
    "name": "迷雾森林",
    "icon": "Swords",
    "description": "位于元婴界的迷雾森林，适合元婴9层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 9,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 430,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_9_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在迷雾森林中获得的魔血"
      },
      {
        "id": "mat_元婴_9_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.41,
        "description": "在迷雾森林中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 83
    },
    "goldReward": {
      "min": 30,
      "max": 55
    },
    "background": "你踏入了迷雾森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_09_01",
    "name": "翠竹东幽谷",
    "icon": "Leaf",
    "description": "位于元婴界的翠竹东幽谷，适合元婴9层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 9,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 559,
    "enemies": [
      "bamboo_spirit",
      "wood_elf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_9_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在翠竹东幽谷中获得的魔血"
      },
      {
        "id": "mat_元婴_9_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在翠竹东幽谷中获得的虚空晶"
      },
      {
        "id": "mat_元婴_9_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.36,
        "description": "在翠竹东幽谷中获得的混沌精华"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 83
    },
    "goldReward": {
      "min": 30,
      "max": 55
    },
    "background": "你踏入了翠竹东幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_09_02",
    "name": "荒芜西沙漠",
    "icon": "Wind",
    "description": "位于元婴界的荒芜西沙漠，适合元婴9层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 9,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 688,
    "enemies": [
      "sand_worm",
      "desert_scorpion",
      "mummy_warrior"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_9_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的魔血"
      },
      {
        "id": "mat_元婴_9_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的虚空晶"
      },
      {
        "id": "mat_元婴_9_混沌",
        "name": "混沌精华",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的混沌精华"
      },
      {
        "id": "mat_元婴_9_龙鳞",
        "name": "龙鳞",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.31,
        "description": "在荒芜西沙漠中获得的龙鳞"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 83
    },
    "goldReward": {
      "min": 30,
      "max": 55
    },
    "background": "你踏入了荒芜西沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_元婴_09_03",
    "name": "万仞南剑峰",
    "icon": "Sword",
    "description": "位于元婴界的万仞南剑峰，适合元婴9层修士历练。",
    "requiredRealm": "元婴",
    "requiredRealmLevel": 9,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 817,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_元婴_9_魔血",
        "name": "魔血",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在万仞南剑峰中获得的魔血"
      },
      {
        "id": "mat_元婴_9_虚空",
        "name": "虚空晶",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.26,
        "description": "在万仞南剑峰中获得的虚空晶"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 83
    },
    "goldReward": {
      "min": 30,
      "max": 55
    },
    "background": "你踏入了万仞南剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_01_00",
    "name": "翠竹幽谷",
    "icon": "Leaf",
    "description": "位于化神界的翠竹幽谷，适合化神1层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 1,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 320,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_1_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在翠竹幽谷中获得的神铁"
      },
      {
        "id": "mat_化神_1_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在翠竹幽谷中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 33,
      "max": 62
    },
    "goldReward": {
      "min": 22,
      "max": 41
    },
    "background": "你踏入了翠竹幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_01_01",
    "name": "荒芜东沙漠",
    "icon": "Wind",
    "description": "位于化神界的荒芜东沙漠，适合化神1层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 1,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 416,
    "enemies": [
      "sand_worm",
      "desert_scorpion"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_1_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在荒芜东沙漠中获得的神铁"
      },
      {
        "id": "mat_化神_1_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在荒芜东沙漠中获得的凤羽"
      },
      {
        "id": "mat_化神_1_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在荒芜东沙漠中获得的玄天玉"
      }
    ],
    "expReward": {
      "min": 33,
      "max": 62
    },
    "goldReward": {
      "min": 22,
      "max": 41
    },
    "background": "你踏入了荒芜东沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_01_02",
    "name": "万仞西剑峰",
    "icon": "Sword",
    "description": "位于化神界的万仞西剑峰，适合化神1层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 1,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 512,
    "enemies": [
      "sword_spirit",
      "wind_blade",
      "stone_warrior"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_1_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的神铁"
      },
      {
        "id": "mat_化神_1_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的凤羽"
      },
      {
        "id": "mat_化神_1_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的玄天玉"
      },
      {
        "id": "mat_化神_1_混沌",
        "name": "混沌之心",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的混沌之心"
      }
    ],
    "expReward": {
      "min": 33,
      "max": 62
    },
    "goldReward": {
      "min": 22,
      "max": 41
    },
    "background": "你踏入了万仞西剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_01_03",
    "name": "熔岩南火山",
    "icon": "Flame",
    "description": "位于化神界的熔岩南火山，适合化神1层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 1,
    "staminaCost": 14,
    "difficulty": "nightmare",
    "recommendedPower": 608,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_1_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在熔岩南火山中获得的神铁"
      },
      {
        "id": "mat_化神_1_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在熔岩南火山中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 33,
      "max": 62
    },
    "goldReward": {
      "min": 22,
      "max": 41
    },
    "background": "你踏入了熔岩南火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_02_00",
    "name": "雷霆崖顶",
    "icon": "Zap",
    "description": "位于化神界的雷霆崖顶，适合化神2层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 2,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 340,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_2_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在雷霆崖顶中获得的神铁"
      },
      {
        "id": "mat_化神_2_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在雷霆崖顶中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 35,
      "max": 66
    },
    "goldReward": {
      "min": 23,
      "max": 44
    },
    "background": "你踏入了雷霆崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_02_01",
    "name": "深渊东裂隙",
    "icon": "Orbit",
    "description": "位于化神界的深渊东裂隙，适合化神2层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 2,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 442,
    "enemies": [
      "demon_lord",
      "void_walker"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_2_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在深渊东裂隙中获得的神铁"
      },
      {
        "id": "mat_化神_2_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在深渊东裂隙中获得的凤羽"
      },
      {
        "id": "mat_化神_2_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在深渊东裂隙中获得的玄天玉"
      }
    ],
    "expReward": {
      "min": 35,
      "max": 66
    },
    "goldReward": {
      "min": 23,
      "max": 44
    },
    "background": "你踏入了深渊东裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_02_02",
    "name": "幽暗西洞穴",
    "icon": "Mountain",
    "description": "位于化神界的幽暗西洞穴，适合化神2层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 2,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 544,
    "enemies": [
      "cave_bat",
      "rock_golem",
      "shadow_snake"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_2_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的神铁"
      },
      {
        "id": "mat_化神_2_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的凤羽"
      },
      {
        "id": "mat_化神_2_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的玄天玉"
      },
      {
        "id": "mat_化神_2_混沌",
        "name": "混沌之心",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的混沌之心"
      }
    ],
    "expReward": {
      "min": 35,
      "max": 66
    },
    "goldReward": {
      "min": 23,
      "max": 44
    },
    "background": "你踏入了幽暗西洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_02_03",
    "name": "血月南祭坛",
    "icon": "Skull",
    "description": "位于化神界的血月南祭坛，适合化神2层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 2,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 646,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_2_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在血月南祭坛中获得的神铁"
      },
      {
        "id": "mat_化神_2_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在血月南祭坛中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 35,
      "max": 66
    },
    "goldReward": {
      "min": 23,
      "max": 44
    },
    "background": "你踏入了血月南祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_03_00",
    "name": "冰封雪原",
    "icon": "Snowflake",
    "description": "位于化神界的冰封雪原，适合化神3层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 3,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 360,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_3_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在冰封雪原中获得的神铁"
      },
      {
        "id": "mat_化神_3_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在冰封雪原中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 37,
      "max": 70
    },
    "goldReward": {
      "min": 25,
      "max": 46
    },
    "background": "你踏入了冰封雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_03_01",
    "name": "碧波东龙宫",
    "icon": "Droplets",
    "description": "位于化神界的碧波东龙宫，适合化神3层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 3,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 468,
    "enemies": [
      "water_serpent",
      "coral_guardian"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_3_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在碧波东龙宫中获得的神铁"
      },
      {
        "id": "mat_化神_3_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在碧波东龙宫中获得的凤羽"
      },
      {
        "id": "mat_化神_3_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在碧波东龙宫中获得的玄天玉"
      }
    ],
    "expReward": {
      "min": 37,
      "max": 70
    },
    "goldReward": {
      "min": 25,
      "max": 46
    },
    "background": "你踏入了碧波东龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_03_02",
    "name": "天界西遗迹",
    "icon": "Star",
    "description": "位于化神界的天界西遗迹，适合化神3层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 3,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 576,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith",
      "celestial_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_3_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的神铁"
      },
      {
        "id": "mat_化神_3_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的凤羽"
      },
      {
        "id": "mat_化神_3_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的玄天玉"
      },
      {
        "id": "mat_化神_3_混沌",
        "name": "混沌之心",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的混沌之心"
      }
    ],
    "expReward": {
      "min": 37,
      "max": 70
    },
    "goldReward": {
      "min": 25,
      "max": 46
    },
    "background": "你踏入了天界西遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_03_03",
    "name": "迷雾南森林",
    "icon": "Swords",
    "description": "位于化神界的迷雾南森林，适合化神3层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 3,
    "staminaCost": 15,
    "difficulty": "nightmare",
    "recommendedPower": 684,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_3_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在迷雾南森林中获得的神铁"
      },
      {
        "id": "mat_化神_3_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在迷雾南森林中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 37,
      "max": 70
    },
    "goldReward": {
      "min": 25,
      "max": 46
    },
    "background": "你踏入了迷雾南森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_04_00",
    "name": "翠竹幽谷",
    "icon": "Leaf",
    "description": "位于化神界的翠竹幽谷，适合化神4层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 4,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 380,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_4_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在翠竹幽谷中获得的神铁"
      },
      {
        "id": "mat_化神_4_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在翠竹幽谷中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 39,
      "max": 74
    },
    "goldReward": {
      "min": 26,
      "max": 49
    },
    "background": "你踏入了翠竹幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_04_01",
    "name": "荒芜东沙漠",
    "icon": "Wind",
    "description": "位于化神界的荒芜东沙漠，适合化神4层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 4,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 494,
    "enemies": [
      "sand_worm",
      "desert_scorpion"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_4_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在荒芜东沙漠中获得的神铁"
      },
      {
        "id": "mat_化神_4_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在荒芜东沙漠中获得的凤羽"
      },
      {
        "id": "mat_化神_4_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在荒芜东沙漠中获得的玄天玉"
      }
    ],
    "expReward": {
      "min": 39,
      "max": 74
    },
    "goldReward": {
      "min": 26,
      "max": 49
    },
    "background": "你踏入了荒芜东沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_04_02",
    "name": "万仞西剑峰",
    "icon": "Sword",
    "description": "位于化神界的万仞西剑峰，适合化神4层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 4,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 608,
    "enemies": [
      "sword_spirit",
      "wind_blade",
      "stone_warrior"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_4_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的神铁"
      },
      {
        "id": "mat_化神_4_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的凤羽"
      },
      {
        "id": "mat_化神_4_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的玄天玉"
      },
      {
        "id": "mat_化神_4_混沌",
        "name": "混沌之心",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的混沌之心"
      }
    ],
    "expReward": {
      "min": 39,
      "max": 74
    },
    "goldReward": {
      "min": 26,
      "max": 49
    },
    "background": "你踏入了万仞西剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_04_03",
    "name": "熔岩南火山",
    "icon": "Flame",
    "description": "位于化神界的熔岩南火山，适合化神4层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 4,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 722,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_4_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在熔岩南火山中获得的神铁"
      },
      {
        "id": "mat_化神_4_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在熔岩南火山中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 39,
      "max": 74
    },
    "goldReward": {
      "min": 26,
      "max": 49
    },
    "background": "你踏入了熔岩南火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_05_00",
    "name": "雷霆崖顶",
    "icon": "Zap",
    "description": "位于化神界的雷霆崖顶，适合化神5层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 5,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 400,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_5_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在雷霆崖顶中获得的神铁"
      },
      {
        "id": "mat_化神_5_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在雷霆崖顶中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 78
    },
    "goldReward": {
      "min": 28,
      "max": 52
    },
    "background": "你踏入了雷霆崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_05_01",
    "name": "深渊东裂隙",
    "icon": "Orbit",
    "description": "位于化神界的深渊东裂隙，适合化神5层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 5,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 520,
    "enemies": [
      "demon_lord",
      "void_walker"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_5_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在深渊东裂隙中获得的神铁"
      },
      {
        "id": "mat_化神_5_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在深渊东裂隙中获得的凤羽"
      },
      {
        "id": "mat_化神_5_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在深渊东裂隙中获得的玄天玉"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 78
    },
    "goldReward": {
      "min": 28,
      "max": 52
    },
    "background": "你踏入了深渊东裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_05_02",
    "name": "幽暗西洞穴",
    "icon": "Mountain",
    "description": "位于化神界的幽暗西洞穴，适合化神5层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 5,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 640,
    "enemies": [
      "cave_bat",
      "rock_golem",
      "shadow_snake"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_5_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的神铁"
      },
      {
        "id": "mat_化神_5_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的凤羽"
      },
      {
        "id": "mat_化神_5_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的玄天玉"
      },
      {
        "id": "mat_化神_5_混沌",
        "name": "混沌之心",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的混沌之心"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 78
    },
    "goldReward": {
      "min": 28,
      "max": 52
    },
    "background": "你踏入了幽暗西洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_05_03",
    "name": "血月南祭坛",
    "icon": "Skull",
    "description": "位于化神界的血月南祭坛，适合化神5层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 5,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 760,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_5_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在血月南祭坛中获得的神铁"
      },
      {
        "id": "mat_化神_5_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在血月南祭坛中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 78
    },
    "goldReward": {
      "min": 28,
      "max": 52
    },
    "background": "你踏入了血月南祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_06_00",
    "name": "冰封雪原",
    "icon": "Snowflake",
    "description": "位于化神界的冰封雪原，适合化神6层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 6,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 420,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_6_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在冰封雪原中获得的神铁"
      },
      {
        "id": "mat_化神_6_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在冰封雪原中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 81
    },
    "goldReward": {
      "min": 29,
      "max": 54
    },
    "background": "你踏入了冰封雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_06_01",
    "name": "碧波东龙宫",
    "icon": "Droplets",
    "description": "位于化神界的碧波东龙宫，适合化神6层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 6,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 546,
    "enemies": [
      "water_serpent",
      "coral_guardian"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_6_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在碧波东龙宫中获得的神铁"
      },
      {
        "id": "mat_化神_6_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在碧波东龙宫中获得的凤羽"
      },
      {
        "id": "mat_化神_6_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在碧波东龙宫中获得的玄天玉"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 81
    },
    "goldReward": {
      "min": 29,
      "max": 54
    },
    "background": "你踏入了碧波东龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_06_02",
    "name": "天界西遗迹",
    "icon": "Star",
    "description": "位于化神界的天界西遗迹，适合化神6层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 6,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 672,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith",
      "celestial_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_6_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的神铁"
      },
      {
        "id": "mat_化神_6_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的凤羽"
      },
      {
        "id": "mat_化神_6_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的玄天玉"
      },
      {
        "id": "mat_化神_6_混沌",
        "name": "混沌之心",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的混沌之心"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 81
    },
    "goldReward": {
      "min": 29,
      "max": 54
    },
    "background": "你踏入了天界西遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_06_03",
    "name": "迷雾南森林",
    "icon": "Swords",
    "description": "位于化神界的迷雾南森林，适合化神6层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 6,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 798,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_6_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在迷雾南森林中获得的神铁"
      },
      {
        "id": "mat_化神_6_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在迷雾南森林中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 81
    },
    "goldReward": {
      "min": 29,
      "max": 54
    },
    "background": "你踏入了迷雾南森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_07_00",
    "name": "翠竹幽谷",
    "icon": "Leaf",
    "description": "位于化神界的翠竹幽谷，适合化神7层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 7,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 440,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_7_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在翠竹幽谷中获得的神铁"
      },
      {
        "id": "mat_化神_7_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在翠竹幽谷中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 85
    },
    "goldReward": {
      "min": 30,
      "max": 57
    },
    "background": "你踏入了翠竹幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_07_01",
    "name": "荒芜东沙漠",
    "icon": "Wind",
    "description": "位于化神界的荒芜东沙漠，适合化神7层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 7,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 572,
    "enemies": [
      "sand_worm",
      "desert_scorpion"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_7_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在荒芜东沙漠中获得的神铁"
      },
      {
        "id": "mat_化神_7_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在荒芜东沙漠中获得的凤羽"
      },
      {
        "id": "mat_化神_7_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在荒芜东沙漠中获得的玄天玉"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 85
    },
    "goldReward": {
      "min": 30,
      "max": 57
    },
    "background": "你踏入了荒芜东沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_07_02",
    "name": "万仞西剑峰",
    "icon": "Sword",
    "description": "位于化神界的万仞西剑峰，适合化神7层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 7,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 704,
    "enemies": [
      "sword_spirit",
      "wind_blade",
      "stone_warrior"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_7_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的神铁"
      },
      {
        "id": "mat_化神_7_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的凤羽"
      },
      {
        "id": "mat_化神_7_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的玄天玉"
      },
      {
        "id": "mat_化神_7_混沌",
        "name": "混沌之心",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在万仞西剑峰中获得的混沌之心"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 85
    },
    "goldReward": {
      "min": 30,
      "max": 57
    },
    "background": "你踏入了万仞西剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_07_03",
    "name": "熔岩南火山",
    "icon": "Flame",
    "description": "位于化神界的熔岩南火山，适合化神7层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 7,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 836,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_化神_7_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在熔岩南火山中获得的神铁"
      },
      {
        "id": "mat_化神_7_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在熔岩南火山中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 85
    },
    "goldReward": {
      "min": 30,
      "max": 57
    },
    "background": "你踏入了熔岩南火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_08_00",
    "name": "雷霆崖顶",
    "icon": "Zap",
    "description": "位于化神界的雷霆崖顶，适合化神8层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 8,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 459,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_8_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在雷霆崖顶中获得的神铁"
      },
      {
        "id": "mat_化神_8_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在雷霆崖顶中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 48,
      "max": 89
    },
    "goldReward": {
      "min": 32,
      "max": 59
    },
    "background": "你踏入了雷霆崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_08_01",
    "name": "深渊东裂隙",
    "icon": "Orbit",
    "description": "位于化神界的深渊东裂隙，适合化神8层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 8,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 598,
    "enemies": [
      "demon_lord",
      "void_walker"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_8_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在深渊东裂隙中获得的神铁"
      },
      {
        "id": "mat_化神_8_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在深渊东裂隙中获得的凤羽"
      },
      {
        "id": "mat_化神_8_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在深渊东裂隙中获得的玄天玉"
      }
    ],
    "expReward": {
      "min": 48,
      "max": 89
    },
    "goldReward": {
      "min": 32,
      "max": 59
    },
    "background": "你踏入了深渊东裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_08_02",
    "name": "幽暗西洞穴",
    "icon": "Mountain",
    "description": "位于化神界的幽暗西洞穴，适合化神8层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 8,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 736,
    "enemies": [
      "cave_bat",
      "rock_golem",
      "shadow_snake"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_8_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的神铁"
      },
      {
        "id": "mat_化神_8_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的凤羽"
      },
      {
        "id": "mat_化神_8_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的玄天玉"
      },
      {
        "id": "mat_化神_8_混沌",
        "name": "混沌之心",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在幽暗西洞穴中获得的混沌之心"
      }
    ],
    "expReward": {
      "min": 48,
      "max": 89
    },
    "goldReward": {
      "min": 32,
      "max": 59
    },
    "background": "你踏入了幽暗西洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_08_03",
    "name": "血月南祭坛",
    "icon": "Skull",
    "description": "位于化神界的血月南祭坛，适合化神8层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 8,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 873,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_化神_8_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在血月南祭坛中获得的神铁"
      },
      {
        "id": "mat_化神_8_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在血月南祭坛中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 48,
      "max": 89
    },
    "goldReward": {
      "min": 32,
      "max": 59
    },
    "background": "你踏入了血月南祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_09_00",
    "name": "冰封雪原",
    "icon": "Snowflake",
    "description": "位于化神界的冰封雪原，适合化神9层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 9,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 480,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_9_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在冰封雪原中获得的神铁"
      },
      {
        "id": "mat_化神_9_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.38,
        "description": "在冰封雪原中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 50,
      "max": 93
    },
    "goldReward": {
      "min": 33,
      "max": 62
    },
    "background": "你踏入了冰封雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_09_01",
    "name": "碧波东龙宫",
    "icon": "Droplets",
    "description": "位于化神界的碧波东龙宫，适合化神9层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 9,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 624,
    "enemies": [
      "water_serpent",
      "coral_guardian"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_9_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在碧波东龙宫中获得的神铁"
      },
      {
        "id": "mat_化神_9_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在碧波东龙宫中获得的凤羽"
      },
      {
        "id": "mat_化神_9_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.33,
        "description": "在碧波东龙宫中获得的玄天玉"
      }
    ],
    "expReward": {
      "min": 50,
      "max": 93
    },
    "goldReward": {
      "min": 33,
      "max": 62
    },
    "background": "你踏入了碧波东龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_09_02",
    "name": "天界西遗迹",
    "icon": "Star",
    "description": "位于化神界的天界西遗迹，适合化神9层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 9,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 768,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith",
      "celestial_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_9_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的神铁"
      },
      {
        "id": "mat_化神_9_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的凤羽"
      },
      {
        "id": "mat_化神_9_玄天",
        "name": "玄天玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的玄天玉"
      },
      {
        "id": "mat_化神_9_混沌",
        "name": "混沌之心",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.28,
        "description": "在天界西遗迹中获得的混沌之心"
      }
    ],
    "expReward": {
      "min": 50,
      "max": 93
    },
    "goldReward": {
      "min": 33,
      "max": 62
    },
    "background": "你踏入了天界西遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_化神_09_03",
    "name": "迷雾南森林",
    "icon": "Swords",
    "description": "位于化神界的迷雾南森林，适合化神9层修士历练。",
    "requiredRealm": "化神",
    "requiredRealmLevel": 9,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 912,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_化神_9_神铁",
        "name": "神铁",
        "icon": "剑",
        "type": "material",
        "quality": "epic",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在迷雾南森林中获得的神铁"
      },
      {
        "id": "mat_化神_9_凤羽",
        "name": "凤羽",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.23,
        "description": "在迷雾南森林中获得的凤羽"
      }
    ],
    "expReward": {
      "min": 50,
      "max": 93
    },
    "goldReward": {
      "min": 33,
      "max": 62
    },
    "background": "你踏入了迷雾南森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_01_00",
    "name": "碧波龙宫",
    "icon": "Droplets",
    "description": "位于渡劫界的碧波龙宫，适合渡劫1层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 1,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 370,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_1_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在碧波龙宫中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_1_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在碧波龙宫中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 38,
      "max": 71
    },
    "goldReward": {
      "min": 25,
      "max": 48
    },
    "background": "你踏入了碧波龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_01_01",
    "name": "天界东遗迹",
    "icon": "Star",
    "description": "位于渡劫界的天界东遗迹，适合渡劫1层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 1,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 481,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_1_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在天界东遗迹中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_1_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在天界东遗迹中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_1_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在天界东遗迹中获得的天机丝"
      }
    ],
    "expReward": {
      "min": 38,
      "max": 71
    },
    "goldReward": {
      "min": 25,
      "max": 48
    },
    "background": "你踏入了天界东遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_01_02",
    "name": "迷雾西森林",
    "icon": "Swords",
    "description": "位于渡劫界的迷雾西森林，适合渡劫1层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 1,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 592,
    "enemies": [
      "slime",
      "wild_wolf",
      "forest_spider"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_1_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_1_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_1_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的天机丝"
      },
      {
        "id": "mat_渡劫_1_乾坤",
        "name": "乾坤玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的乾坤玉"
      }
    ],
    "expReward": {
      "min": 38,
      "max": 71
    },
    "goldReward": {
      "min": 25,
      "max": 48
    },
    "background": "你踏入了迷雾西森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_01_03",
    "name": "翠竹南幽谷",
    "icon": "Leaf",
    "description": "位于渡劫界的翠竹南幽谷，适合渡劫1层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 1,
    "staminaCost": 16,
    "difficulty": "nightmare",
    "recommendedPower": 703,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_1_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在翠竹南幽谷中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_1_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在翠竹南幽谷中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 38,
      "max": 71
    },
    "goldReward": {
      "min": 25,
      "max": 48
    },
    "background": "你踏入了翠竹南幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_02_00",
    "name": "荒芜沙漠",
    "icon": "Wind",
    "description": "位于渡劫界的荒芜沙漠，适合渡劫2层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 2,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 390,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_2_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在荒芜沙漠中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_2_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在荒芜沙漠中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 40,
      "max": 75
    },
    "goldReward": {
      "min": 27,
      "max": 50
    },
    "background": "你踏入了荒芜沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_02_01",
    "name": "万仞东剑峰",
    "icon": "Sword",
    "description": "位于渡劫界的万仞东剑峰，适合渡劫2层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 2,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 507,
    "enemies": [
      "sword_spirit",
      "wind_blade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_2_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在万仞东剑峰中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_2_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在万仞东剑峰中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_2_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在万仞东剑峰中获得的天机丝"
      }
    ],
    "expReward": {
      "min": 40,
      "max": 75
    },
    "goldReward": {
      "min": 27,
      "max": 50
    },
    "background": "你踏入了万仞东剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_02_02",
    "name": "熔岩西火山",
    "icon": "Flame",
    "description": "位于渡劫界的熔岩西火山，适合渡劫2层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 2,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 624,
    "enemies": [
      "fire_elemental",
      "lava_golem",
      "phoenix_chick"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_2_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_2_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_2_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的天机丝"
      },
      {
        "id": "mat_渡劫_2_乾坤",
        "name": "乾坤玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的乾坤玉"
      }
    ],
    "expReward": {
      "min": 40,
      "max": 75
    },
    "goldReward": {
      "min": 27,
      "max": 50
    },
    "background": "你踏入了熔岩西火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_02_03",
    "name": "雷霆南崖顶",
    "icon": "Zap",
    "description": "位于渡劫界的雷霆南崖顶，适合渡劫2层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 2,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 741,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_2_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在雷霆南崖顶中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_2_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在雷霆南崖顶中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 40,
      "max": 75
    },
    "goldReward": {
      "min": 27,
      "max": 50
    },
    "background": "你踏入了雷霆南崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_03_00",
    "name": "深渊裂隙",
    "icon": "Orbit",
    "description": "位于渡劫界的深渊裂隙，适合渡劫3层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 3,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 409,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_3_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在深渊裂隙中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_3_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在深渊裂隙中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 79
    },
    "goldReward": {
      "min": 28,
      "max": 53
    },
    "background": "你踏入了深渊裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_03_01",
    "name": "幽暗东洞穴",
    "icon": "Mountain",
    "description": "位于渡劫界的幽暗东洞穴，适合渡劫3层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 3,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 533,
    "enemies": [
      "cave_bat",
      "rock_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_3_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在幽暗东洞穴中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_3_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在幽暗东洞穴中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_3_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在幽暗东洞穴中获得的天机丝"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 79
    },
    "goldReward": {
      "min": 28,
      "max": 53
    },
    "background": "你踏入了幽暗东洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_03_02",
    "name": "血月西祭坛",
    "icon": "Skull",
    "description": "位于渡劫界的血月西祭坛，适合渡劫3层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 3,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 656,
    "enemies": [
      "blood_shade",
      "dark_cultist",
      "nightmare_weaver"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_3_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_3_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_3_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的天机丝"
      },
      {
        "id": "mat_渡劫_3_乾坤",
        "name": "乾坤玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的乾坤玉"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 79
    },
    "goldReward": {
      "min": 28,
      "max": 53
    },
    "background": "你踏入了血月西祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_03_03",
    "name": "冰封南雪原",
    "icon": "Snowflake",
    "description": "位于渡劫界的冰封南雪原，适合渡劫3层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 3,
    "staminaCost": 17,
    "difficulty": "nightmare",
    "recommendedPower": 778,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_3_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在冰封南雪原中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_3_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在冰封南雪原中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 42,
      "max": 79
    },
    "goldReward": {
      "min": 28,
      "max": 53
    },
    "background": "你踏入了冰封南雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_04_00",
    "name": "碧波龙宫",
    "icon": "Droplets",
    "description": "位于渡劫界的碧波龙宫，适合渡劫4层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 4,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 430,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_4_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在碧波龙宫中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_4_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在碧波龙宫中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 83
    },
    "goldReward": {
      "min": 30,
      "max": 55
    },
    "background": "你踏入了碧波龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_04_01",
    "name": "天界东遗迹",
    "icon": "Star",
    "description": "位于渡劫界的天界东遗迹，适合渡劫4层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 4,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 559,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_4_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在天界东遗迹中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_4_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在天界东遗迹中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_4_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在天界东遗迹中获得的天机丝"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 83
    },
    "goldReward": {
      "min": 30,
      "max": 55
    },
    "background": "你踏入了天界东遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_04_02",
    "name": "迷雾西森林",
    "icon": "Swords",
    "description": "位于渡劫界的迷雾西森林，适合渡劫4层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 4,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 688,
    "enemies": [
      "slime",
      "wild_wolf",
      "forest_spider"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_4_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_4_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_4_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的天机丝"
      },
      {
        "id": "mat_渡劫_4_乾坤",
        "name": "乾坤玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的乾坤玉"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 83
    },
    "goldReward": {
      "min": 30,
      "max": 55
    },
    "background": "你踏入了迷雾西森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_04_03",
    "name": "翠竹南幽谷",
    "icon": "Leaf",
    "description": "位于渡劫界的翠竹南幽谷，适合渡劫4层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 4,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 817,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_4_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在翠竹南幽谷中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_4_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在翠竹南幽谷中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 83
    },
    "goldReward": {
      "min": 30,
      "max": 55
    },
    "background": "你踏入了翠竹南幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_05_00",
    "name": "荒芜沙漠",
    "icon": "Wind",
    "description": "位于渡劫界的荒芜沙漠，适合渡劫5层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 5,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 450,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_5_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在荒芜沙漠中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_5_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在荒芜沙漠中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 87
    },
    "goldReward": {
      "min": 31,
      "max": 58
    },
    "background": "你踏入了荒芜沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_05_01",
    "name": "万仞东剑峰",
    "icon": "Sword",
    "description": "位于渡劫界的万仞东剑峰，适合渡劫5层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 5,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 585,
    "enemies": [
      "sword_spirit",
      "wind_blade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_5_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在万仞东剑峰中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_5_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在万仞东剑峰中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_5_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在万仞东剑峰中获得的天机丝"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 87
    },
    "goldReward": {
      "min": 31,
      "max": 58
    },
    "background": "你踏入了万仞东剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_05_02",
    "name": "熔岩西火山",
    "icon": "Flame",
    "description": "位于渡劫界的熔岩西火山，适合渡劫5层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 5,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 720,
    "enemies": [
      "fire_elemental",
      "lava_golem",
      "phoenix_chick"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_5_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_5_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_5_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的天机丝"
      },
      {
        "id": "mat_渡劫_5_乾坤",
        "name": "乾坤玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的乾坤玉"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 87
    },
    "goldReward": {
      "min": 31,
      "max": 58
    },
    "background": "你踏入了熔岩西火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_05_03",
    "name": "雷霆南崖顶",
    "icon": "Zap",
    "description": "位于渡劫界的雷霆南崖顶，适合渡劫5层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 5,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 855,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_5_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在雷霆南崖顶中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_5_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在雷霆南崖顶中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 87
    },
    "goldReward": {
      "min": 31,
      "max": 58
    },
    "background": "你踏入了雷霆南崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_06_00",
    "name": "深渊裂隙",
    "icon": "Orbit",
    "description": "位于渡劫界的深渊裂隙，适合渡劫6层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 6,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 470,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_6_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在深渊裂隙中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_6_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在深渊裂隙中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 49,
      "max": 91
    },
    "goldReward": {
      "min": 32,
      "max": 61
    },
    "background": "你踏入了深渊裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_06_01",
    "name": "幽暗东洞穴",
    "icon": "Mountain",
    "description": "位于渡劫界的幽暗东洞穴，适合渡劫6层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 6,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 611,
    "enemies": [
      "cave_bat",
      "rock_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_6_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在幽暗东洞穴中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_6_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在幽暗东洞穴中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_6_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在幽暗东洞穴中获得的天机丝"
      }
    ],
    "expReward": {
      "min": 49,
      "max": 91
    },
    "goldReward": {
      "min": 32,
      "max": 61
    },
    "background": "你踏入了幽暗东洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_06_02",
    "name": "血月西祭坛",
    "icon": "Skull",
    "description": "位于渡劫界的血月西祭坛，适合渡劫6层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 6,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 752,
    "enemies": [
      "blood_shade",
      "dark_cultist",
      "nightmare_weaver"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_6_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_6_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_6_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的天机丝"
      },
      {
        "id": "mat_渡劫_6_乾坤",
        "name": "乾坤玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的乾坤玉"
      }
    ],
    "expReward": {
      "min": 49,
      "max": 91
    },
    "goldReward": {
      "min": 32,
      "max": 61
    },
    "background": "你踏入了血月西祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_06_03",
    "name": "冰封南雪原",
    "icon": "Snowflake",
    "description": "位于渡劫界的冰封南雪原，适合渡劫6层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 6,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 893,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_6_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在冰封南雪原中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_6_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在冰封南雪原中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 49,
      "max": 91
    },
    "goldReward": {
      "min": 32,
      "max": 61
    },
    "background": "你踏入了冰封南雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_07_00",
    "name": "碧波龙宫",
    "icon": "Droplets",
    "description": "位于渡劫界的碧波龙宫，适合渡劫7层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 7,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 490,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_7_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在碧波龙宫中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_7_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在碧波龙宫中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 51,
      "max": 94
    },
    "goldReward": {
      "min": 34,
      "max": 63
    },
    "background": "你踏入了碧波龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_07_01",
    "name": "天界东遗迹",
    "icon": "Star",
    "description": "位于渡劫界的天界东遗迹，适合渡劫7层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 7,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 637,
    "enemies": [
      "ancient_guardian",
      "spirit_wraith"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_7_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在天界东遗迹中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_7_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在天界东遗迹中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_7_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在天界东遗迹中获得的天机丝"
      }
    ],
    "expReward": {
      "min": 51,
      "max": 94
    },
    "goldReward": {
      "min": 34,
      "max": 63
    },
    "background": "你踏入了天界东遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_07_02",
    "name": "迷雾西森林",
    "icon": "Swords",
    "description": "位于渡劫界的迷雾西森林，适合渡劫7层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 7,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 784,
    "enemies": [
      "slime",
      "wild_wolf",
      "forest_spider"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_7_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_7_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_7_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的天机丝"
      },
      {
        "id": "mat_渡劫_7_乾坤",
        "name": "乾坤玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在迷雾西森林中获得的乾坤玉"
      }
    ],
    "expReward": {
      "min": 51,
      "max": 94
    },
    "goldReward": {
      "min": 34,
      "max": 63
    },
    "background": "你踏入了迷雾西森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_07_03",
    "name": "翠竹南幽谷",
    "icon": "Leaf",
    "description": "位于渡劫界的翠竹南幽谷，适合渡劫7层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 7,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 931,
    "enemies": [
      "bamboo_spirit"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_渡劫_7_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在翠竹南幽谷中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_7_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在翠竹南幽谷中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 51,
      "max": 94
    },
    "goldReward": {
      "min": 34,
      "max": 63
    },
    "background": "你踏入了翠竹南幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_08_00",
    "name": "荒芜沙漠",
    "icon": "Wind",
    "description": "位于渡劫界的荒芜沙漠，适合渡劫8层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 8,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 509,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_8_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在荒芜沙漠中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_8_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在荒芜沙漠中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 53,
      "max": 98
    },
    "goldReward": {
      "min": 35,
      "max": 66
    },
    "background": "你踏入了荒芜沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_08_01",
    "name": "万仞东剑峰",
    "icon": "Sword",
    "description": "位于渡劫界的万仞东剑峰，适合渡劫8层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 8,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 663,
    "enemies": [
      "sword_spirit",
      "wind_blade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_8_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在万仞东剑峰中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_8_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在万仞东剑峰中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_8_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在万仞东剑峰中获得的天机丝"
      }
    ],
    "expReward": {
      "min": 53,
      "max": 98
    },
    "goldReward": {
      "min": 35,
      "max": 66
    },
    "background": "你踏入了万仞东剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_08_02",
    "name": "熔岩西火山",
    "icon": "Flame",
    "description": "位于渡劫界的熔岩西火山，适合渡劫8层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 8,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 816,
    "enemies": [
      "fire_elemental",
      "lava_golem",
      "phoenix_chick"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_8_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_8_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_8_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的天机丝"
      },
      {
        "id": "mat_渡劫_8_乾坤",
        "name": "乾坤玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在熔岩西火山中获得的乾坤玉"
      }
    ],
    "expReward": {
      "min": 53,
      "max": 98
    },
    "goldReward": {
      "min": 35,
      "max": 66
    },
    "background": "你踏入了熔岩西火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_08_03",
    "name": "雷霆南崖顶",
    "icon": "Zap",
    "description": "位于渡劫界的雷霆南崖顶，适合渡劫8层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 8,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 968,
    "enemies": [
      "thunder_bird"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_渡劫_8_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在雷霆南崖顶中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_8_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在雷霆南崖顶中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 53,
      "max": 98
    },
    "goldReward": {
      "min": 35,
      "max": 66
    },
    "background": "你踏入了雷霆南崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_09_00",
    "name": "深渊裂隙",
    "icon": "Orbit",
    "description": "位于渡劫界的深渊裂隙，适合渡劫9层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 9,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 530,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_9_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在深渊裂隙中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_9_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.35,
        "description": "在深渊裂隙中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 55,
      "max": 102
    },
    "goldReward": {
      "min": 37,
      "max": 68
    },
    "background": "你踏入了深渊裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_09_01",
    "name": "幽暗东洞穴",
    "icon": "Mountain",
    "description": "位于渡劫界的幽暗东洞穴，适合渡劫9层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 9,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 689,
    "enemies": [
      "cave_bat",
      "rock_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_9_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在幽暗东洞穴中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_9_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在幽暗东洞穴中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_9_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.3,
        "description": "在幽暗东洞穴中获得的天机丝"
      }
    ],
    "expReward": {
      "min": 55,
      "max": 102
    },
    "goldReward": {
      "min": 37,
      "max": 68
    },
    "background": "你踏入了幽暗东洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_09_02",
    "name": "血月西祭坛",
    "icon": "Skull",
    "description": "位于渡劫界的血月西祭坛，适合渡劫9层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 9,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 848,
    "enemies": [
      "blood_shade",
      "dark_cultist",
      "nightmare_weaver"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_9_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_9_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的涅槃石"
      },
      {
        "id": "mat_渡劫_9_天机",
        "name": "天机丝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的天机丝"
      },
      {
        "id": "mat_渡劫_9_乾坤",
        "name": "乾坤玉",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.25,
        "description": "在血月西祭坛中获得的乾坤玉"
      }
    ],
    "expReward": {
      "min": 55,
      "max": 102
    },
    "goldReward": {
      "min": 37,
      "max": 68
    },
    "background": "你踏入了血月西祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_渡劫_09_03",
    "name": "冰封南雪原",
    "icon": "Snowflake",
    "description": "位于渡劫界的冰封南雪原，适合渡劫9层修士历练。",
    "requiredRealm": "渡劫",
    "requiredRealmLevel": 9,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 1007,
    "enemies": [
      "ice_wolf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_渡劫_9_雷劫",
        "name": "雷劫木",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在冰封南雪原中获得的雷劫木"
      },
      {
        "id": "mat_渡劫_9_涅槃",
        "name": "涅槃石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.2,
        "description": "在冰封南雪原中获得的涅槃石"
      }
    ],
    "expReward": {
      "min": 55,
      "max": 102
    },
    "goldReward": {
      "min": 37,
      "max": 68
    },
    "background": "你踏入了冰封南雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_01_00",
    "name": "幽暗洞穴",
    "icon": "Mountain",
    "description": "位于大乘界的幽暗洞穴，适合大乘1层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 1,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 420,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_1_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在幽暗洞穴中获得的仙灵液"
      },
      {
        "id": "mat_大乘_1_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在幽暗洞穴中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 81
    },
    "goldReward": {
      "min": 29,
      "max": 54
    },
    "background": "你踏入了幽暗洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_01_01",
    "name": "血月东祭坛",
    "icon": "Skull",
    "description": "位于大乘界的血月东祭坛，适合大乘1层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 1,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 546,
    "enemies": [
      "blood_shade",
      "dark_cultist"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_1_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在血月东祭坛中获得的仙灵液"
      },
      {
        "id": "mat_大乘_1_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在血月东祭坛中获得的混沌金石"
      },
      {
        "id": "mat_大乘_1_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在血月东祭坛中获得的天外陨铁"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 81
    },
    "goldReward": {
      "min": 29,
      "max": 54
    },
    "background": "你踏入了血月东祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_01_02",
    "name": "冰封西雪原",
    "icon": "Snowflake",
    "description": "位于大乘界的冰封西雪原，适合大乘1层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 1,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 672,
    "enemies": [
      "ice_wolf",
      "frost_giant",
      "snow_demon"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_1_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的仙灵液"
      },
      {
        "id": "mat_大乘_1_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的混沌金石"
      },
      {
        "id": "mat_大乘_1_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的天外陨铁"
      },
      {
        "id": "mat_大乘_1_万古",
        "name": "万古玄冰",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的万古玄冰"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 81
    },
    "goldReward": {
      "min": 29,
      "max": 54
    },
    "background": "你踏入了冰封西雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_01_03",
    "name": "碧波南龙宫",
    "icon": "Droplets",
    "description": "位于大乘界的碧波南龙宫，适合大乘1层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 1,
    "staminaCost": 18,
    "difficulty": "nightmare",
    "recommendedPower": 798,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_1_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在碧波南龙宫中获得的仙灵液"
      },
      {
        "id": "mat_大乘_1_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在碧波南龙宫中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 44,
      "max": 81
    },
    "goldReward": {
      "min": 29,
      "max": 54
    },
    "background": "你踏入了碧波南龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_02_00",
    "name": "天界遗迹",
    "icon": "Star",
    "description": "位于大乘界的天界遗迹，适合大乘2层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 2,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 440,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_2_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在天界遗迹中获得的仙灵液"
      },
      {
        "id": "mat_大乘_2_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在天界遗迹中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 85
    },
    "goldReward": {
      "min": 30,
      "max": 57
    },
    "background": "你踏入了天界遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_02_01",
    "name": "迷雾东森林",
    "icon": "Swords",
    "description": "位于大乘界的迷雾东森林，适合大乘2层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 2,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 572,
    "enemies": [
      "slime",
      "wild_wolf"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_2_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在迷雾东森林中获得的仙灵液"
      },
      {
        "id": "mat_大乘_2_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在迷雾东森林中获得的混沌金石"
      },
      {
        "id": "mat_大乘_2_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在迷雾东森林中获得的天外陨铁"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 85
    },
    "goldReward": {
      "min": 30,
      "max": 57
    },
    "background": "你踏入了迷雾东森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_02_02",
    "name": "翠竹西幽谷",
    "icon": "Leaf",
    "description": "位于大乘界的翠竹西幽谷，适合大乘2层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 2,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 704,
    "enemies": [
      "bamboo_spirit",
      "wood_elf",
      "violet_mist"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_2_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的仙灵液"
      },
      {
        "id": "mat_大乘_2_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的混沌金石"
      },
      {
        "id": "mat_大乘_2_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的天外陨铁"
      },
      {
        "id": "mat_大乘_2_万古",
        "name": "万古玄冰",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的万古玄冰"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 85
    },
    "goldReward": {
      "min": 30,
      "max": 57
    },
    "background": "你踏入了翠竹西幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_02_03",
    "name": "荒芜南沙漠",
    "icon": "Wind",
    "description": "位于大乘界的荒芜南沙漠，适合大乘2层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 2,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 836,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_2_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在荒芜南沙漠中获得的仙灵液"
      },
      {
        "id": "mat_大乘_2_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在荒芜南沙漠中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 46,
      "max": 85
    },
    "goldReward": {
      "min": 30,
      "max": 57
    },
    "background": "你踏入了荒芜南沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_03_00",
    "name": "万仞剑峰",
    "icon": "Sword",
    "description": "位于大乘界的万仞剑峰，适合大乘3层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 3,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 459,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_3_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在万仞剑峰中获得的仙灵液"
      },
      {
        "id": "mat_大乘_3_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在万仞剑峰中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 48,
      "max": 89
    },
    "goldReward": {
      "min": 32,
      "max": 59
    },
    "background": "你踏入了万仞剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_03_01",
    "name": "熔岩东火山",
    "icon": "Flame",
    "description": "位于大乘界的熔岩东火山，适合大乘3层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 3,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 598,
    "enemies": [
      "fire_elemental",
      "lava_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_3_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在熔岩东火山中获得的仙灵液"
      },
      {
        "id": "mat_大乘_3_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在熔岩东火山中获得的混沌金石"
      },
      {
        "id": "mat_大乘_3_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在熔岩东火山中获得的天外陨铁"
      }
    ],
    "expReward": {
      "min": 48,
      "max": 89
    },
    "goldReward": {
      "min": 32,
      "max": 59
    },
    "background": "你踏入了熔岩东火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_03_02",
    "name": "雷霆西崖顶",
    "icon": "Zap",
    "description": "位于大乘界的雷霆西崖顶，适合大乘3层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 3,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 736,
    "enemies": [
      "thunder_bird",
      "storm_elemental",
      "lightning_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_3_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的仙灵液"
      },
      {
        "id": "mat_大乘_3_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的混沌金石"
      },
      {
        "id": "mat_大乘_3_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的天外陨铁"
      },
      {
        "id": "mat_大乘_3_万古",
        "name": "万古玄冰",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的万古玄冰"
      }
    ],
    "expReward": {
      "min": 48,
      "max": 89
    },
    "goldReward": {
      "min": 32,
      "max": 59
    },
    "background": "你踏入了雷霆西崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_03_03",
    "name": "深渊南裂隙",
    "icon": "Orbit",
    "description": "位于大乘界的深渊南裂隙，适合大乘3层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 3,
    "staminaCost": 19,
    "difficulty": "nightmare",
    "recommendedPower": 873,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_3_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在深渊南裂隙中获得的仙灵液"
      },
      {
        "id": "mat_大乘_3_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在深渊南裂隙中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 48,
      "max": 89
    },
    "goldReward": {
      "min": 32,
      "max": 59
    },
    "background": "你踏入了深渊南裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_04_00",
    "name": "幽暗洞穴",
    "icon": "Mountain",
    "description": "位于大乘界的幽暗洞穴，适合大乘4层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 4,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 480,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_4_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在幽暗洞穴中获得的仙灵液"
      },
      {
        "id": "mat_大乘_4_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在幽暗洞穴中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 50,
      "max": 93
    },
    "goldReward": {
      "min": 33,
      "max": 62
    },
    "background": "你踏入了幽暗洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_04_01",
    "name": "血月东祭坛",
    "icon": "Skull",
    "description": "位于大乘界的血月东祭坛，适合大乘4层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 4,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 624,
    "enemies": [
      "blood_shade",
      "dark_cultist"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_4_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在血月东祭坛中获得的仙灵液"
      },
      {
        "id": "mat_大乘_4_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在血月东祭坛中获得的混沌金石"
      },
      {
        "id": "mat_大乘_4_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在血月东祭坛中获得的天外陨铁"
      }
    ],
    "expReward": {
      "min": 50,
      "max": 93
    },
    "goldReward": {
      "min": 33,
      "max": 62
    },
    "background": "你踏入了血月东祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_04_02",
    "name": "冰封西雪原",
    "icon": "Snowflake",
    "description": "位于大乘界的冰封西雪原，适合大乘4层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 4,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 768,
    "enemies": [
      "ice_wolf",
      "frost_giant",
      "snow_demon"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_4_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的仙灵液"
      },
      {
        "id": "mat_大乘_4_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的混沌金石"
      },
      {
        "id": "mat_大乘_4_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的天外陨铁"
      },
      {
        "id": "mat_大乘_4_万古",
        "name": "万古玄冰",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的万古玄冰"
      }
    ],
    "expReward": {
      "min": 50,
      "max": 93
    },
    "goldReward": {
      "min": 33,
      "max": 62
    },
    "background": "你踏入了冰封西雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_04_03",
    "name": "碧波南龙宫",
    "icon": "Droplets",
    "description": "位于大乘界的碧波南龙宫，适合大乘4层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 4,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 912,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_4_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在碧波南龙宫中获得的仙灵液"
      },
      {
        "id": "mat_大乘_4_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在碧波南龙宫中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 50,
      "max": 93
    },
    "goldReward": {
      "min": 33,
      "max": 62
    },
    "background": "你踏入了碧波南龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_05_00",
    "name": "天界遗迹",
    "icon": "Star",
    "description": "位于大乘界的天界遗迹，适合大乘5层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 5,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 500,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_5_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在天界遗迹中获得的仙灵液"
      },
      {
        "id": "mat_大乘_5_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在天界遗迹中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 52,
      "max": 97
    },
    "goldReward": {
      "min": 35,
      "max": 65
    },
    "background": "你踏入了天界遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_05_01",
    "name": "迷雾东森林",
    "icon": "Swords",
    "description": "位于大乘界的迷雾东森林，适合大乘5层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 5,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 650,
    "enemies": [
      "slime",
      "wild_wolf"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_5_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在迷雾东森林中获得的仙灵液"
      },
      {
        "id": "mat_大乘_5_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在迷雾东森林中获得的混沌金石"
      },
      {
        "id": "mat_大乘_5_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在迷雾东森林中获得的天外陨铁"
      }
    ],
    "expReward": {
      "min": 52,
      "max": 97
    },
    "goldReward": {
      "min": 35,
      "max": 65
    },
    "background": "你踏入了迷雾东森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_05_02",
    "name": "翠竹西幽谷",
    "icon": "Leaf",
    "description": "位于大乘界的翠竹西幽谷，适合大乘5层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 5,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 800,
    "enemies": [
      "bamboo_spirit",
      "wood_elf",
      "violet_mist"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_5_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的仙灵液"
      },
      {
        "id": "mat_大乘_5_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的混沌金石"
      },
      {
        "id": "mat_大乘_5_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的天外陨铁"
      },
      {
        "id": "mat_大乘_5_万古",
        "name": "万古玄冰",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的万古玄冰"
      }
    ],
    "expReward": {
      "min": 52,
      "max": 97
    },
    "goldReward": {
      "min": 35,
      "max": 65
    },
    "background": "你踏入了翠竹西幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_05_03",
    "name": "荒芜南沙漠",
    "icon": "Wind",
    "description": "位于大乘界的荒芜南沙漠，适合大乘5层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 5,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 950,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_5_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在荒芜南沙漠中获得的仙灵液"
      },
      {
        "id": "mat_大乘_5_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在荒芜南沙漠中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 52,
      "max": 97
    },
    "goldReward": {
      "min": 35,
      "max": 65
    },
    "background": "你踏入了荒芜南沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_06_00",
    "name": "万仞剑峰",
    "icon": "Sword",
    "description": "位于大乘界的万仞剑峰，适合大乘6层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 6,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 520,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_6_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在万仞剑峰中获得的仙灵液"
      },
      {
        "id": "mat_大乘_6_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在万仞剑峰中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 54,
      "max": 101
    },
    "goldReward": {
      "min": 36,
      "max": 67
    },
    "background": "你踏入了万仞剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_06_01",
    "name": "熔岩东火山",
    "icon": "Flame",
    "description": "位于大乘界的熔岩东火山，适合大乘6层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 6,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 676,
    "enemies": [
      "fire_elemental",
      "lava_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_6_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在熔岩东火山中获得的仙灵液"
      },
      {
        "id": "mat_大乘_6_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在熔岩东火山中获得的混沌金石"
      },
      {
        "id": "mat_大乘_6_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在熔岩东火山中获得的天外陨铁"
      }
    ],
    "expReward": {
      "min": 54,
      "max": 101
    },
    "goldReward": {
      "min": 36,
      "max": 67
    },
    "background": "你踏入了熔岩东火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_06_02",
    "name": "雷霆西崖顶",
    "icon": "Zap",
    "description": "位于大乘界的雷霆西崖顶，适合大乘6层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 6,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 832,
    "enemies": [
      "thunder_bird",
      "storm_elemental",
      "lightning_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_6_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的仙灵液"
      },
      {
        "id": "mat_大乘_6_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的混沌金石"
      },
      {
        "id": "mat_大乘_6_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的天外陨铁"
      },
      {
        "id": "mat_大乘_6_万古",
        "name": "万古玄冰",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的万古玄冰"
      }
    ],
    "expReward": {
      "min": 54,
      "max": 101
    },
    "goldReward": {
      "min": 36,
      "max": 67
    },
    "background": "你踏入了雷霆西崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_06_03",
    "name": "深渊南裂隙",
    "icon": "Orbit",
    "description": "位于大乘界的深渊南裂隙，适合大乘6层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 6,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 988,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_6_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在深渊南裂隙中获得的仙灵液"
      },
      {
        "id": "mat_大乘_6_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在深渊南裂隙中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 54,
      "max": 101
    },
    "goldReward": {
      "min": 36,
      "max": 67
    },
    "background": "你踏入了深渊南裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_07_00",
    "name": "幽暗洞穴",
    "icon": "Mountain",
    "description": "位于大乘界的幽暗洞穴，适合大乘7层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 7,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 540,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_7_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在幽暗洞穴中获得的仙灵液"
      },
      {
        "id": "mat_大乘_7_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在幽暗洞穴中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 56,
      "max": 105
    },
    "goldReward": {
      "min": 37,
      "max": 70
    },
    "background": "你踏入了幽暗洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_07_01",
    "name": "血月东祭坛",
    "icon": "Skull",
    "description": "位于大乘界的血月东祭坛，适合大乘7层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 7,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 702,
    "enemies": [
      "blood_shade",
      "dark_cultist"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_7_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在血月东祭坛中获得的仙灵液"
      },
      {
        "id": "mat_大乘_7_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在血月东祭坛中获得的混沌金石"
      },
      {
        "id": "mat_大乘_7_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在血月东祭坛中获得的天外陨铁"
      }
    ],
    "expReward": {
      "min": 56,
      "max": 105
    },
    "goldReward": {
      "min": 37,
      "max": 70
    },
    "background": "你踏入了血月东祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_07_02",
    "name": "冰封西雪原",
    "icon": "Snowflake",
    "description": "位于大乘界的冰封西雪原，适合大乘7层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 7,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 864,
    "enemies": [
      "ice_wolf",
      "frost_giant",
      "snow_demon"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_7_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的仙灵液"
      },
      {
        "id": "mat_大乘_7_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的混沌金石"
      },
      {
        "id": "mat_大乘_7_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的天外陨铁"
      },
      {
        "id": "mat_大乘_7_万古",
        "name": "万古玄冰",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在冰封西雪原中获得的万古玄冰"
      }
    ],
    "expReward": {
      "min": 56,
      "max": 105
    },
    "goldReward": {
      "min": 37,
      "max": 70
    },
    "background": "你踏入了冰封西雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_07_03",
    "name": "碧波南龙宫",
    "icon": "Droplets",
    "description": "位于大乘界的碧波南龙宫，适合大乘7层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 7,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 1026,
    "enemies": [
      "water_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_大乘_7_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在碧波南龙宫中获得的仙灵液"
      },
      {
        "id": "mat_大乘_7_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在碧波南龙宫中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 56,
      "max": 105
    },
    "goldReward": {
      "min": 37,
      "max": 70
    },
    "background": "你踏入了碧波南龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_08_00",
    "name": "天界遗迹",
    "icon": "Star",
    "description": "位于大乘界的天界遗迹，适合大乘8层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 8,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 560,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_8_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在天界遗迹中获得的仙灵液"
      },
      {
        "id": "mat_大乘_8_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在天界遗迹中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 58,
      "max": 109
    },
    "goldReward": {
      "min": 39,
      "max": 72
    },
    "background": "你踏入了天界遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_08_01",
    "name": "迷雾东森林",
    "icon": "Swords",
    "description": "位于大乘界的迷雾东森林，适合大乘8层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 8,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 728,
    "enemies": [
      "slime",
      "wild_wolf"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_8_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在迷雾东森林中获得的仙灵液"
      },
      {
        "id": "mat_大乘_8_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在迷雾东森林中获得的混沌金石"
      },
      {
        "id": "mat_大乘_8_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在迷雾东森林中获得的天外陨铁"
      }
    ],
    "expReward": {
      "min": 58,
      "max": 109
    },
    "goldReward": {
      "min": 39,
      "max": 72
    },
    "background": "你踏入了迷雾东森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_08_02",
    "name": "翠竹西幽谷",
    "icon": "Leaf",
    "description": "位于大乘界的翠竹西幽谷，适合大乘8层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 8,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 896,
    "enemies": [
      "bamboo_spirit",
      "wood_elf",
      "violet_mist"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_8_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的仙灵液"
      },
      {
        "id": "mat_大乘_8_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的混沌金石"
      },
      {
        "id": "mat_大乘_8_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的天外陨铁"
      },
      {
        "id": "mat_大乘_8_万古",
        "name": "万古玄冰",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在翠竹西幽谷中获得的万古玄冰"
      }
    ],
    "expReward": {
      "min": 58,
      "max": 109
    },
    "goldReward": {
      "min": 39,
      "max": 72
    },
    "background": "你踏入了翠竹西幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_08_03",
    "name": "荒芜南沙漠",
    "icon": "Wind",
    "description": "位于大乘界的荒芜南沙漠，适合大乘8层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 8,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 1064,
    "enemies": [
      "sand_worm"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_大乘_8_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在荒芜南沙漠中获得的仙灵液"
      },
      {
        "id": "mat_大乘_8_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在荒芜南沙漠中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 58,
      "max": 109
    },
    "goldReward": {
      "min": 39,
      "max": 72
    },
    "background": "你踏入了荒芜南沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_09_00",
    "name": "万仞剑峰",
    "icon": "Sword",
    "description": "位于大乘界的万仞剑峰，适合大乘9层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 9,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 580,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_9_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在万仞剑峰中获得的仙灵液"
      },
      {
        "id": "mat_大乘_9_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.32,
        "description": "在万仞剑峰中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 60,
      "max": 113
    },
    "goldReward": {
      "min": 40,
      "max": 75
    },
    "background": "你踏入了万仞剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_09_01",
    "name": "熔岩东火山",
    "icon": "Flame",
    "description": "位于大乘界的熔岩东火山，适合大乘9层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 9,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 754,
    "enemies": [
      "fire_elemental",
      "lava_golem"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_9_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在熔岩东火山中获得的仙灵液"
      },
      {
        "id": "mat_大乘_9_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在熔岩东火山中获得的混沌金石"
      },
      {
        "id": "mat_大乘_9_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.27,
        "description": "在熔岩东火山中获得的天外陨铁"
      }
    ],
    "expReward": {
      "min": 60,
      "max": 113
    },
    "goldReward": {
      "min": 40,
      "max": 75
    },
    "background": "你踏入了熔岩东火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_09_02",
    "name": "雷霆西崖顶",
    "icon": "Zap",
    "description": "位于大乘界的雷霆西崖顶，适合大乘9层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 9,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 928,
    "enemies": [
      "thunder_bird",
      "storm_elemental",
      "lightning_beast"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_9_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的仙灵液"
      },
      {
        "id": "mat_大乘_9_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的混沌金石"
      },
      {
        "id": "mat_大乘_9_天外",
        "name": "天外陨铁",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的天外陨铁"
      },
      {
        "id": "mat_大乘_9_万古",
        "name": "万古玄冰",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.22,
        "description": "在雷霆西崖顶中获得的万古玄冰"
      }
    ],
    "expReward": {
      "min": 60,
      "max": 113
    },
    "goldReward": {
      "min": 40,
      "max": 75
    },
    "background": "你踏入了雷霆西崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_大乘_09_03",
    "name": "深渊南裂隙",
    "icon": "Orbit",
    "description": "位于大乘界的深渊南裂隙，适合大乘9层修士历练。",
    "requiredRealm": "大乘",
    "requiredRealmLevel": 9,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 1102,
    "enemies": [
      "demon_lord"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_大乘_9_仙灵",
        "name": "仙灵液",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在深渊南裂隙中获得的仙灵液"
      },
      {
        "id": "mat_大乘_9_混沌",
        "name": "混沌金石",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.17,
        "description": "在深渊南裂隙中获得的混沌金石"
      }
    ],
    "expReward": {
      "min": 60,
      "max": 113
    },
    "goldReward": {
      "min": 40,
      "max": 75
    },
    "background": "你踏入了深渊南裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_01_00",
    "name": "熔岩火山",
    "icon": "Flame",
    "description": "位于仙人界的熔岩火山，适合仙人1层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 1,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 470,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_1_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在熔岩火山中获得的天道本源"
      },
      {
        "id": "mat_仙人_1_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在熔岩火山中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 49,
      "max": 91
    },
    "goldReward": {
      "min": 32,
      "max": 61
    },
    "background": "你踏入了熔岩火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_01_01",
    "name": "雷霆东崖顶",
    "icon": "Zap",
    "description": "位于仙人界的雷霆东崖顶，适合仙人1层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 1,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 611,
    "enemies": [
      "thunder_bird",
      "storm_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_1_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在雷霆东崖顶中获得的天道本源"
      },
      {
        "id": "mat_仙人_1_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在雷霆东崖顶中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_1_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在雷霆东崖顶中获得的鸿蒙灵根"
      }
    ],
    "expReward": {
      "min": 49,
      "max": 91
    },
    "goldReward": {
      "min": 32,
      "max": 61
    },
    "background": "你踏入了雷霆东崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_01_02",
    "name": "深渊西裂隙",
    "icon": "Orbit",
    "description": "位于仙人界的深渊西裂隙，适合仙人1层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 1,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 752,
    "enemies": [
      "demon_lord",
      "void_walker",
      "chaos_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_1_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的天道本源"
      },
      {
        "id": "mat_仙人_1_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_1_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的鸿蒙灵根"
      },
      {
        "id": "mat_仙人_1_宇宙",
        "name": "宇宙尘埃",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的宇宙尘埃"
      }
    ],
    "expReward": {
      "min": 49,
      "max": 91
    },
    "goldReward": {
      "min": 32,
      "max": 61
    },
    "background": "你踏入了深渊西裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_01_03",
    "name": "幽暗南洞穴",
    "icon": "Mountain",
    "description": "位于仙人界的幽暗南洞穴，适合仙人1层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 1,
    "staminaCost": 20,
    "difficulty": "nightmare",
    "recommendedPower": 893,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_1_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在幽暗南洞穴中获得的天道本源"
      },
      {
        "id": "mat_仙人_1_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在幽暗南洞穴中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 49,
      "max": 91
    },
    "goldReward": {
      "min": 32,
      "max": 61
    },
    "background": "你踏入了幽暗南洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_02_00",
    "name": "血月祭坛",
    "icon": "Skull",
    "description": "位于仙人界的血月祭坛，适合仙人2层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 2,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 490,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_2_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在血月祭坛中获得的天道本源"
      },
      {
        "id": "mat_仙人_2_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在血月祭坛中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 51,
      "max": 94
    },
    "goldReward": {
      "min": 34,
      "max": 63
    },
    "background": "你踏入了血月祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_02_01",
    "name": "冰封东雪原",
    "icon": "Snowflake",
    "description": "位于仙人界的冰封东雪原，适合仙人2层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 2,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 637,
    "enemies": [
      "ice_wolf",
      "frost_giant"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_2_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在冰封东雪原中获得的天道本源"
      },
      {
        "id": "mat_仙人_2_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在冰封东雪原中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_2_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在冰封东雪原中获得的鸿蒙灵根"
      }
    ],
    "expReward": {
      "min": 51,
      "max": 94
    },
    "goldReward": {
      "min": 34,
      "max": 63
    },
    "background": "你踏入了冰封东雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_02_02",
    "name": "碧波西龙宫",
    "icon": "Droplets",
    "description": "位于仙人界的碧波西龙宫，适合仙人2层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 2,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 784,
    "enemies": [
      "water_serpent",
      "coral_guardian",
      "tide_hunter"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_2_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的天道本源"
      },
      {
        "id": "mat_仙人_2_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_2_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的鸿蒙灵根"
      },
      {
        "id": "mat_仙人_2_宇宙",
        "name": "宇宙尘埃",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的宇宙尘埃"
      }
    ],
    "expReward": {
      "min": 51,
      "max": 94
    },
    "goldReward": {
      "min": 34,
      "max": 63
    },
    "background": "你踏入了碧波西龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_02_03",
    "name": "天界南遗迹",
    "icon": "Star",
    "description": "位于仙人界的天界南遗迹，适合仙人2层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 2,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 931,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_2_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在天界南遗迹中获得的天道本源"
      },
      {
        "id": "mat_仙人_2_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在天界南遗迹中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 51,
      "max": 94
    },
    "goldReward": {
      "min": 34,
      "max": 63
    },
    "background": "你踏入了天界南遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_03_00",
    "name": "迷雾森林",
    "icon": "Swords",
    "description": "位于仙人界的迷雾森林，适合仙人3层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 3,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 509,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_3_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在迷雾森林中获得的天道本源"
      },
      {
        "id": "mat_仙人_3_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在迷雾森林中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 53,
      "max": 98
    },
    "goldReward": {
      "min": 35,
      "max": 66
    },
    "background": "你踏入了迷雾森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_03_01",
    "name": "翠竹东幽谷",
    "icon": "Leaf",
    "description": "位于仙人界的翠竹东幽谷，适合仙人3层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 3,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 663,
    "enemies": [
      "bamboo_spirit",
      "wood_elf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_3_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在翠竹东幽谷中获得的天道本源"
      },
      {
        "id": "mat_仙人_3_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在翠竹东幽谷中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_3_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在翠竹东幽谷中获得的鸿蒙灵根"
      }
    ],
    "expReward": {
      "min": 53,
      "max": 98
    },
    "goldReward": {
      "min": 35,
      "max": 66
    },
    "background": "你踏入了翠竹东幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_03_02",
    "name": "荒芜西沙漠",
    "icon": "Wind",
    "description": "位于仙人界的荒芜西沙漠，适合仙人3层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 3,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 816,
    "enemies": [
      "sand_worm",
      "desert_scorpion",
      "mummy_warrior"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_3_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的天道本源"
      },
      {
        "id": "mat_仙人_3_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_3_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的鸿蒙灵根"
      },
      {
        "id": "mat_仙人_3_宇宙",
        "name": "宇宙尘埃",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的宇宙尘埃"
      }
    ],
    "expReward": {
      "min": 53,
      "max": 98
    },
    "goldReward": {
      "min": 35,
      "max": 66
    },
    "background": "你踏入了荒芜西沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_03_03",
    "name": "万仞南剑峰",
    "icon": "Sword",
    "description": "位于仙人界的万仞南剑峰，适合仙人3层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 3,
    "staminaCost": 21,
    "difficulty": "nightmare",
    "recommendedPower": 968,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_3_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在万仞南剑峰中获得的天道本源"
      },
      {
        "id": "mat_仙人_3_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在万仞南剑峰中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 53,
      "max": 98
    },
    "goldReward": {
      "min": 35,
      "max": 66
    },
    "background": "你踏入了万仞南剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_04_00",
    "name": "熔岩火山",
    "icon": "Flame",
    "description": "位于仙人界的熔岩火山，适合仙人4层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 4,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 530,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_4_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在熔岩火山中获得的天道本源"
      },
      {
        "id": "mat_仙人_4_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在熔岩火山中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 55,
      "max": 102
    },
    "goldReward": {
      "min": 37,
      "max": 68
    },
    "background": "你踏入了熔岩火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_04_01",
    "name": "雷霆东崖顶",
    "icon": "Zap",
    "description": "位于仙人界的雷霆东崖顶，适合仙人4层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 4,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 689,
    "enemies": [
      "thunder_bird",
      "storm_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_4_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在雷霆东崖顶中获得的天道本源"
      },
      {
        "id": "mat_仙人_4_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在雷霆东崖顶中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_4_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在雷霆东崖顶中获得的鸿蒙灵根"
      }
    ],
    "expReward": {
      "min": 55,
      "max": 102
    },
    "goldReward": {
      "min": 37,
      "max": 68
    },
    "background": "你踏入了雷霆东崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_04_02",
    "name": "深渊西裂隙",
    "icon": "Orbit",
    "description": "位于仙人界的深渊西裂隙，适合仙人4层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 4,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 848,
    "enemies": [
      "demon_lord",
      "void_walker",
      "chaos_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_4_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的天道本源"
      },
      {
        "id": "mat_仙人_4_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_4_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的鸿蒙灵根"
      },
      {
        "id": "mat_仙人_4_宇宙",
        "name": "宇宙尘埃",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的宇宙尘埃"
      }
    ],
    "expReward": {
      "min": 55,
      "max": 102
    },
    "goldReward": {
      "min": 37,
      "max": 68
    },
    "background": "你踏入了深渊西裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_04_03",
    "name": "幽暗南洞穴",
    "icon": "Mountain",
    "description": "位于仙人界的幽暗南洞穴，适合仙人4层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 4,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 1007,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_4_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在幽暗南洞穴中获得的天道本源"
      },
      {
        "id": "mat_仙人_4_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在幽暗南洞穴中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 55,
      "max": 102
    },
    "goldReward": {
      "min": 37,
      "max": 68
    },
    "background": "你踏入了幽暗南洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_05_00",
    "name": "血月祭坛",
    "icon": "Skull",
    "description": "位于仙人界的血月祭坛，适合仙人5层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 5,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 550,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_5_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在血月祭坛中获得的天道本源"
      },
      {
        "id": "mat_仙人_5_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在血月祭坛中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 57,
      "max": 106
    },
    "goldReward": {
      "min": 38,
      "max": 71
    },
    "background": "你踏入了血月祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_05_01",
    "name": "冰封东雪原",
    "icon": "Snowflake",
    "description": "位于仙人界的冰封东雪原，适合仙人5层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 5,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 715,
    "enemies": [
      "ice_wolf",
      "frost_giant"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_5_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在冰封东雪原中获得的天道本源"
      },
      {
        "id": "mat_仙人_5_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在冰封东雪原中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_5_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在冰封东雪原中获得的鸿蒙灵根"
      }
    ],
    "expReward": {
      "min": 57,
      "max": 106
    },
    "goldReward": {
      "min": 38,
      "max": 71
    },
    "background": "你踏入了冰封东雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_05_02",
    "name": "碧波西龙宫",
    "icon": "Droplets",
    "description": "位于仙人界的碧波西龙宫，适合仙人5层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 5,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 880,
    "enemies": [
      "water_serpent",
      "coral_guardian",
      "tide_hunter"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_5_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的天道本源"
      },
      {
        "id": "mat_仙人_5_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_5_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的鸿蒙灵根"
      },
      {
        "id": "mat_仙人_5_宇宙",
        "name": "宇宙尘埃",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的宇宙尘埃"
      }
    ],
    "expReward": {
      "min": 57,
      "max": 106
    },
    "goldReward": {
      "min": 38,
      "max": 71
    },
    "background": "你踏入了碧波西龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_05_03",
    "name": "天界南遗迹",
    "icon": "Star",
    "description": "位于仙人界的天界南遗迹，适合仙人5层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 5,
    "staminaCost": 22,
    "difficulty": "nightmare",
    "recommendedPower": 1045,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_5_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在天界南遗迹中获得的天道本源"
      },
      {
        "id": "mat_仙人_5_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在天界南遗迹中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 57,
      "max": 106
    },
    "goldReward": {
      "min": 38,
      "max": 71
    },
    "background": "你踏入了天界南遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_06_00",
    "name": "迷雾森林",
    "icon": "Swords",
    "description": "位于仙人界的迷雾森林，适合仙人6层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 6,
    "staminaCost": 23,
    "difficulty": "nightmare",
    "recommendedPower": 570,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_6_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在迷雾森林中获得的天道本源"
      },
      {
        "id": "mat_仙人_6_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在迷雾森林中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 59,
      "max": 110
    },
    "goldReward": {
      "min": 39,
      "max": 74
    },
    "background": "你踏入了迷雾森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_06_01",
    "name": "翠竹东幽谷",
    "icon": "Leaf",
    "description": "位于仙人界的翠竹东幽谷，适合仙人6层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 6,
    "staminaCost": 23,
    "difficulty": "nightmare",
    "recommendedPower": 741,
    "enemies": [
      "bamboo_spirit",
      "wood_elf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_6_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在翠竹东幽谷中获得的天道本源"
      },
      {
        "id": "mat_仙人_6_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在翠竹东幽谷中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_6_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在翠竹东幽谷中获得的鸿蒙灵根"
      }
    ],
    "expReward": {
      "min": 59,
      "max": 110
    },
    "goldReward": {
      "min": 39,
      "max": 74
    },
    "background": "你踏入了翠竹东幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_06_02",
    "name": "荒芜西沙漠",
    "icon": "Wind",
    "description": "位于仙人界的荒芜西沙漠，适合仙人6层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 6,
    "staminaCost": 23,
    "difficulty": "nightmare",
    "recommendedPower": 912,
    "enemies": [
      "sand_worm",
      "desert_scorpion",
      "mummy_warrior"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_6_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的天道本源"
      },
      {
        "id": "mat_仙人_6_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_6_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的鸿蒙灵根"
      },
      {
        "id": "mat_仙人_6_宇宙",
        "name": "宇宙尘埃",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的宇宙尘埃"
      }
    ],
    "expReward": {
      "min": 59,
      "max": 110
    },
    "goldReward": {
      "min": 39,
      "max": 74
    },
    "background": "你踏入了荒芜西沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_06_03",
    "name": "万仞南剑峰",
    "icon": "Sword",
    "description": "位于仙人界的万仞南剑峰，适合仙人6层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 6,
    "staminaCost": 23,
    "difficulty": "nightmare",
    "recommendedPower": 1083,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_6_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在万仞南剑峰中获得的天道本源"
      },
      {
        "id": "mat_仙人_6_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在万仞南剑峰中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 59,
      "max": 110
    },
    "goldReward": {
      "min": 39,
      "max": 74
    },
    "background": "你踏入了万仞南剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_07_00",
    "name": "熔岩火山",
    "icon": "Flame",
    "description": "位于仙人界的熔岩火山，适合仙人7层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 7,
    "staminaCost": 23,
    "difficulty": "nightmare",
    "recommendedPower": 590,
    "enemies": [
      "fire_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_7_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在熔岩火山中获得的天道本源"
      },
      {
        "id": "mat_仙人_7_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在熔岩火山中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 61,
      "max": 114
    },
    "goldReward": {
      "min": 41,
      "max": 76
    },
    "background": "你踏入了熔岩火山，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_07_01",
    "name": "雷霆东崖顶",
    "icon": "Zap",
    "description": "位于仙人界的雷霆东崖顶，适合仙人7层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 7,
    "staminaCost": 23,
    "difficulty": "nightmare",
    "recommendedPower": 767,
    "enemies": [
      "thunder_bird",
      "storm_elemental"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_7_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在雷霆东崖顶中获得的天道本源"
      },
      {
        "id": "mat_仙人_7_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在雷霆东崖顶中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_7_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在雷霆东崖顶中获得的鸿蒙灵根"
      }
    ],
    "expReward": {
      "min": 61,
      "max": 114
    },
    "goldReward": {
      "min": 41,
      "max": 76
    },
    "background": "你踏入了雷霆东崖顶，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_07_02",
    "name": "深渊西裂隙",
    "icon": "Orbit",
    "description": "位于仙人界的深渊西裂隙，适合仙人7层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 7,
    "staminaCost": 23,
    "difficulty": "nightmare",
    "recommendedPower": 944,
    "enemies": [
      "demon_lord",
      "void_walker",
      "chaos_serpent"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_7_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的天道本源"
      },
      {
        "id": "mat_仙人_7_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_7_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的鸿蒙灵根"
      },
      {
        "id": "mat_仙人_7_宇宙",
        "name": "宇宙尘埃",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在深渊西裂隙中获得的宇宙尘埃"
      }
    ],
    "expReward": {
      "min": 61,
      "max": 114
    },
    "goldReward": {
      "min": 41,
      "max": 76
    },
    "background": "你踏入了深渊西裂隙，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_07_03",
    "name": "幽暗南洞穴",
    "icon": "Mountain",
    "description": "位于仙人界的幽暗南洞穴，适合仙人7层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 7,
    "staminaCost": 23,
    "difficulty": "nightmare",
    "recommendedPower": 1121,
    "enemies": [
      "cave_bat"
    ],
    "waves": 3,
    "drops": [
      {
        "id": "mat_仙人_7_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在幽暗南洞穴中获得的天道本源"
      },
      {
        "id": "mat_仙人_7_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在幽暗南洞穴中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 61,
      "max": 114
    },
    "goldReward": {
      "min": 41,
      "max": 76
    },
    "background": "你踏入了幽暗南洞穴，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_08_00",
    "name": "血月祭坛",
    "icon": "Skull",
    "description": "位于仙人界的血月祭坛，适合仙人8层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 8,
    "staminaCost": 24,
    "difficulty": "nightmare",
    "recommendedPower": 610,
    "enemies": [
      "blood_shade"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_8_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在血月祭坛中获得的天道本源"
      },
      {
        "id": "mat_仙人_8_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在血月祭坛中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 63,
      "max": 118
    },
    "goldReward": {
      "min": 42,
      "max": 79
    },
    "background": "你踏入了血月祭坛，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_08_01",
    "name": "冰封东雪原",
    "icon": "Snowflake",
    "description": "位于仙人界的冰封东雪原，适合仙人8层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 8,
    "staminaCost": 24,
    "difficulty": "nightmare",
    "recommendedPower": 793,
    "enemies": [
      "ice_wolf",
      "frost_giant"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_8_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在冰封东雪原中获得的天道本源"
      },
      {
        "id": "mat_仙人_8_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在冰封东雪原中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_8_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在冰封东雪原中获得的鸿蒙灵根"
      }
    ],
    "expReward": {
      "min": 63,
      "max": 118
    },
    "goldReward": {
      "min": 42,
      "max": 79
    },
    "background": "你踏入了冰封东雪原，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_08_02",
    "name": "碧波西龙宫",
    "icon": "Droplets",
    "description": "位于仙人界的碧波西龙宫，适合仙人8层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 8,
    "staminaCost": 24,
    "difficulty": "nightmare",
    "recommendedPower": 976,
    "enemies": [
      "water_serpent",
      "coral_guardian",
      "tide_hunter"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_8_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的天道本源"
      },
      {
        "id": "mat_仙人_8_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_8_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的鸿蒙灵根"
      },
      {
        "id": "mat_仙人_8_宇宙",
        "name": "宇宙尘埃",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在碧波西龙宫中获得的宇宙尘埃"
      }
    ],
    "expReward": {
      "min": 63,
      "max": 118
    },
    "goldReward": {
      "min": 42,
      "max": 79
    },
    "background": "你踏入了碧波西龙宫，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_08_03",
    "name": "天界南遗迹",
    "icon": "Star",
    "description": "位于仙人界的天界南遗迹，适合仙人8层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 8,
    "staminaCost": 24,
    "difficulty": "nightmare",
    "recommendedPower": 1159,
    "enemies": [
      "ancient_guardian"
    ],
    "waves": 4,
    "drops": [
      {
        "id": "mat_仙人_8_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在天界南遗迹中获得的天道本源"
      },
      {
        "id": "mat_仙人_8_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在天界南遗迹中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 63,
      "max": 118
    },
    "goldReward": {
      "min": 42,
      "max": 79
    },
    "background": "你踏入了天界南遗迹，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_09_00",
    "name": "迷雾森林",
    "icon": "Swords",
    "description": "位于仙人界的迷雾森林，适合仙人9层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 9,
    "staminaCost": 24,
    "difficulty": "nightmare",
    "recommendedPower": 630,
    "enemies": [
      "slime"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_9_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在迷雾森林中获得的天道本源"
      },
      {
        "id": "mat_仙人_9_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.29,
        "description": "在迷雾森林中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 65,
      "max": 122
    },
    "goldReward": {
      "min": 44,
      "max": 81
    },
    "background": "你踏入了迷雾森林，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_09_01",
    "name": "翠竹东幽谷",
    "icon": "Leaf",
    "description": "位于仙人界的翠竹东幽谷，适合仙人9层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 9,
    "staminaCost": 24,
    "difficulty": "nightmare",
    "recommendedPower": 819,
    "enemies": [
      "bamboo_spirit",
      "wood_elf"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_9_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在翠竹东幽谷中获得的天道本源"
      },
      {
        "id": "mat_仙人_9_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在翠竹东幽谷中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_9_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 2,
        "dropRate": 0.24,
        "description": "在翠竹东幽谷中获得的鸿蒙灵根"
      }
    ],
    "expReward": {
      "min": 65,
      "max": 122
    },
    "goldReward": {
      "min": 44,
      "max": 81
    },
    "background": "你踏入了翠竹东幽谷，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_09_02",
    "name": "荒芜西沙漠",
    "icon": "Wind",
    "description": "位于仙人界的荒芜西沙漠，适合仙人9层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 9,
    "staminaCost": 24,
    "difficulty": "nightmare",
    "recommendedPower": 1008,
    "enemies": [
      "sand_worm",
      "desert_scorpion",
      "mummy_warrior"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_9_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的天道本源"
      },
      {
        "id": "mat_仙人_9_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的混沌至宝"
      },
      {
        "id": "mat_仙人_9_鸿蒙",
        "name": "鸿蒙灵根",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的鸿蒙灵根"
      },
      {
        "id": "mat_仙人_9_宇宙",
        "name": "宇宙尘埃",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 3,
        "dropRate": 0.19,
        "description": "在荒芜西沙漠中获得的宇宙尘埃"
      }
    ],
    "expReward": {
      "min": 65,
      "max": 122
    },
    "goldReward": {
      "min": 44,
      "max": 81
    },
    "background": "你踏入了荒芜西沙漠，空气中弥漫着未知的气息，危险与机遇并存..."
  },
  {
    "id": "area_仙人_09_03",
    "name": "万仞南剑峰",
    "icon": "Sword",
    "description": "位于仙人界的万仞南剑峰，适合仙人9层修士历练。",
    "requiredRealm": "仙人",
    "requiredRealmLevel": 9,
    "staminaCost": 24,
    "difficulty": "nightmare",
    "recommendedPower": 1197,
    "enemies": [
      "sword_spirit"
    ],
    "waves": 2,
    "drops": [
      {
        "id": "mat_仙人_9_天道",
        "name": "天道本源",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在万仞南剑峰中获得的天道本源"
      },
      {
        "id": "mat_仙人_9_混沌",
        "name": "混沌至宝",
        "icon": "剑",
        "type": "material",
        "quality": "legendary",
        "minQuantity": 1,
        "maxQuantity": 1,
        "dropRate": 0.14,
        "description": "在万仞南剑峰中获得的混沌至宝"
      }
    ],
    "expReward": {
      "min": 65,
      "max": 122
    },
    "goldReward": {
      "min": 44,
      "max": 81
    },
    "background": "你踏入了万仞南剑峰，空气中弥漫着未知的气息，危险与机遇并存..."
  }
]

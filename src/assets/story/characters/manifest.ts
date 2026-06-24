export interface CharacterArtAsset {
  id: string
  name: string
  portrait: string
  avatar: string
  avatarFocus?: {
    x: number
    y: number
    scale?: number
  }
  version: 'v1'
}

export const characterArtManifest: CharacterArtAsset[] = [
  {
    id: 'npc_luoyanzhi',
    name: '洛衍之',
    portrait: '/src/assets/story/characters/portraits/luo-yanzhi-v1.png',
    avatar: '/src/assets/story/characters/avatars/luo-yanzhi-avatar-v1.png',
    avatarFocus: { x: 50, y: 13, scale: 2.6 },
    version: 'v1',
  },
  {
    id: 'npc_guchangxi',
    name: '顾长惜',
    portrait: '/src/assets/story/characters/portraits/gu-changxi-v1.png',
    avatar: '/src/assets/story/characters/avatars/gu-changxi-avatar-v1.png',
    avatarFocus: { x: 49, y: 11, scale: 2.74 },
    version: 'v1',
  },
  {
    id: 'npc_peiwangyuan',
    name: '裴忘渊',
    portrait: '/src/assets/story/characters/portraits/pei-wangyuan-v1.png',
    avatar: '/src/assets/story/characters/avatars/pei-wangyuan-avatar-v1.png',
    avatarFocus: { x: 51, y: 12, scale: 2.68 },
    version: 'v1',
  },
  {
    id: 'npc_yunfeiran',
    name: '云斐然',
    portrait: '/src/assets/story/characters/portraits/yun-feiran-v1.png',
    avatar: '/src/assets/story/characters/avatars/yun-feiran-avatar-v1.png',
    avatarFocus: { x: 50, y: 12, scale: 2.58 },
    version: 'v1',
  },
  {
    id: 'npc_liuqingshuang',
    name: '柳青霜',
    portrait: '/src/assets/story/characters/portraits/liu-qingshuang-v1.png',
    avatar: '/src/assets/story/characters/avatars/liu-qingshuang-avatar-v1.png',
    avatarFocus: { x: 50, y: 12, scale: 2.72 },
    version: 'v1',
  },
  {
    id: 'npc_wumianzunzhe',
    name: '无面尊者',
    portrait: '/src/assets/story/characters/portraits/wumian-zunzhe-v1.png',
    avatar: '/src/assets/story/characters/avatars/wumian-zunzhe-avatar-v1.png',
    avatarFocus: { x: 50, y: 10, scale: 2.9 },
    version: 'v1',
  },
  {
    id: 'npc_jiangsu',
    name: '江溯',
    portrait: '/src/assets/story/characters/portraits/jiang-su-v1.png',
    avatar: '/src/assets/story/characters/avatars/jiang-su-avatar-v1.png',
    avatarFocus: { x: 50, y: 14, scale: 2.4 },
    version: 'v1',
  },
  {
    id: 'npc_sitianming',
    name: '司天命',
    portrait: '/src/assets/story/characters/portraits/si-tianming-v1.png',
    avatar: '/src/assets/story/characters/avatars/si-tianming-avatar-v1.png',
    avatarFocus: { x: 50, y: 12, scale: 2.66 },
    version: 'v1',
  },
  {
    id: 'npc_suwantang',
    name: '苏晚棠',
    portrait: '/src/assets/story/characters/portraits/su-wantang-v1.png',
    avatar: '/src/assets/story/characters/avatars/su-wantang-avatar-v1.png',
    avatarFocus: { x: 50, y: 11, scale: 2.74 },
    version: 'v1',
  },
  {
    id: 'npc_jiuyouzi',
    name: '九幽子',
    portrait: '/src/assets/story/characters/portraits/jiuyouzi-v1.png',
    avatar: '/src/assets/story/characters/avatars/jiuyouzi-avatar-v1.png',
    avatarFocus: { x: 50, y: 11, scale: 2.86 },
    version: 'v1',
  },
  {
    id: 'npc_shenjingming',
    name: '沈镜明',
    portrait: '/src/assets/story/characters/portraits/shen-jingming-v1.png',
    avatar: '/src/assets/story/characters/avatars/shen-jingming-avatar-v1.png',
    avatarFocus: { x: 50, y: 12, scale: 2.62 },
    version: 'v1',
  },
  {
    id: 'npc_wenruxu',
    name: '温如许',
    portrait: '/src/assets/story/characters/portraits/wen-ruxu-v1.png',
    avatar: '/src/assets/story/characters/avatars/wen-ruxu-avatar-v1.png',
    avatarFocus: { x: 49, y: 12, scale: 2.68 },
    version: 'v1',
  },
  {
    id: 'npc_xiebuyu',
    name: '谢不语',
    portrait: '/src/assets/story/characters/portraits/xie-buyu-v1.png',
    avatar: '/src/assets/story/characters/avatars/xie-buyu-avatar-v1.png',
    avatarFocus: { x: 50, y: 13, scale: 2.56 },
    version: 'v1',
  },
  {
    id: 'npc_bailuxiansheng',
    name: '白鹿先生',
    portrait: '/src/assets/story/characters/portraits/bailu-xiansheng-v1.png',
    avatar: '/src/assets/story/characters/avatars/bailu-xiansheng-avatar-v1.png',
    avatarFocus: { x: 50, y: 13, scale: 2.48 },
    version: 'v1',
  },
  {
    id: 'npc_zhongliyue',
    name: '钟离越',
    portrait: '/src/assets/story/characters/portraits/zhongli-yue-v1.png',
    avatar: '/src/assets/story/characters/avatars/zhongli-yue-avatar-v1.png',
    avatarFocus: { x: 50, y: 12, scale: 2.7 },
    version: 'v1',
  },
  {
    id: 'npc_xueqingya',
    name: '薛青鸦',
    portrait: '/src/assets/story/characters/portraits/xue-qingya-v1.png',
    avatar: '/src/assets/story/characters/avatars/xue-qingya-avatar-v1.png',
    avatarFocus: { x: 50, y: 12, scale: 2.78 },
    version: 'v1',
  },
  {
    id: 'npc_yinbofu',
    name: '阴伯符',
    portrait: '/src/assets/story/characters/portraits/yin-bofu-v1.png',
    avatar: '/src/assets/story/characters/avatars/yin-bofu-avatar-v1.png',
    avatarFocus: { x: 50, y: 12, scale: 2.52 },
    version: 'v1',
  },
]

export const characterArtMap = Object.fromEntries(
  characterArtManifest.map((asset) => [asset.id, asset]),
) as Record<string, CharacterArtAsset>

import type { StoryChapter } from '@/types/storyChapter'

export const chapter_tianji_fall: StoryChapter = {
  id: 'vol3_ch044_tianji_fall',
  title: '第四十四章·天机阁覆灭',
  volume: 3,
  order: 44,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'guchangxi_break', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '五域联盟对天机阁本岛发动了自陨道之战以来第一次真正意义上的联合总攻。裴忘渊率剑宗七峰精锐正面冲击护岛大阵，金色剑光如暴雨般劈碎黑色玉简壁；苏晚棠率碧落宫主力压制外海五大分阁，水蓝法阵在海面上铺成巨网；钟离越与萧炎烈分别封住山门与海路，不给任何残部留出退路。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '无面尊者却没有现身指挥防御。他在总攻开始的同时，直接启动了天道吞噬阵第二阶段，把整座天机阁本岛转化成巨型能量核。反噬从本岛中心推演室正下方爆开，黑色玉简壁像被内部撑裂一样一层层炸碎，每一片碎屑里都封着一个曾被推演过又被抛弃的命运幻象。大批来不及撤离的执事与弟子在这一瞬被吞入法则，成了阵法的燃料。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '司天命在撤离前已被认定为叛徒。他被地底阵眼刺出的黑色法则剑光贯穿胸腔，倒下去时正对着碧落宫外海的方向。隔着战火与阵幕，顾长惜远远看见他最后一次抬眼。没有声音，但她的天机之瞳还是在那一瞬补全了那句话:保护好自己。天机阁覆灭时，连最像囚笼的一层，也在她心里一起裂开了。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '天亮时，沧澜域外海面上的天机阁本岛已经不复存在。原址只剩巨大的海上漩涡、零散玉简残片，和一簇簇在碎波里熄灭的蓝色荧火。组织虽灭，无面尊者下落未明，但笼罩五域三万年的推演巨网终于被撕开了第一道再也补不回去的口子。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第四十四章·天机阁覆灭·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 232 },
            { type: 'flag_set', flag: 'tianji_fall', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

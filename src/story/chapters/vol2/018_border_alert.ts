import type { StoryChapter } from '@/types/storyChapter'
export const chapter_border_alert: StoryChapter = {
  id: 'vol2_ch018_border_alert', title: '第十八章·边关急报', volume: 2, order: 18, perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'foundation_built', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '一纸军报送到悬剑峰主殿——九幽子叛变成立吞天教，三座玄天域边境仙城三天内沦陷，城墙上每一块砖都被暗红色腐蚀性灵力蛀成了蜂窝。裴忘渊放下军报，左手虎口那道永不能愈合的法则之伤正在以可感的频率跳动——他认得这股灵力的纹理，那是被堕落的火之道种碎片侵蚀后的残痕。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '七峰峰主会议在半炷香内做出决定：剑宗出兵赤炎域边境。洛衍之以筑基内门弟子身份被编入云斐然的先锋小队。出发前夜，江溯用酒壶敲了他的头——下手比平时更重。活着回来。战场上你见到的第一个向你伸手的人，不一定是救你的——也可能是要拿你的剑。', autoNext: 's3' },
    { id: 's3', type: 'narrative', text: '先锋队出发那天下着玄天域少见的灰雨。洛衍之走在队伍中间，左腰断念剑、右肩玄铁剑。云斐然走在最前面，紫衣在灰雨中像一面移动的旗帜，每走一步都刚好让洛衍之能看到他的后脚踩在哪里——那是剑修在碎石泥泞中教另一个剑修找落点，不需要说出来的默契。', autoNext: 's4' },
    { id: 's4', type: 'choice', text: '——第十八章·边关急报·完——', choices: [
      { text: '继续', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 70 }, { type: 'flag_set', flag: 'border_march', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

import type { StoryChapter } from '@/types/storyChapter'
export const chapter_chiyan_envoy: StoryChapter = {
  id: 'vol2_ch019_chiyan_envoy', title: '第十九章·赤炎域的使者', volume: 2, order: 19, perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'border_march', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '司天命的密令送到顾长惜手中——以天机阁使者身份前往赤炎域，协助烈焰天宗镇压九幽子叛乱。但附带的、不写在正式玉简上的指令是：趁乱获取火之道种核心位置的情报。顾长惜抵达赤炎域边境时，她这辈子第一次理解了为什么赤炎域的修士性格如此暴烈——这里的天空被永不停歇的地火映成了暗红色的火山灰穹顶，大地龟裂处冒着硫磺味的白烟，每一次吸气都像在吞烧红的沙子。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '烈焰天宗没有派人迎接——不是怠慢，是整个赤炎域现在抽不出半个人手。九幽子的吞天教在三个月内连下南部三大仙城，宗内主力已全部南下迎敌。顾长惜在一座半塌的驿站里过了一夜，墙上的裂缝里灌进来带着硫磺味的夜风。右肩旧伤在这片火灵气浓厚的土地上又开始隐隐作痛，她咬着一块干净的手帕调息了半夜。天亮后她独自踏上了去往炎角镇的路——那个据说剑宗先锋队正驻扎的半废墟小镇。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '——第十九章·赤炎域的使者·完——', choices: [
      { text: '继续', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 60 }, { type: 'flag_set', flag: 'entered_chiyan', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

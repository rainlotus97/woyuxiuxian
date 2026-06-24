import type { StoryChapter } from '@/types/storyChapter'
export const chapter_brief_peace: StoryChapter = {
  id: 'vol3_ch045_brief_peace', title: '第四十五章·短暂的和平', volume: 3, order: 45, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'tianji_fallen', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '天机阁覆灭后的第一个月，是九天界自陨道之战以来最宁静的一个月。沧澜域海浪反复冲刷焦黑的岛基残桩，五大仙域边境不再出现天机阁暗中挑起的每日摩擦。顾长惜守在碧落宫客房父母床边——母亲苏忘荃从二十年冷狱中苏醒后瘦得像被反复折叠过的纸，她醒来第一句话是紧紧拉着女儿的手：你爹在那间黑屋子里每天用手指在墙上写字，写一段就被阵法吞一段，他最后一句话是——我的女儿不叫命定之人，叫顾长惜。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '顾长惜帮她娘掖好被角走到外面廊上。洛衍之靠在石柱上——没有进去，没有说话。他已经在这里站着等了她好几个时辰。她在他旁边石栏上坐下，过了很久，把头轻轻地靠在他肩上。他没有醒——不是睡着，是那种知道你在靠着我的安静的假装。廊外的海面静得发瓷，波光一层叠一层推到焦黑的岛基上又退回来。这是大战前两个人最后一次能有这种毫无防备的安静。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '——第四十五章·短暂的和平·完——', choices: [
      { text: '继续', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 90 }, { type: 'npc_favor', npcId: 'npc_guchangxi', value: 15 }, { type: 'flag_set', flag: 'peaceful_month', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

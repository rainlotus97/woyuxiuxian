import type { StoryChapter } from '@/types/storyChapter'

export const chapter_new_beginning: StoryChapter = {
  id: 'vol4_ch063_063_new_beginning',
  title: '第六十三章·新的开始', volume: 4, order: 63, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'postwar_year', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '战后一年间洛衍之骑老灵鹤走遍五域。钟离越将长青谷主殿改建为对凡人开放的医馆，右脸伤疤仍在但没人再畏惧。萧炎烈在熔岩废墟中将残存火之道种碎屑铸成不灭琉璃塔，碑脚刻着：火亦可与石修，不为比高，为共形。石镇山将那张被拍裂又被土灵石复原的石桌磨成方尊，刻下训语：石可裂，裂了灌灰补之犹可用，用久了裂处便是最美之纹。谢不语每天用铁剑在归尘渊对岸石壁上一个名字一个名字地刻——三万年来所有没有被任何碑记住的死者的名字。他最后把斗笠放在碑脚，自己没留名。', autoNext: 's_end' },
    { id: 's_end', type: 'choice', text: '——第六十三章·新的开始·完——', choices: [{ text: '继续', nextSectionId: 's_end2',
      effects: [{ type: 'realm_exp', value: 289 }, { type: 'flag_set', flag: '063_new_beginning', flagValue: true }] }] },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}

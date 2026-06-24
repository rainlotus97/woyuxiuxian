import type { StoryChapter } from '@/types/storyChapter'

export const chapter_changqing_confrontation: StoryChapter = {
  id: 'vol3_ch036_changqing_confrontation',
  title: '第三十六章·长青谷的对峙', volume: 3, order: 36, perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'heart_formed', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '顾长惜以碧落宫正式使者身份重返长青谷——这一次带着钟离越本人、裴忘渊亲笔签署的护盟信、和三位被林听涛囚禁了二十年的长老团幸存者的当面对质。在谷中正殿满堂长老面前，她将林听涛与天机阁的秘密交易逐条揭穿——拓印的抽取法阵阵图、司天命的联络密令、以及老副手当众指认先谷主被害的经过。林听涛维持了几十年的温和笑脸在证据面前碎裂，暴起一掌拍向顾长惜——却被裴忘渊预先封在盟信中的护体剑气稳稳挡住。谷内分裂，内战爆发。', autoNext: 's_end' },
    { id: 's_end', type: 'choice', text: '——第三十六章·长青谷的对峙·完——', choices: [{ text: '继续', nextSectionId: 's_end2',
      effects: [{ type: 'realm_exp', value: 208 }, { type: 'flag_set', flag: 'changqing_confrontation', flagValue: true }] }] },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}

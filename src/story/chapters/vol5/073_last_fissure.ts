import type { StoryChapter } from '@/types/storyChapter'
export const chapter_last_fissure: StoryChapter = {
  id: 'vol5_ch073_last_fissure', title: '第七十三章·最后的裂痕', volume: 5, order: 73, perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'five_domain_future', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '天道自愈进入最细微阶段时，归尘渊最深处的法则伤口忽然开始逆向扩张。洛衍之独自前往探查。他沿着归尘渊内壁被归尘剑自身剑意削出的螺旋石阶一路下到渊底。归尘剑正悬浮在渊底的法则水层中——金色的流水纹在水底碎光的折射下映出无数细密的分叉，像一道仍在缓慢流动的河道。渊底最深处有一面由残存天道法则天然凝成的镜壁。镜壁上亮着一行字迹——不是刻的，而是法则本身在那刹那里自描出来的。那是无面尊者消逝前残留下的一段意志回响，不是威胁，是一个没有答案的问题：如果你来回答——你怎么定义公平？', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '洛衍之站在这行字前。他没有急着回答。他把从望石镇到悬剑峰、从赤炎域到碧落宫见过的所有不公平和所有因为不公平而做出的选择都想了一遍。然后他用手指在镜壁上，在那行字的下面，写了一个字：选。不是答案——是一个动作。公平不是一样可以定义的东西。公平是让每一个被不公对待过的人——有一道可以选的岔路。那道岔路可能很窄，可能很远，但必须存在。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '镜壁上的字在他手指离开时长亮了一瞬——然后缓缓沉入了镜面的深处，带走了那个没有答案的问题。', choices: [
      { text: '——第七十三章·最后的裂痕·完——', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 200 }, { type: 'flag_set', flag: 'last_fissure', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

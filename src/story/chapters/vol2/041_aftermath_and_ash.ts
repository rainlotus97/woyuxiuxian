import type { StoryChapter } from '@/types/storyChapter'

export const chapter_aftermath_and_ash: StoryChapter = {
  id: 'vol2_ch041_aftermath_and_ash',
  title: '第四十一章·余烬',
  volume: 2,
  order: 41,
  perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'the_furnace', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '顾长惜先从苏晚棠那里得知，九幽子死后，他体内的吞灵核残骸已被剑宗与天机阁同时取样。裴忘渊亲自带着阵修在废墟里找到几块熔天炉残片，残片内侧古火纹的收笔方式，和江溯此前在黑色石板上发现的追踪阵纹完全同源，这让无面尊者借天机阁操控火之道种的证据更完整了一层。另一边，苏晚棠通过谛听阵捕捉到推演网在九幽子崩毁后短暂出现的数据空洞，并把那处空洞锁定在赤晶矿脉和炎角镇之间的一条废弃暗道上。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '顾长惜赶到那条暗道入口时，看见洛衍之正跪在碎石堆前，一层层拨开被熔岩烧黑的旧矿渣。他最终从最底层摸出一枚极小的金色刻片，那是云斐然在丹田被拍灭之前，用最后一丝金灵念力专门留给持有金之碎片之人的遗识刻片。刻片里只剩几个反复循环的残字，告诉裴师，阵眼，悬剑峰下。云斐然在死前感应到了那件谁都不该知道的事，真正最大的天道吞噬阵阵眼，不在远方，而是埋在剑宗心脏的正下方。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '洛衍之把这发现说出口时，顾长惜便明白，裴忘渊这些年所有看似强硬又迟缓的决定，背后都在压着悬剑峰下那座阵眼的侵蚀。两人谁都没有浪费时间多说废话，因为从这一刻起，他们要去面对的是同一场大战中的两条战线。洛衍之把金色刻片放到她手里那枚旧玉简旁边，又以极轻的一道金韵在风里留下一句只够她感知的话，留线。顾长惜收起刻片与玉简，知道下次再见，就不是在废墟边说这两个字那么简单了。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '第二天的紧急峰会上，裴忘渊把云斐然遗识刻片里的那句话向七峰峰主全部公开。悬剑峰的深层地脉探测随即全面启动，阵修们很快确认，整座主峰下方果然埋着无面尊者多年前设下的巨大推演阵眼，它像寄生在脊柱里的旧虫，一直缓慢抽走剑宗地脉与道种碎片的反冲余脉。裴忘渊站在探测阵最前沿，把那只带着古老法则伤痕的左手按上阵眼外壁。金色雷电在接触的瞬间炸开，他只说了一句，斐然，这次师父不会再让它从手底下溜走。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第四十一章·余烬·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 80 },
            { type: 'flag_set', flag: 'aftermath_and_ash', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

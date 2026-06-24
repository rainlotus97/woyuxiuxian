import type { StoryChapter } from '@/types/storyChapter'

export const chapter_blood_and_secrets: StoryChapter = {
  id: 'vol2_ch036_blood_and_secrets',
  title: '第三十六章·血与密',
  volume: 2,
  order: 36,
  perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'edge_of_war', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '顾长惜亲眼看着天机阁内部的裂痕在司天命那次坦白后迅速蔓延。苏晚棠暗中联络数个对异常推演心存疑虑的执事，把他们手里的零散档案拼在一起，第一次完整勾勒出无面尊者埋在五域里的抽取网络。金、木、水、火、土五枚道种都被不同的人和势力牵住节点，而所有能量最后都汇向同一条极其隐蔽的天道级推演链路。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '那条链路最上方只写着一个名字，命定之人，顾长惜。苏晚棠把这个发现交给她时，她正在海崖石台上拆解司天命最新发来的密令。用在赤炎域学会的逆向解密法透开底层后，她看到无面尊者的原始意图：引导洛衍之去赤晶矿脉切断吞噬供能，再借九幽子反噬崩塌的瞬间，让她进入余迹中心收束火之道种碎片。这是一场替无面尊者收割道种而设的死局。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '顾长惜立刻用天机之瞳反推，找到了唯一能暂时改写这条密令的地方：天机阁废弃旧档案岛基。那座岛常年被归墟之眼的水之道种残韵浸泡，高浓度的道种磁场会自发干扰极小灵频的高阶推演，无面尊者无法在那里维持正常速率的寄生演算。她决定亲赴岛基，把这道收割命令倒转成一条让九幽子与天机阁互相消耗的反收割指令。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '苏晚棠回讯，让她带上钟离越给的血手印玉简，借木之道种去隔离低灵频推演场。顾长惜在废弃岛基深处完成改写后，没有立刻离开，而是在那间被水之残韵浸透的旧石室里，顺手推演了她与洛衍之之间那条由金系碎芒牵起的因果线还能稳多久。结果显示，只要那粒碎芒还嵌在她的旧伤里，只要他的剑识仍会定期扫过金系灵力，这条线就始终会在无面尊者的因果网里保留一条合法而隐秘的绕路。他们借用的不是漏洞，而是天道本身允许存在的规则。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第三十六章·血与密·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 80 },
            { type: 'flag_set', flag: 'blood_and_secrets', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

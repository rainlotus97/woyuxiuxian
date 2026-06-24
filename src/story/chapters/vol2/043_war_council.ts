import type { StoryChapter } from '@/types/storyChapter'

export const chapter_war_council: StoryChapter = {
  id: 'vol2_ch043_war_council',
  title: '第四十三章·战盟',
  volume: 2,
  order: 43,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'return_to_the_sword', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '云斐然死后，裴忘渊终于在五域盟会上公开了悬剑峰下存在天机吞噬阵核心阵眼的事实。五域第一次真正意义上的联合军事会议不再只是互递公函，萧炎烈亲率烈焰天宗残部而来，石镇山也带着补过裂纹的石杖登上剑宗山门。苏晚棠以碧落宫宫主身份正式与天机阁划清界限，把那块包了几十年的旧玉简和钟离越的血手印副本同时投上水幕，让五域所有人都亲眼看见，无面尊者正寄居在司天命的推演玉简里。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '盟会最后一天，顾长惜在苏晚棠庇护下以命定之人的身份进入会场。她带着废弃岛基改写过的反收割指令终版，请求把自己的因果主权授权给五域联军，作为整场大战的反推演联结中枢。代价很明白，一旦整张网反噬，最先被吞噬的人就是她。洛衍之这一次没有再站在台下沉默。他取下断念剑放在盟台中央，说她的因果主权，他接一半。因为金之道种碎片可以在推演网反冲的瞬间帮她分流冲击，而他们之间早已经留下足够让这件事成立的那条线。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '他说完之后，把那枚在熔岩堡废墟里捡回来的小金环也放到了议案边上。顾长惜低头看着那枚环，姿势与很久以前泉井边那次放碎芒的动作几乎一模一样，只是这一次，环里包着的不再只是某个人单方面留下的东西，而是两个人在同一场战争里都没有松开的指节与意志。盟会散去后，苏晚棠在天台上把一枚碧蓝水针交到顾长惜掌心，那是她用自己本命水灵脉凝成的退路。若推演网络反冲到无法承受的地步，顾长惜可以借这根水针瞬间切断与天机阁因果网的全部连接，代价是此前积累的所有数据与立足点全部清零。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'choice',
      text: '——第四十三章·战盟·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 100 },
            { type: 'flag_set', flag: 'war_council', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

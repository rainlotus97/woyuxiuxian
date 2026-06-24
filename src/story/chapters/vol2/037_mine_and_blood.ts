import type { StoryChapter } from '@/types/storyChapter'

export const chapter_mine_and_blood: StoryChapter = {
  id: 'vol2_ch037_mine_and_blood',
  title: '第三十七章·矿与血',
  volume: 2,
  order: 37,
  perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'blood_and_secrets', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '九幽子的吞天教在赤晶矿脉发动总攻那天天还没亮。洛衍之守在矿脉主入口的阵壁上，用剑感扫到远处密密麻麻的散修灵力信号，那不是一支队伍，而是一大片浑浊洪流。火系吞噬灵力裹着厚重的道种残韵压下来，说明九幽子本人已经带着核心碎片到了。云斐然站在阵壁另一端，紫岚剑第一次在出鞘前先炸开紫电，阵壁上被烧出一道像雷劈过的焦痕，所有人都知道这会是一场不能退的硬仗。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '战斗从清晨打到黄昏。洛衍之死守矿道主入口，断念剑一遍遍劈断九幽子用来远程抽取散修精气的吞噬灵力连线，每断一条，虎口便被反震撕开一分。云斐然率侧翼突袭时却被九幽子亲手堵在绝壁边，金丹对元婴，紫岚剑被拍弯成一道曲弧，丹田也被震出一道难以逆转的裂痕。他最后仍握着左手木剑死撑到援军赶回，把变形的紫岚剑掷向矿道深处，用最后一口气留下那句要传给洛衍之的话。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '洛衍之听见那句话时，正跪在矿道最底部劈断九幽子布下的最后一根供能链。他抬头看见那道掷来的紫光，也看见云斐然靠在阵壁边那个再也不会站起来的身影。那天矿脉守住了，可剑宗的阵亡和伤者也堆满了后营。裴忘渊在战后表彰令里破例亲手加了一行字，写明云斐然以左手木剑挡元婴堕修，守阵至死。洛衍之看完整张诏令，只觉得胸口像被谁塞进了一块烧红的矿石。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '战后第三天，洛衍之在矿区废墟里找到齐岳。齐岳那柄重剑已经彻底裂成两截，他便用剩下的半截剑身在碎石上一笔一笔刻名字。每一具从废墟里抬出来的剑宗弟子遗体旁，他都会刻下一块石牌，再用剑背轻轻敲一下。他说，这是老家的规矩，敲一下，就是告诉死去的人，还有人记得你。洛衍之没有刻字，他只是把那些刻了名字的石头一块块搬到英灵碑基座下，垒成一座极矮却极稳的小塔。齐岳后来又刻下一个名字，说那是柳青霜，第二峰总站在你左后方的那个师妹，她的剑也断了。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第三十七章·矿与血·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 120 },
            { type: 'flag_set', flag: 'mine_and_blood', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

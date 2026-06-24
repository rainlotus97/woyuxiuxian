/**
 * 卷一 · 第一章：觉醒
 * 触发条件：选择性别后自动触发（auto类型）
 */
import type { StoryChapter } from '@/types/storyChapter'

export const chapter_awakening: StoryChapter = {
  id: 'vol1_ch001_awakening',
  title: '第一章·觉醒',
  volume: 1,
  order: 1,
  perspective: 'both',
  triggers: [
    { type: 'realm', realm: "炼气", realmLevel: 1, order: 1 }
  ],
  npcIntroductions: ['npc_su_qingyuan'],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '你从一片混沌中醒来，头痛欲裂。眼前是陌生的山壁，苔藓和泥土的气息混在一起，岩缝里透进来的光昏暗而微弱。',
      narratorText: '水声。滴答，滴答——像是某种古老的计时。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '你挣扎着坐起来，发现自己身处一个山洞深处。身上没有伤，但衣衫褴褛，像是经历了什么你完全记不起的事。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'dialog',
      speaker: '？？？',
      text: '你终于醒了。',
      narratorText: '一个清冷的声音从不远处传来，带着一丝如释重负的意味。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '你循声望去，看到一个白衣女子坐在洞口的光影交界处。她身上有几道触目惊心的伤口，血迹已经干涸，但她的目光平静得不像一个重伤的人。',
      narratorText: '她打量着你，眼神里有一种奇怪的情绪——像是看到了某个久别重逢的人。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'dialog',
      speaker: '白衣女子',
      speakerTitle: '？？？',
      text: '你叫什么名字？不记得了？那就先别想了。我叫苏清鸢。记住这个名字，以后你会经常叫的。',
      narratorText: '她的语气随意，却带着一种笃定。',
      autoNext: 's6'
    },
    {
      id: 's6',
      type: 'narrative',
      text: '你试图问这里是什么地方，但苏清鸢只是摇了摇头，指了指洞口的方向。',
      autoNext: 's7'
    },
    {
      id: 's7',
      type: 'dialog',
      speaker: '苏清鸢',
      text: '这座山叫青冥山，外面是青云界。至于这个世界本身——她顿了顿——等你准备好了我再告诉你。',
      narratorText: '她的目光落在你身上，似乎在等待你的回答。',
      choices: [
        {
          text: '"准备好了什么？"',
          nextSectionId: 's8a',
          effects: [
            { type: 'npc_favor', npcId: 'npc_su_qingyuan', value: 5 }
          ]
        },
        {
          text: '沉默地看着她',
          nextSectionId: 's8b'
        }
      ]
    },
    {
      id: 's8a',
      type: 'dialog',
      speaker: '苏清鸢',
      text: '准备好接受一个事实——这个世界，是一座牢笼。我们所有人，都是笼中之鸟。',
      narratorText: '她说这话时语气平淡，却让整个山洞的温度仿佛降低了几分。',
      autoNext: 's9'
    },
    {
      id: 's8b',
      type: 'narrative',
      text: '你沉默地看着她，苏清鸢却像是读懂了你目光里的疑问，轻轻笑了一下。',
      narratorText: '她站起身，拍了拍衣上的尘土。',
      autoNext: 's9b'
    },
    {
      id: 's9b',
      type: 'dialog',
      speaker: '苏清鸢',
      text: '不信？没关系。等你站到足够高的地方，自然能看到这座牢笼的边界。',
      autoNext: 's9'
    },
    {
      id: 's9',
      type: 'narrative',
      text: '苏清鸢站起身来，朝你伸出手。她的手掌不大，却有着一种让人安心的力量。',
      narratorText: '"走吧，先离开这里。路上我再告诉你更多。"',
      autoNext: 's10'
    },
    {
      id: 's10',
      type: 'choice',
      text: '你看着她的手，做了一个决定。',
      choices: [
        {
          text: '握住她的手，站起身来',
          nextSectionId: 's11a',
          effects: [
            { type: 'npc_favor', npcId: 'npc_su_qingyuan', value: 10 },
            { type: 'npc_unlock', npcId: 'npc_su_qingyuan' }
          ]
        },
        {
          text: '自己撑着岩壁站起来',
          nextSectionId: 's11b',
          effects: [
            { type: 'npc_favor', npcId: 'npc_su_qingyuan', value: -5 },
            { type: 'npc_unlock', npcId: 'npc_su_qingyuan' }
          ]
        }
      ]
    },
    {
      id: 's11a',
      type: 'narrative',
      text: '你的手触到她的掌心，温热的。她微微一怔，随即握紧了你，将你拉了起来。那一瞬间，你感到一种奇异的联系——像是两根原本平行的命运线，在这一刻缠绕在了一起。',
      narratorText: '她松开手，转身朝洞口走去，但你没有错过她嘴角那一丝几乎不可察觉的笑意。',
      autoNext: 's12'
    },
    {
      id: 's11b',
      type: 'narrative',
      text: '你撑着岩壁站了起来，拒绝了她的手。苏清鸢没有在意，自然地收回手，转身朝洞口走去。但你注意到，她眼底闪过一丝复杂的情绪——像是失望，又像是理解。',
      autoNext: 's12'
    },
    {
      id: 's12',
      type: 'dialog',
      speaker: '苏清鸢',
      text: '外面的世界，比你想象的要大，也要小。大到你穷尽一生也走不完，小到——她回头看了你一眼——不过是掌中沙。',
      narratorText: '她的身影融入了洞口的阳光中。你深吸一口气，跟了上去。',
      autoNext: 's13'
    },
    {
      id: 's13',
      type: 'narrative',
      text: '走出山洞的那一刻，阳光刺得你睁不开眼。耳边是风声、鸟鸣、远处瀑布的轰鸣——一个真实的、灵气充沛的世界。',
      narratorText: '但苏清鸢的话还在你脑海里回荡：这座世界，是一座牢笼。',
      autoNext: 's14'
    },
    {
      id: 's14',
      type: 'choice',
      text: '你站在青冥山的山腰，看着眼前无边无际的山川云海，心中的疑问越来越多。',
      choices: [
        {
          text: '"世界为什么是牢笼？"',
          nextSectionId: 's15a',
          effects: [
            { type: 'npc_favor', npcId: 'npc_su_qingyuan', value: 5 }
          ]
        },
        {
          text: '"我们现在去哪？"',
          nextSectionId: 's15b'
        }
      ]
    },
    {
      id: 's15a',
      type: 'dialog',
      speaker: '苏清鸢',
      text: '因为有人——或者说，有某种力量——把这个世界封住了。天上是穹顶，海外是无尽虚空。没有人能真正离开。但……她看向你——也许我们可以。',
      narratorText: '她说"我们"的时候，语气自然得像在说一件理所当然的事。',
      autoNext: 's16'
    },
    {
      id: 's15b',
      type: 'dialog',
      speaker: '苏清鸢',
      text: '去最近的仙镇，青云镇。你需要先学会引气入体，踏入修行之门。放心——我会教你。',
      narratorText: '她走在前头，没有回头，但语气里有一种笃定的从容。',
      autoNext: 's16'
    },
    {
      id: 's16',
      type: 'narrative',
      text: '你跟在苏清鸢身后，沿着山间小路向下走去。阳光穿透林间的雾气，在你前方投下斑驳的光影。',
      narratorText: '这个世界有太多的未知，但你隐隐感觉到，从你遇到这个女子的那一刻起，你的命运已经不再属于你自己。',
      choices: [
        {
          text: '——序章·觉醒·完——',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 50 },
            { type: 'gold', value: 10 }
          ]
        }
      ]
    },
    {
      id: 's_end',
      type: 'section_end',
      text: '',
      choices: []
    }
  ]
}

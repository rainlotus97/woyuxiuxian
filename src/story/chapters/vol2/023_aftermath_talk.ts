import type { StoryChapter } from '@/types/storyChapter'

export const chapter_aftermath_talk: StoryChapter = {
  id: 'vol2_ch023_aftermath_talk',
  title: '第二十三章·战后摊牌',
  volume: 2, order: 23, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'saved_changxi', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1', type: 'narrative',
      text: '火山喷发后第三天半夜，洛衍之一个人摸出了剑宗的营地。他没有告诉云斐然——他不知道为什么，但这次不想让他知道。赤炎域边境有一座荒山，山顶是一整块被火山灰覆成灰色的巨岩。顾长惜已经在那里了——站在巨岩最边缘的地方，背对着月光。她的白衣在暗红天空和灰火山灰的对比下像一片不会融化的雪。两人在巨岩上并肩坐下来——不是靠得很近，刚好隔了两个手臂的距离。但这两个手臂的距离里没有剑。',
      autoNext: 's2'
    },
    {
      id: 's2', type: 'dialog', speaker: '顾长惜',
      text: '我叫顾长惜。天机阁阁主司天命的养女。三岁被天机阁挑中——因为我有天机之瞳。从小到大，我的每一个任务、每一次闭关、每一个认识的人——都是被安排好的。他们叫我"命定之人"——意思是我生来就是为了完成一个已经推演好的命运。但我在青冥山遇见你的那天，我的天机之瞳没有提前推演到。你是第一个不在我命运因果里的人。',
      emotion: '平静地说',
      autoNext: 's3'
    },
    {
      id: 's3', type: 'narrative',
      text: '洛衍之听完沉默了一会儿。然后他说了一句话——语气和当初在青冥山溪涧边他站起来面对四个黑衣人时一模一样。',
      autoNext: 's4'
    },
    {
      id: 's4', type: 'dialog', speaker: '洛衍之',
      text: '我父亲当年离开剑宗的时候，整个宗门都说他背叛了剑道。但我知道——他只是选择了比剑道更重要的东西。你不喜欢别人给你安排的路——那就别走。你不需要命运给你许可。',
      autoNext: 's5'
    },
    {
      id: 's5', type: 'narrative',
      text: '两个人在月光下的巨岩上并肩坐到后半夜。谁也没有再说话。天蒙蒙亮的时候，顾长惜站起身把灵骨丹的空瓶塞进袖子里，然后极轻地像是自言自语般说了一句："赤炎域的任务结束之后，如果我那时候还活着——我会去找你。"她没有等他回答——转身走下了巨岩。她的背影被初升的太阳拉得很长，投在铺满火山灰的山坡上。洛衍之看着她的背影一点一点缩小，然后低下头——嘴角极轻地弯了一下。不是笑，是那种在心里下定了一个谁也不用知道的决心之后的、自然而然的面部动作。',
      autoNext: 's6'
    },
    {
      id: 's6', type: 'choice',
      text: '风把火山灰吹起来，在他们之间画了一道长长的灰色的线——像是某种迟到的约定。',
      choices: [
        { text: '——第二十三章·战后摊牌·完——', nextSectionId: 's_end',
          effects: [{ type: 'realm_exp', value: 70 }, { type: 'npc_favor', npcId: 'npc_guchangxi', value: 10 }, { type: 'flag_set', flag: 'revealed_identities', flagValue: true }] }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

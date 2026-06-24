import type { StoryChapter } from '@/types/storyChapter'

export const chapter_dao_seed_battle: StoryChapter = {
  id: 'vol2_ch021_dao_seed_battle',
  title: '第二十一章·道种碎片之争',
  volume: 2, order: 21, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'reunited_in_chiyan', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1', type: 'narrative',
      text: '赤炎域南部一座死火山的火山口里，发现了一枚新涌现的火之道种碎片。消息在不到半天内同时传到了三方——玄天剑宗、天机阁和烈焰天宗。三方各派出小队前往争夺。死火山的山壁由凝固的熔岩构成——黑中泛红、质地粗糙但极其坚硬。火山口底部是一个直径百丈的岩浆湖，已经半凝固，但湖面上还漂浮着数十块大小不一的、在暗红色背景下泛着火星的道种碎片。最大的一枚在湖心处悬浮着——有拳头大小，通体赤红，表面上跳动着肉眼可见的火之道种纹路。',
      autoNext: 's2'
    },
    {
      id: 's2', type: 'narrative',
      text: '三支队伍在火山口边缘对峙。烈焰天宗占据主场优势——一位元婴初期的长老带着三十个人，态度最强硬。"赤炎域的地盘，道种碎片就是赤炎域的。"云斐然代表剑宗一步不让："道种碎片无主，谁拿到是谁的。"顾长惜代表着天机阁的中立身份——她试图提出一个三方共同封存碎片、日后协议分配的方案。但烈焰天宗的长老没有给她说完的机会："天机阁是吧？你们天天推演这个推演那个——这一次推演出来怎么赢再说。"话音未落，他就率先爆出一道火蛇朝云斐然劈了过去。混战爆发。',
      autoNext: 's3'
    },
    {
      id: 's3', type: 'narrative',
      text: '洛衍之在混战中追着湖心那枚最大的碎片冲入火山口深处。他踩着半凝固的熔岩石板跳跃前行，脚下的熔岩在每一次受力后都会微微陷下去然后弹回来。顾长惜从另一个方向切入了火山口内层——她猜到了他会来。两个人在火山内壁一条仅容两人并行的狭窄石梁上站住了。石梁宽不到三尺，下面是翻涌的熔岩，头顶是坍塌的火山喷口缘壁。两个人面对面——中间隔着横亘在他们之间的一年时光、一年修行、和此刻各自身后代表的两个即将全面开战的阵营。顾长惜抽出水蓝短剑。洛衍之举起了断念剑——然后他说了一句她没想到的话。',
      autoNext: 's4'
    },
    {
      id: 's4', type: 'dialog', speaker: '洛衍之', text: '你受伤了。右肩。又是在来之前受的伤，对吗？',
      emotion: '平静',
      narratorText: '顾长惜握着剑的手僵住了。隔了一整年——隔着一次筑基突破、隔着赤炎域的火山灰和被烧成灰的街道——他居然还能从她的步伐中看出旧伤的痕迹。',
      autoNext: 's5'
    },
    {
      id: 's5', type: 'choice',
      text: '暗红色的熔岩光在两人之间跳动着。石梁在岩浆的冲涌下微微震动。',
      choices: [
        { text: '——第二十一章·道种碎片之争·完——', nextSectionId: 's_end',
          effects: [{ type: 'realm_exp', value: 70 }, { type: 'flag_set', flag: 'faced_at_volcano', flagValue: true }] }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

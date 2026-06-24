import type { StoryChapter } from '@/types/storyChapter'

export const chapter_foundation_building: StoryChapter = {
  id: 'vol2_ch017_foundation_building',
  title: '第十七章·筑基之路',
  volume: 2, order: 17, perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'volume1_complete', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1', type: 'narrative',
      text: '炼气九层圆满的第二天，江溯把洛衍之叫到后院松树下。他没喝酒——连续三天没喝——因为他攒了二十年的修炼资源要一次性全部交给一个人。那是二十个装满灵石的布袋、三枚金丹期才能完全炼化的淬骨丹、一整套从剑宗炼器堂换来的经脉淬炼银针。满打满算够任何一个弟子从炼气突破到筑基中期——但他给了洛衍之一个人。"你爹当年没用到的东西——儿子替他用了。"',
      autoNext: 's2'
    },
    {
      id: 's2', type: 'narrative',
      text: '洛衍之在后山闭关冲击筑基。七天七夜之间，他用江溯给的资源引灵气淬体，将炼气九层的灵气基础压入丹田深处，试图凝结剑形筑基——整个剑宗历史上只有三个人成功过，其中一个就是洛长渊。但就在筑基即将完成的关键时刻，断念剑中的金之道种碎片察觉到了丹田中金属性灵气的凝聚——它苏醒了。不是辅助——是吞噬。碎片的力量远超洛衍之的境界承受力。',
      autoNext: 's3'
    },
    {
      id: 's3', type: 'narrative',
      text: '金之道种碎片在他丹田中像一轮失控的金色太阳一样膨胀——经脉发出不堪重负的脆响。江溯在闭关室门外的蒲团上瞬间感应到了——不是因为声音，而是因为整座第三峰的剑意在同一刻震动了一下。他破门而入一掌按在洛衍之胸口的丹田位置，以元婴中期的本命真元将道种碎片强行压制下去。他的脸变成了灰白色，嘴角慢慢溢出一条暗红色的血线——根骨伤了。此后修为再难寸进。洛衍之睁开眼睛，看到的第一个人就是江溯——脸白得像纸，但正在笑。"你欠我一壶好酒。"',
      autoNext: 's4'
    },
    {
      id: 's4', type: 'narrative',
      text: '洛衍之筑基成功。丹田中一枚剑形筑基初成——不是圆形、不是标准的结晶状，而是一柄微缩的金色小剑悬浮在丹田中。成功凝结剑形筑基意味着他的道途与剑道彻底绑在一起——从此以后他不是剑修——他是剑。"行了——出去。别在这儿碍我的眼。"江溯挥着手赶他出去——但洛衍之在门口回头时看到江溯转过身去，肩膀微微颤了一下。不是因为伤——是因为洛长渊当年元婴时的剑形金丹和这一模一样。',
      autoNext: 's5'
    },
    {
      id: 's5', type: 'choice',
      text: '筑基成功当日，洛衍之正式被授予玄天剑宗内门精英弟子身份，获下品法器"玄铁剑"一柄，并获得修习玄天剑诀完整第一式破风的正式资格。',
      choices: [
        { text: '——第十七章·筑基之路·完——', nextSectionId: 's_end',
          effects: [{ type: 'realm_exp', value: 150 }, { type: 'flag_set', flag: 'foundation_built', flagValue: true }, { type: 'item_gain', itemId: 'sword_xuantie', quantity: 1 }] }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

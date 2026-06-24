import type { StoryChapter } from '@/types/storyChapter'

export const chapter_reunion: StoryChapter = {
  id: 'vol2_ch020_reunion',
  title: '第二十章·时隔一年的重逢',
  volume: 2, order: 20, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'entered_chiyan', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1', type: 'narrative',
      text: '炎角镇在三个月前还是赤炎域边境上一个有三百户人家的中等仙镇。每周一场灵石集市，每年一次灵草庙会。现在它的街道上散落着烧焦的木料、砸碎的陶罐、还有零星的、被火山灰半掩着的尸体。剑宗先锋队驻扎在镇东侧一所尚未倒塌的石殿里。云斐然把剑往地上一插，铺开地图标出吞天教的探知范围："三天之内他们会来——不是这个镇，是镇后面的赤晶矿脉。我们先清掉周围散落的探子。"洛衍之被分到镇西侧——靠近炎角镇入口的旧街——扫清留守的吞天教外围散修。',
      autoNext: 's2'
    },
    {
      id: 's2', type: 'narrative',
      text: '他在一间被烧成空壳的铁匠铺门口停下了脚步。不是因为有敌人——是因为铁匠铺里的砧台还立着。砧台上的铁胚已经冷了，但墙角还挂着一把没打完的柴刀。洛衍之在门口站了好一会儿，直到他腰间的断念剑忽然震了一下——不是在警告，而是感应到了一股极其熟悉的灵力。水蓝色的、微凉的、带着一道在她右肩处有一个灵力空白区的——是她。他转过身，在旧街尽头看到了一个白衣的身影。',
      autoNext: 's3'
    },
    {
      id: 's3', type: 'narrative',
      text: '顾长惜在踏入炎角镇的瞬间也感应到了。她左眼中的银色光晕在识别那股金系灵力时亮了一下——不是暴烈的、不是侵略性的，而是一种极锋锐、极精准的灵力质感。她隔着整条被火山灰覆盖的旧街看到了他——腰间的断念剑在暗红色的天光中泛着一道极淡的金色光晕。她走了过去，脚下的火山灰被风卷起来像一层灰色的薄纱。然后她在他五步之外停下来。两个人站在一条烧焦的街上，周围是坍塌的房屋和流着熔岩的地缝。',
      autoNext: 's4'
    },
    {
      id: 's4', type: 'dialog', speaker: '洛衍之', text: '你来了。', emotion: '极轻',
      autoNext: 's5'
    },
    {
      id: 's5', type: 'dialog', speaker: '顾长惜', text: '嗯。', autoNext: 's6'
    },
    {
      id: 's6', type: 'narrative',
      text: '他们对视了一眼——然后立刻被各自的同伴拉走。云斐然的警告在洛衍之耳边回响——那个白衣女子是天机阁的人，剑宗和天机阁在道种资源分配上摩擦不断，这个人是敌非友。顾长惜的随从——两个天机阁的筑基执事——也同样警告她：剑宗的人不可信，尤其是那个穿紫袍的。但两人被拽走前的最后一眼——都落在了对方腰间的剑上。他的断念剑辉光未散，她的水蓝短剑也还亮着微光。',
      autoNext: 's7'
    },
    {
      id: 's7', type: 'choice',
      text: '夜色降下时，炎角镇西侧的火山口又喷了一次灰——暗红色的火山碎屑像一场无声的烟火洒遍了整个小镇。',
      choices: [
        { text: '——第二十章·时隔一年的重逢·完——', nextSectionId: 's_end',
          effects: [{ type: 'realm_exp', value: 80 }, { type: 'npc_favor', npcId: 'npc_guchangxi', value: 10 }, { type: 'flag_set', flag: 'reunited_in_chiyan', flagValue: true }] }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

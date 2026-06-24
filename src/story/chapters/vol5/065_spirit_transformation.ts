import type { StoryChapter } from '@/types/storyChapter'

export const chapter_spirit_transformation: StoryChapter = {
  id: 'vol5_ch065_spirit_transformation', title: '第六十五章·化神之路', volume: 5, order: 65, perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'volume4_complete', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '洛衍之在玄天域一座无名孤山的峰巅闭关冲击化神。他没有选剑宗的静室——他选了一座能看到悬剑峰和沧澜海域同时在一条线上的荒山。归尘剑不在他手里——三年前他把剑封在了归尘渊底。但他不需要拔它。他在突破化神时需要的不是一柄剑，是所有铸进这柄剑里的人。他在冻土上盘膝坐下，把剑感沉入识海最深处——那里存着他从断念剑第一天被金灵石激活以来所有经历过的剑意共鸣记录。他闭上眼睛，在这一片识海深处，他听到了剑鸣。不是一柄剑的剑鸣——是四柄剑的同一道鸣响在时间轴上分别演奏的合奏：断念剑被父亲最后一次挥出时的决绝，问天剑沉睡二十年后被儿子血脉唤醒时的温润，归尘剑在铸剑炉中三条剑意初次相遇时不分彼此的相融——以及他自己丹田里那枚金色小剑自筑基起就从未间断过的低颤。而后他又听到了三样不是剑的东西：酒壶底上江溯刻字的刮擦声、云斐然用木剑在墙上练左手劈刺时磨出的第三十七万次声响、柳青霜的霜落剑在崩碎前最后半息里剑柄缠布被灵力撕开的细响。',
      autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '这些声音在同一刻叠成了一个他从未听过的音节。那不是音——是他识海里的剑感把所有愿意记住的东西编成的一个永久记忆印记。他不需要刻意去理解它，它已经刻进了他化神时的元婴内核。化神之后他做的第一件事是御风去了归尘渊边。三年前他把归尘剑封在这里时，渊还是一道深不见底的天道裂隙。如今渊面平静如镜——水下深处有一道极稳定的金色微光在规律地脉动。他站在渊边对着那道微光轻轻说了一句——不是对任何人的祈求，只是一种交代：父亲，江师父——我没把你们的剑用坏。那道微光的脉动在他话音刚落时稍微快了一丁点——像一口气，像一声遥遥的、隔了不知多少层水的回应。',
      autoNext: 's3' },
    { id: 's3', type: 'choice', text: '归尘渊的水面上映出他化神后的面孔——和筑基那年站在第三峰后山对着夜空挥出破风式的年轻人长得一模一样，只是眼睛里多了一层极淡的金色光晕——那是金之道种的自律印记，不是力量，是誓约。',
      choices: [{ text: '——第六十五章·化神之路·完——', nextSectionId: 's_end',
        effects: [{ type: 'realm_exp', value: 250 }, { type: 'flag_set', flag: 'spirit_transformation', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

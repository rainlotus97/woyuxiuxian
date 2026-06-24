import type { StoryChapter } from '@/types/storyChapter'
export const chapter_destiny_cross: StoryChapter = {
  id: 'vol5_ch077_destiny_cross', title: '第七十七章·命运交叉', volume: 5, order: 77, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'finale_prelude', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '门后的世界不是时间也不是空间——是一片由天道最初始的运转法则构成的灰色原野。不是没有颜色，是每一种颜色都在这片原野上以最初始的形态均匀地存在着，互相不夺目。原野正中央空着一把椅子。椅背上刻满了三万年来所有试图坐上这把椅子的先人的名字——每一道名字都是一道被天道本身铭记的痕迹。最上一排的名字已经淡了，但最新刻上的两个字还很深——明衍。下一行留白。洛衍之走向那把椅子。他的每一步都让原野上的灰色逐渐偏向金色——不是因为他的灵根，而是因为他体内那些逝者的剑意在共同释放对这把椅子的回应。他站在椅前的时候，归尘剑在门外渊底轻震了一下——不是警告，是托付。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '他没有坐上去。他把自己的手放在椅背上明衍名字下方的那段留白上——不是用灵力刻字，就只是把手放上去。他在那里站了很久。原野在他的手温下缓缓变亮——不是金光，是日光。那种在灵药谷里照过一株赤血灵芝的晨光，在剑宗后山松树下照过一个空酒壶的午光，在碧落宫天台上照过一个灵石环被套进无名指时的夕光。他把手从椅背上拿开——那把空椅在他手指离开时缓缓沉入了原野之中。从此以后，世上再也没有一把可以让人坐上去的天道之椅。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '原野上空的灰色云层裂开了一线——不是天光，是一道持续了无数年岁才第一次看到开口的、小小的裂缝。', choices: [
      { text: '——第七十七章·命运交叉·完——', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 300 }, { type: 'flag_set', flag: 'destiny_cross', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}

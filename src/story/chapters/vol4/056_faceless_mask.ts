import type { StoryChapter } from '@/types/storyChapter'

export const chapter_faceless_mask: StoryChapter = {
  id: 'vol4_ch056_056_faceless_mask',
  title: '第五十六章·无面尊者的面具',
  volume: 4,
  order: 56,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'faceless_revealed', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '阴伯符自毁的余震尚未散尽，无面尊者便从吞噬阵自身的法则投影中缓缓析出。他披着无法辨认年代的黑袍，青铜面具光滑如镜。然后他取下面具。底下是一张普通到让人脊背发凉的中年面孔，没有任何表情，但每一条极细的皱纹里都刻着被时间磨穿的疲累。他开口，语气平和得像在说别人的事：你们现在的选择，我当年都选过。理想的尽头不是毁灭，而是被自己当初最对的那句话绑了三万年，久到忘了那句话也可以不对。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '他说完后重新戴回面具。那不是为了遮盖，而是把唯一还像人的那张脸，藏回他自己也无法撤销的习惯之中。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第五十六章·无面尊者的面具·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 268 },
            { type: 'flag_set', flag: '056_faceless_mask', flagValue: true },
            { type: 'flag_set', flag: 'faceless_revealed', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}

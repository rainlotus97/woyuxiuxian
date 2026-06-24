import type { StoryChapter } from '@/types/storyChapter'

import { chapter_iron_and_blood } from './vol1/001_iron_and_blood.ts'
import { chapter_mountain_encounter } from './vol1/002_mountain_encounter.ts'
import { chapter_spirit_herb_valley } from './vol1/003_spirit_herb_valley.ts'
import { chapter_sword_whisper } from './vol1/004_sword_whisper.ts'
import { chapter_hermits_secret } from './vol1/005_hermits_secret.ts'
import { chapter_sword_sect } from './vol1/006_sword_sect.ts'
import { chapter_first_sword_heart } from './vol1/007_first_sword_heart.ts'
import { chapter_girl_in_tianji } from './vol1/008_girl_in_tianji.ts'
import { chapter_sword_qi_forms } from './vol1/009_sword_qi_forms.ts'
import { chapter_changqing_envoy } from './vol1/010_changqing_envoy.ts'
import { chapter_sect_tournament } from './vol1/011_sect_tournament.ts'
import { chapter_rebel_of_qingmu } from './vol1/012_rebel_of_qingmu.ts'
import { chapter_fathers_wish } from './vol1/013_fathers_wish.ts'
import { chapter_eyes_of_destiny } from './vol1/014_eyes_of_destiny.ts'
import { chapter_first_blood } from './vol1/015_first_blood.ts'
import { chapter_parting_vow } from './vol1/016_parting_vow.ts'
import { chapter_return_to_tianji } from './vol1/017_return_to_tianji.ts'
import { chapter_iron_and_sword } from './vol1/018_iron_and_sword.ts'
import { chapter_first_mission } from './vol1/019_first_mission.ts'
import { chapter_shadows_of_destiny } from './vol1/020_shadows_of_destiny.ts'
import { chapter_border_reunion } from './vol1/021_border_reunion.ts'
import { chapter_volcano_standoff } from './vol1/022_volcano_standoff.ts'
import { chapter_embers_of_truth } from './vol1/023_embers_of_truth.ts'
import { chapter_after_the_flame } from './vol1/024_after_the_flame.ts'
import { chapter_report_and_lies } from './vol1/025_report_and_lies.ts'
import { chapter_words_before_parting } from './vol1/026_words_before_parting.ts'
import { chapter_return_to_the_peak } from './vol1/027_return_to_the_peak.ts'
import { chapter_the_weight_of_destiny } from './vol1/028_the_weight_of_destiny.ts'
import { chapter_path_to_abyss } from './vol1/029_path_to_abyss.ts'
import { chapter_into_the_abyss } from './vol1/030_into_the_abyss.ts'
import { chapter_trial_by_sword } from './vol1/031_trial_by_sword.ts'
import { chapter_golden_core_dawn } from './vol1/032_golden_core_dawn.ts'

import { chapter_foundation_building } from './vol2/017_foundation_building.ts'
import { chapter_border_alert } from './vol2/018_border_alert.ts'
import { chapter_chiyan_envoy } from './vol2/019_chiyan_envoy.ts'
import { chapter_reunion } from './vol2/020_reunion.ts'
import { chapter_dao_seed_battle } from './vol2/021_dao_seed_battle.ts'
import { chapter_volcano_asura } from './vol2/022_volcano_asura.ts'
import { chapter_aftermath_talk } from './vol2/023_aftermath_talk.ts'
import { chapter_foundation_peak } from './vol2/024_foundation_peak.ts'
import { chapter_tianji_secret } from './vol2/025_tianji_secret.ts'
import { chapter_plotting } from './vol2/026_plotting.ts'
import { chapter_war_declared } from './vol2/027_war_declared.ts'
import { chapter_battlefield_pairing } from './vol2/028_battlefield_pairing.ts'
import { chapter_swallowing_calamity } from './vol2/029_swallowing_calamity.ts'
import { chapter_blood_price_dawn } from './vol2/030_blood_price_dawn.ts'
import { chapter_distant_bells } from './vol2/031_distant_bells.ts'
import { chapter_separate_paths } from './vol2/032_separate_paths.ts'
import { chapter_new_horizons } from './vol2/033_new_horizons.ts'
import { chapter_the_approaching_storm } from './vol2/034_the_approaching_storm.ts'
import { chapter_edge_of_war } from './vol2/035_edge_of_war.ts'
import { chapter_blood_and_secrets } from './vol2/036_blood_and_secrets.ts'
import { chapter_mine_and_blood } from './vol2/037_mine_and_blood.ts'
import { chapter_their_own_war } from './vol2/038_their_own_war.ts'
import { chapter_crossing_swords } from './vol2/039_crossing_swords.ts'
import { chapter_the_furnace } from './vol2/040_the_furnace.ts'
import { chapter_aftermath_and_ash } from './vol2/041_aftermath_and_ash.ts'
import { chapter_return_to_the_sword } from './vol2/042_return_to_the_sword.ts'
import { chapter_war_council } from './vol2/043_war_council.ts'
import { chapter_the_eye_of_the_storm } from './vol2/044_the_eye_of_the_storm.ts'
import { chapter_sword_soul_abyss } from './vol3/033_sword_soul_abyss.ts'
import { chapter_sword_soul_depths } from './vol3/034_sword_soul_depths.ts'
import { chapter_sword_heart_formed } from './vol3/035_sword_heart_formed.ts'
import { chapter_changqing_confrontation } from './vol3/036_changqing_confrontation.ts'
import { chapter_valley_upheaval } from './vol3/037_valley_upheaval.ts'
import { chapter_fissures } from './vol3/038_fissures.ts'
import { chapter_dao_devouring_array } from './vol3/039_dao_devouring_array.ts'
import { chapter_white_deer_realm } from './vol3/040_white_deer_realm.ts'
import { chapter_tianji_prison } from './vol3/041_tianji_prison.ts'
import { chapter_guchangxi_break } from './vol3/043_guchangxi_break.ts'
import { chapter_tianji_fall } from './vol3/044_tianji_fall.ts'
import { chapter_into_the_abyss_vol3 } from './vol3/045_into_the_abyss.ts'
import { chapter_the_final_choice } from './vol3/046_the_final_choice.ts'
import { chapter_new_dawn } from './vol3/047_new_dawn.ts'
import { chapter_five_domain_mobilize } from './vol3/048_five_domain_mobilize.ts'
import { chapter_five_routes } from './vol4/049_five_routes.ts'
import { chapter_underground_array } from './vol4/050_underground_array.ts'
import { chapter_liuqingshuang_sword } from './vol4/051_liuqingshuang_sword.ts'
import { chapter_yunfeiran_death } from './vol4/052_yunfeiran_death.ts'
import { chapter_white_deer_falls } from './vol4/053_white_deer_falls.ts'
import { chapter_shenjingming_redemption } from './vol4/054_shenjingming_redemption.ts'
import { chapter_yinbofu_awakening } from './vol4/055_yinbofu_awakening.ts'
import { chapter_faceless_mask } from './vol4/056_faceless_mask.ts'
import { chapter_former_dao_lord } from './vol4/058_former_dao_lord.ts'
import { chapter_luoyanzhi_choice } from './vol4/059_luoyanzhi_choice.ts'
import { chapter_ruins_dawn } from './vol4/061_ruins_dawn.ts'
import { chapter_guichen_rebirth } from './vol5/071_guichen_rebirth.ts'
import { chapter_five_domain_future } from './vol5/072_five_domain_future.ts'
import { chapter_nine_heavens_promise } from './vol5/079_nine_heavens_promise.ts'

export const ALL_CHAPTERS: StoryChapter[] = [
  chapter_iron_and_blood,
  chapter_mountain_encounter,
  chapter_spirit_herb_valley,
  chapter_sword_whisper,
  chapter_hermits_secret,
  chapter_sword_sect,
  chapter_first_sword_heart,
  chapter_girl_in_tianji,
  chapter_sword_qi_forms,
  chapter_changqing_envoy,
  chapter_sect_tournament,
  chapter_rebel_of_qingmu,
  chapter_fathers_wish,
  chapter_eyes_of_destiny,
  chapter_first_blood,
  chapter_parting_vow,
  chapter_return_to_tianji,
  chapter_iron_and_sword,
  chapter_first_mission,
  chapter_shadows_of_destiny,
  chapter_border_reunion,
  chapter_volcano_standoff,
  chapter_embers_of_truth,
  chapter_after_the_flame,
  chapter_report_and_lies,
  chapter_words_before_parting,
  chapter_return_to_the_peak,
  chapter_the_weight_of_destiny,
  chapter_path_to_abyss,
  chapter_into_the_abyss,
  chapter_trial_by_sword,
  chapter_golden_core_dawn,
  chapter_foundation_building,
  chapter_border_alert,
  chapter_chiyan_envoy,
  chapter_reunion,
  chapter_dao_seed_battle,
  chapter_volcano_asura,
  chapter_aftermath_talk,
  chapter_foundation_peak,
  chapter_tianji_secret,
  chapter_plotting,
  chapter_war_declared,
  chapter_battlefield_pairing,
  chapter_swallowing_calamity,
  chapter_blood_price_dawn,
  chapter_distant_bells,
  chapter_separate_paths,
  chapter_new_horizons,
  chapter_the_approaching_storm,
  chapter_edge_of_war,
  chapter_blood_and_secrets,
  chapter_mine_and_blood,
  chapter_their_own_war,
  chapter_crossing_swords,
  chapter_the_furnace,
  chapter_aftermath_and_ash,
  chapter_return_to_the_sword,
  chapter_war_council,
  chapter_the_eye_of_the_storm,
  chapter_sword_soul_abyss,
  chapter_sword_soul_depths,
  chapter_sword_heart_formed,
  chapter_changqing_confrontation,
  chapter_valley_upheaval,
  chapter_fissures,
  chapter_dao_devouring_array,
  chapter_white_deer_realm,
  chapter_tianji_prison,
  chapter_guchangxi_break,
  chapter_tianji_fall,
  chapter_into_the_abyss_vol3,
  chapter_the_final_choice,
  chapter_new_dawn,
  chapter_five_domain_mobilize,
  chapter_five_routes,
  chapter_underground_array,
  chapter_liuqingshuang_sword,
  chapter_yunfeiran_death,
  chapter_white_deer_falls,
  chapter_shenjingming_redemption,
  chapter_yinbofu_awakening,
  chapter_faceless_mask,
  chapter_former_dao_lord,
  chapter_luoyanzhi_choice,
  chapter_ruins_dawn,
  chapter_guichen_rebirth,
  chapter_five_domain_future,
  chapter_nine_heavens_promise
]

export const CHAPTERS_BY_VOLUME: Record<number, StoryChapter[]> = {
  1: [
    chapter_iron_and_blood,
    chapter_mountain_encounter,
    chapter_spirit_herb_valley,
    chapter_sword_whisper,
    chapter_hermits_secret,
    chapter_sword_sect,
    chapter_first_sword_heart,
    chapter_girl_in_tianji,
    chapter_sword_qi_forms,
    chapter_changqing_envoy,
    chapter_sect_tournament,
    chapter_rebel_of_qingmu,
    chapter_fathers_wish,
    chapter_eyes_of_destiny,
    chapter_first_blood,
    chapter_parting_vow,
    chapter_return_to_tianji,
    chapter_iron_and_sword,
    chapter_first_mission,
    chapter_shadows_of_destiny,
    chapter_border_reunion,
    chapter_volcano_standoff,
    chapter_embers_of_truth,
    chapter_after_the_flame,
    chapter_report_and_lies,
    chapter_words_before_parting,
    chapter_return_to_the_peak,
    chapter_the_weight_of_destiny,
    chapter_path_to_abyss,
    chapter_into_the_abyss,
    chapter_trial_by_sword,
    chapter_golden_core_dawn
  ],
  2: [
    chapter_foundation_building,
    chapter_border_alert,
    chapter_chiyan_envoy,
    chapter_reunion,
    chapter_dao_seed_battle,
    chapter_volcano_asura,
    chapter_aftermath_talk,
    chapter_foundation_peak,
    chapter_tianji_secret,
    chapter_plotting,
    chapter_war_declared,
    chapter_battlefield_pairing,
    chapter_swallowing_calamity,
    chapter_blood_price_dawn,
    chapter_distant_bells,
    chapter_separate_paths,
    chapter_new_horizons,
    chapter_the_approaching_storm,
    chapter_edge_of_war,
    chapter_blood_and_secrets,
    chapter_mine_and_blood,
    chapter_their_own_war,
    chapter_crossing_swords,
    chapter_the_furnace,
    chapter_aftermath_and_ash,
    chapter_return_to_the_sword,
    chapter_war_council,
    chapter_the_eye_of_the_storm
  ],
  3: [
    chapter_sword_soul_abyss,
    chapter_sword_soul_depths,
    chapter_sword_heart_formed,
    chapter_changqing_confrontation,
    chapter_valley_upheaval,
    chapter_fissures,
    chapter_dao_devouring_array,
    chapter_white_deer_realm,
    chapter_tianji_prison,
    chapter_guchangxi_break,
    chapter_tianji_fall,
    chapter_into_the_abyss_vol3,
    chapter_the_final_choice,
    chapter_new_dawn,
    chapter_five_domain_mobilize
  ],
  4: [
    chapter_five_routes,
    chapter_underground_array,
    chapter_liuqingshuang_sword,
    chapter_yunfeiran_death,
    chapter_white_deer_falls,
    chapter_shenjingming_redemption,
    chapter_yinbofu_awakening,
    chapter_faceless_mask,
    chapter_former_dao_lord,
    chapter_luoyanzhi_choice,
    chapter_ruins_dawn
  ],
  5: [
    chapter_guichen_rebirth,
    chapter_five_domain_future,
    chapter_nine_heavens_promise
  ]
}

export const CHAPTER_MAP: Record<string, StoryChapter> = Object.fromEntries(
  ALL_CHAPTERS.map(chapter => [chapter.id, chapter])
)

export function getChapterById(id: string): StoryChapter | undefined {
  return CHAPTER_MAP[id]
}

export function getChaptersByVolume(volume: number): StoryChapter[] {
  return CHAPTERS_BY_VOLUME[volume] ?? []
}

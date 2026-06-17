import Phaser from 'phaser'
import { BattleScene } from '@/game/scenes/BattleScene'
import { BootScene } from '@/game/scenes/BootScene'
import { PreloadScene } from '@/game/scenes/PreloadScene'

export interface CreateGameOptions {
  parent: HTMLElement
  width: number
  height: number
  startScene?: string
}

export function createGame(options: CreateGameOptions): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    width: options.width,
    height: options.height,
    backgroundColor: '#120f17',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true
    },
    scene: [
      new BootScene(options.startScene ?? 'BattleScene'),
      PreloadScene,
      BattleScene
    ]
  })
}

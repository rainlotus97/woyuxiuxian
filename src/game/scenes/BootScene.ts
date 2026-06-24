import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor(private readonly startScene: string) {
    super('BootScene')
  }

  create() {
    this.scene.start('PreloadScene', { startScene: this.startScene })
  }
}

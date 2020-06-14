import { UIAsset } from './../assets/UIAsset';
import { PlayerHpChangeEventData } from '../events/Event';
import EventDispatcher from '../events/EventDispatcher';
import { FontAsset } from '../assets/FontAsset';
import Phaser from 'phaser';
import { Event } from '../events/Event';

/**
 * UI for displaying the player's current hit points
 * @class
 * @classdesc
 * This class listens for {@link Event#PlayerHpChange} event and updates the 
 * UI accordingly.
 */
class HitPointsBar extends Phaser.GameObjects.Container
{

  // the font size of the text "HP"
  private static readonly HP_TEXT_FONT_SIZE = 18;

  // the spacing used for layout
  private static readonly SPACING = 6;
  
  // the sprites for the heart
  private heartSprites: Phaser.GameObjects.Sprite[];

  // the reference to the "HP" text
  private hpText: Phaser.GameObjects.BitmapText;

  /**
   * @param {Phaser.Scene} scene - the scene this object belongs to
   * @param {number} x - the x world coordinate in pixels
   * @param {number} y - the y world coordinate in pixels
   */
  constructor(scene: Phaser.Scene, x: number, y: number)
  {
    super(scene, x, y);

    // add this container to the scene
    this.scene.add.existing(this);

    // initialize memeber variables
    this.hpText = new Phaser.GameObjects.BitmapText(this.scene, 
      0, HitPointsBar.SPACING, FontAsset.PressStart2P, "HP", HitPointsBar.HP_TEXT_FONT_SIZE);

    const firstHeart = new Phaser.GameObjects.Sprite(this.scene, 
      this.hpText.width + HitPointsBar.SPACING, 0, UIAsset.HeartFull)
      .setOrigin(0, 0).setScale(2);
    const secondHeart = new Phaser.GameObjects.Sprite(this.scene, 
      firstHeart.x + firstHeart.getBounds().width, 0, UIAsset.HeartFull)
      .setOrigin(0, 0).setScale(2);
    const thirdHeart = new Phaser.GameObjects.Sprite(this.scene, 
      secondHeart.x + secondHeart.getBounds().width, 0, UIAsset.HeartFull)
      .setOrigin(0, 0).setScale(2);
    const fourthHeart = new Phaser.GameObjects.Sprite(this.scene, 
      thirdHeart.x + thirdHeart.getBounds().width, 0, UIAsset.HeartFull)
      .setOrigin(0, 0).setScale(2);
    this.heartSprites = [firstHeart, secondHeart, thirdHeart, fourthHeart];

    // add ui components to container
    this.add(this.hpText);
    this.add(this.heartSprites);

    // event handling
    EventDispatcher.getInstance().on(Event.PlayerHpChange, this.handlePlayerHpChangeEvent, this);

    // clean up listeners when removed
    this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventDispatcher.getInstance().off(Event.PlayerHpChange, this.handlePlayerHpChangeEvent, this);
    });
  }

  /**
   * Callback for receiving {@link Event#PlayerHpChange} event.
   * @param {DamageEventData} data - the data associated with the event
   */
  private handlePlayerHpChangeEvent(data: PlayerHpChangeEventData): void
  {

    const currentHitPoints = data.currentHitPoints;

    const numFullHearts = Math.floor(currentHitPoints / 2);
    const hasHalfHeart = currentHitPoints % 2 !== 0;

    for (let i = 0; i < this.heartSprites.length; i++)
    {
      if (i < numFullHearts)
      {
        this.heartSprites[i].setTexture(UIAsset.HeartFull);
      }
      else
      {
        if (i === numFullHearts && hasHalfHeart)
        {
          this.heartSprites[i].setTexture(UIAsset.HeartHalf);
        }
        else
        {
          this.heartSprites[i].setTexture(UIAsset.HeartEmpty); 
        }
      } 
    }

    // flash animation
    this.scene.tweens.addCounter({
      duration: 50,
      from: 255,
      to: 0,
      onUpdate: (tween) => {
        const value = Math.floor(tween.getValue());
        const tintColor = Phaser.Display.Color.GetColor(value, value, value);
        this.heartSprites.forEach(heartSprite => heartSprite.setTintFill(tintColor));
        this.hpText.setTint(tintColor);
      },
      onComplete: () => {
        this.heartSprites.forEach(heartSprite => heartSprite.clearTint());
        this.hpText.clearTint();
      },
      loop: 2,
      yoyo: true
    })

  }

}

export default HitPointsBar;

import { InputState } from '../../types';
import type { Player } from '../Player';

export abstract class PlayerState {
  protected player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  abstract enter(): void;
  abstract update(dt: number, input: InputState): void;
  abstract exit(): void;
}

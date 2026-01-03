
import { InputState } from '../../types';
import type { Player } from '../Player';
import * as THREE from 'three';

export abstract class PlayerState {
  protected player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  abstract enter(): void;
  abstract update(dt: number, input: InputState, camera?: THREE.Camera): void;
  abstract exit(): void;
}

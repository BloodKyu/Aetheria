
export const GAME_CONFIG = {
  INTERNAL_WIDTH: 640,
  INTERNAL_HEIGHT: 480,
  FOG_COLOR: 0x87CEEB,
  FOG_NEAR: 10,
  FOG_FAR: 40,
  GRAVITY: 30, // Acts on Z axis now
  PLAYER_SPEED: 8,
  JUMP_FORCE: 12,
  // UE5 Style: X=Front, Z=Up. Camera Behind (-X) and Up (+Z)
  CAMERA_OFFSET: { x: -8, y: 0, z: 5 },
  CAMERA_LOOK_AT_OFFSET: { x: 0, y: 0, z: 1 },
};

export const COLORS = {
  SKY: 0x87CEEB,
  GROUND: 0x3a5f0b,
  PLAYER: 0xff0000,
  PLAYER_HEAD: 0xffccaa,
  HAIR: 0x1a1a1a,
  SHORTS: 0x111111,
  SHOES: 0x4a3b2a,
  OBSTACLE: 0x555555,
  TREE_TRUNK: 0x4d2926,
  TREE_LEAVES: 0x1e4d2b,
};

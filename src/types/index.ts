export type FormationName = 'diffuse' | 'lorenz' | 'rhodonea' | 'clifford' | 'trefoil' | 'torus' | 'aizawa' | 'harmonics' | 'thomas' | 'helix' | 'mobius' | 'shell' | 'rossler' | 'klein' | 'cinquefoil' | 'halvorsen' | 'milkyway'

export interface FormationState {
  currentIndex: number
  targetIndex: number
  morphProgress: number // 0 = at current, 1 = arrived at target
  paused: boolean       // auto-cycle paused
}

export interface MouseState {
  x: number
  y: number
  prevX: number
  prevY: number
  velocity: number
  speed: number
  isLongPress: boolean
  longPressStart: number
}

export interface ChainFormationConfig {
  roamColor: { tail: [number, number, number]; head: [number, number, number] }
  chaseColor: { tail: [number, number, number]; head: [number, number, number] }
  curvatureBias: number
  speedScale: number
  maxLength: number
}

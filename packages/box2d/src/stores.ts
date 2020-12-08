import * as g from '0g';
import { EntityContact } from '.';

export const transform = g.store('transform', {
  x: 0,
  y: 0,
  angle: 0,
});

export type BodyConfigData = {
  friction?: number;
  isStatic?: boolean;
  angle?: number;
  restitution?: number;
  bullet?: boolean;
  fixedRotation?: boolean;
  density?: number;
  angularDamping?: number;
  linearDamping?: number;
} & (
  | {
      shape: 'circle';
      radius: number;
    }
  | {
      shape: 'rectangle';
      width: number;
      height: number;
    }
);

export const body = g.store('body', {
  mass: 0,
  velocity: { x: 0, y: 0 },
  angularVelocity: 0,
  config: {
    shape: 'circle',
    radius: 1,
    density: 1,
    frictionAir: 0,
    friction: 0,
    isStatic: false,
    angle: 0,
    restitution: 0,
    bullet: false,
    fixedRotation: false,
  } as BodyConfigData,
  forces: {
    velocity: null as { x: number; y: number } | null,
    impulse: null as { x: number; y: number } | null,
  },
});

export const contacts = g.store('contacts', {
  began: new Array<EntityContact>(),
  current: new Array<EntityContact>(),
  ended: new Array<EntityContact>(),
});
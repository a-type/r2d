import { transform } from '../stores/transform';
import { r2d } from '../../../src';

export const demoMovement = r2d.system({
  stores: {
    transform: transform,
  },
  run: (stores, _, { delta }) => {
    stores.transform.x = Math.cos(delta / 1000) * 100;
    stores.transform.y = Math.sin(delta / 1000) * 100;
  },
});
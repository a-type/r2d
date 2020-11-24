import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { GlobalStore, World } from '../../src/index';
import * as prefabs from './prefabs';
import { plugins } from './plugins';

import './index.css';
import { PX_SCALE, SIZE } from './constants';

const world: GlobalStore = {
  tree: {
    id: 'scene',
    children: {
      paddle: {
        id: 'paddle',
        children: {},
      },
      ball: {
        id: 'ball',
        children: {},
      },
      leftWall: {
        id: 'leftWall',
        children: {},
      },
      rightWall: {
        id: 'rightWall',
        children: {},
      },
      topWall: {
        id: 'topWall',
        children: {},
      },
      blockSpawner: {
        id: 'blockSpawner',
        children: {},
      },
    },
  },
  entities: {
    scene: {
      id: 'scene',
      prefab: 'Scene',
      stores: {},
      parentId: null,
    },
    paddle: {
      id: 'paddle',
      parentId: 'scene',
      prefab: 'Paddle',
      stores: {
        bodyConfig: {
          shape: 'rectangle',
          density: 1,
          width: SIZE / 3,
          height: SIZE / 20,
          restitution: 1,
          angle: 0,
          friction: 0.25,
          fixedRotation: true,
        },
        forces: {
          velocity: { x: 0, y: 0 },
        },
        transform: { x: 0, y: SIZE / 2 },
      },
    },
    ball: {
      id: 'ball',
      parentId: 'scene',
      prefab: 'Ball',
      stores: {
        bodyConfig: {
          shape: 'circle',
          density: 0.1,
          radius: 1,
          restitution: 1,
          friction: 0.25,
          angle: 0,
          bullet: true,
          fixedRotation: true,
        },
        forces: {
          velocity: { x: 0, y: 0 },
        },
        transform: { x: 0, y: 0 },
      },
    },
    leftWall: {
      id: 'leftWall',
      parentId: 'scene',
      prefab: 'Wall',
      stores: {
        bodyConfig: {
          shape: 'rectangle',
          density: 100,
          width: 5,
          height: SIZE,
          restitution: 1,
          angle: 0,
          isStatic: true,
        },
        transform: { x: -SIZE / 2, y: 0 },
      },
    },
    rightWall: {
      id: 'rightWall',
      parentId: 'scene',
      prefab: 'Wall',
      stores: {
        bodyConfig: {
          shape: 'rectangle',
          density: 1,
          width: 5,
          height: SIZE,
          restitution: 1,
          angle: 0,
          isStatic: true,
        },
        transform: { x: SIZE / 2, y: 0 },
      },
    },
    topWall: {
      id: 'topWall',
      parentId: 'scene',
      prefab: 'Wall',
      stores: {
        bodyConfig: {
          shape: 'rectangle',
          density: 1,
          width: SIZE,
          height: 0.5,
          restitution: 1,
          angle: 0,
          isStatic: true,
        },
        transform: { x: 0, y: -SIZE / 2 },
      },
    },
    blockSpawner: {
      id: 'blockSpawner',
      parentId: 'scene',
      prefab: 'BlockSpawner',
      stores: {
        transform: {
          y: -SIZE / 3,
        },
      },
    },
  },
};

const App = () => {
  return (
    <div
      className="Viewport"
      style={{
        transform: `scale(${window.innerWidth / SIZE / PX_SCALE})`,
      }}
    >
      <div className="CenterSpaceTransformer">
        <World prefabs={prefabs} scene={world} plugins={plugins} />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

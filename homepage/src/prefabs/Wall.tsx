import * as React from 'react';
import { r2d } from '../../../src';
import { useBodyStyles } from '../hooks/useBodyStyles';
import { rigidBody } from '../systems/rigidBody';

export const Wall = r2d.prefab({
  name: 'Wall',
  systems: {
    rigidBody: rigidBody,
  },
  Component: ({ stores }) => {
    return <div className="Wall" style={useBodyStyles(stores)} />;
  },
});
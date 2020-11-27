import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useProxy } from 'valtio';
import { TreeNode } from '../types';
import { worldContext } from '../World';
import { ContextMenu } from './ContextMenu';
import { EntityPane } from './EntityPane';
import { Html } from './Html';
import { Button } from '@chakra-ui/react';

const sceneTreeContext = React.createContext<{
  selected: string;
  setSelected: (id: string) => void;
}>({
  selected: 'scene',
  setSelected: () => {
    return;
  },
});

export function SceneTree() {
  const ctx = React.useContext(worldContext);
  if (!ctx) {
    throw new Error('Game tools must be used within the World');
  }

  const [selected, setSelected] = React.useState('scene');

  const tree = useProxy(ctx.store.tree);

  const selectedEntity = ctx.store.entities[selected];

  return (
    <sceneTreeContext.Provider value={{ selected, setSelected }}>
      <div className="panel fixed-left">
        <SceneTreeNode treeNode={ctx.store.tree} level={0} />
      </div>
      <div className="panel fixed-right">
        <EntityPane entity={selectedEntity} />
      </div>
    </sceneTreeContext.Provider>
  );
}

function SceneTreeNode({
  treeNode,
  level,
}: {
  level: number;
  treeNode: TreeNode;
}) {
  const { selected, setSelected } = React.useContext(sceneTreeContext);

  const { id, children } = useProxy(treeNode);

  const [contextOpen, setContextOpen] = React.useState(false);
  const toggleContext = React.useCallback((ev?: React.MouseEvent) => {
    ev?.preventDefault();
    setContextOpen((v) => !v);
  }, []);

  return (
    <div style={{ marginLeft: level > 0 ? 8 : 0 }}>
      <ContextMenu
        isOpen={contextOpen}
        onClose={toggleContext}
        title={id}
        target={
          <Button
            className="button"
            onClick={() => setSelected(id)}
            onContextMenu={toggleContext}
          >
            {id}
            {selected === id && ' *'}
          </Button>
        }
      >
        TODO
      </ContextMenu>
      <div>
        {Object.keys(children).map((name) => (
          <SceneTreeNode
            level={level + 1}
            treeNode={treeNode.children[name]}
            key={name}
          />
        ))}
      </div>
    </div>
  );
}
import { EventEmitter } from 'events';
import { Archetype } from './Archetype';
import { Component, ComponentInstanceFor, ComponentType } from './components';
import { Game } from './Game';
import { logger } from './logger';

export interface ArchetypeManagerEvents {
  archetypeCreated(archetype: Archetype): void;
  entityCreated(entityId: number): void;
  entityComponentAdded(entityId: number, component: Component): void;
  entityComponentRemoved(entityId: number, componentType: number): void;
  entityDestroyed(entityId: number): void;
}
export declare interface ArchetypeManager {
  on<U extends keyof ArchetypeManagerEvents>(
    ev: U,
    cb: ArchetypeManagerEvents[U],
  ): this;
  off<U extends keyof ArchetypeManagerEvents>(
    ev: U,
    cb: ArchetypeManagerEvents[U],
  ): this;
  emit<U extends keyof ArchetypeManagerEvents>(
    ev: U,
    ...args: Parameters<ArchetypeManagerEvents[U]>
  ): boolean;
}
export class ArchetypeManager extends EventEmitter {
  // an all-0 bitstring the size of the number of Component types
  emptyId: string;

  // maps entity ids to archetypes
  entityLookup = new Array<string | undefined>();

  // maps archetype id bitstrings to Archetype instances
  archetypes: Record<string, Archetype> = {};

  constructor(private game: Game) {
    super();
    // FIXME: why +1 here? Component ids are not starting at 0... this
    // should be more elegant
    this.emptyId = new Array(
      this.game.componentManager.componentTypes.length + 1,
    )
      .fill('0')
      .join('');
    this.archetypes[this.emptyId] = new Archetype(this.emptyId);
  }

  createEntity(entityId: number) {
    logger.debug(`Creating entity ${entityId}`);
    this.entityLookup[entityId] = this.emptyId;
    this.getOrCreate(this.emptyId).addEntity(entityId, []);
    this.emit('entityCreated', entityId);
  }

  private getInsertionIndex(instanceList: Component[], instance: Component) {
    let insertionIndex = instanceList.findIndex((i) => i.type > instance.type);
    if (insertionIndex === -1) {
      insertionIndex = instanceList.length;
    } else {
      insertionIndex -= 1;
    }
    return insertionIndex;
  }

  addComponent<T extends ComponentType>(
    entityId: number,
    instance: ComponentInstanceFor<T>,
  ) {
    logger.debug(`Adding ${instance.type} to entity ${entityId}`);
    const oldArchetypeId = this.entityLookup[entityId];
    if (oldArchetypeId === undefined) {
      throw new Error(
        `Tried to add component ${instance.type} to ${entityId}, but it was not found in the archetype registry`,
      );
    }
    const oldArchetype = this.getOrCreate(oldArchetypeId);

    // remove data from old archetype
    const instanceList = oldArchetype.removeEntity(entityId);
    // add new instance to instance list - must be inserted in order
    instanceList.splice(
      this.getInsertionIndex(instanceList, instance),
      0,
      instance,
    );

    const newArchetypeId = (this.entityLookup[entityId] = this.flipBit(
      oldArchetypeId,
      instance.type,
    ));
    const archetype = this.getOrCreate(newArchetypeId);
    // copy entity from old to new
    archetype.addEntity(entityId, instanceList);
    logger.debug(`Entity ${entityId} moved to archetype ${newArchetypeId}`);
    this.emit('entityComponentAdded', entityId, instance);
  }

  removeComponent(entityId: number, componentType: number) {
    logger.debug(`Removing ${componentType} from entity ${entityId}`);
    const oldArchetypeId = this.entityLookup[entityId];
    if (oldArchetypeId === undefined) {
      throw new Error(
        `Tried to remove component ${componentType} from ${entityId}, but it was not found in the archetype registry`,
      );
    }
    const oldArchetype = this.getOrCreate(oldArchetypeId);

    const instanceList = oldArchetype.removeEntity(entityId);
    const [removedInstance] = instanceList.splice(
      instanceList.findIndex((i) => i.type === componentType),
      1,
    );

    const newArchetypeId = (this.entityLookup[entityId] = this.flipBit(
      oldArchetypeId,
      componentType,
    ));
    const archetype = this.getOrCreate(newArchetypeId);
    archetype.addEntity(entityId, instanceList);
    logger.debug(`Entity ${entityId} moved to archetype ${newArchetypeId}`);
    this.emit('entityComponentRemoved', entityId, componentType);

    return removedInstance;
  }

  getEntity(entityId: number) {
    const archetypeId = this.entityLookup[entityId];
    if (archetypeId === undefined) {
      return null;
    }
    return this.archetypes[archetypeId].getEntity(entityId);
  }

  destroyEntity(entityId: number) {
    logger.debug(`Destroying entity ${entityId}`);
    const archetypeId = this.entityLookup[entityId];
    if (archetypeId === undefined) {
      throw new Error(
        `Tried to destroy ${entityId}, but it was not found in archetype registry`,
      );
    }
    this.entityLookup[entityId] = undefined;
    const archetype = this.archetypes[archetypeId];
    const instances = archetype.removeEntity(entityId);
    this.emit('entityDestroyed', entityId);
    return instances;
  }

  private getOrCreate(id: string) {
    let archetype = this.archetypes[id];
    if (!archetype) {
      archetype = this.archetypes[id] = new Archetype(id);
      this.emit('archetypeCreated', archetype);
    }
    return archetype;
  }

  private getId(Types: ComponentType[]) {
    return Types.map((T) => T.id).reduce(this.flipBit, this.emptyId);
  }

  private flipBit(id: string, typeId: number) {
    return (
      id.substr(0, typeId) +
      (id[typeId] === '1' ? '0' : '1') +
      id.substr(typeId + 1)
    );
  }
}
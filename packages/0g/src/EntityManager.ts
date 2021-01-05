import { EventEmitter } from 'events';
import shortid from 'shortid';
import { Entity } from './Entity';
import { Game } from './Game';
import { ObjectPool } from './internal/objectPool';
import { logger } from './logger';
import { ComponentType, ComponentInstanceFor } from './components';

export declare interface EntityManager {
  on(ev: 'entityAdded', callback: (entity: Entity) => void): this;
  on(ev: 'entityRemoved', callback: (entity: Entity) => void): this;
  on(ev: 'entityComponentAdded', callback: (entity: Entity) => void): this;
  on(ev: 'entityComponentRemoved', callback: (entity: Entity) => void): this;
  off(ev: 'entityAdded', callback: (entity: Entity) => void): this;
  off(ev: 'entityRemoved', callback: (entity: Entity) => void): this;
  off(ev: 'entityComponentAdded', callback: (entity: Entity) => void): this;
  off(ev: 'entityComponentRemoved', callback: (entity: Entity) => void): this;
}

export class EntityManager extends EventEmitter {
  pool = new ObjectPool(() => new Entity());
  _destroyList = new Array<string>();
  entities: Record<string, Entity> = {};

  constructor(private __game: Game) {
    super();
    this.__game.on('postStep', this.executeDestroys);
  }

  get ids() {
    return Object.keys(this.entities);
  }

  get entityList() {
    return Object.values(this.entities);
  }

  has(id: string) {
    return !!this.entities[id];
  }

  create(ownId: string | null = null) {
    const id = ownId || shortid();

    const ent = this.pool.acquire();
    ent.__game = this.__game;
    ent.id = id;

    this.entities[id] = ent;
    const registered = this.entities[id];

    this.emit('entityAdded', registered);
    this.__game.queries.onEntityCreated(registered);
    logger.debug(`Added ${id}`);
    return registered;
  }

  destroy(id: string) {
    this._destroyList.push(id);
    logger.debug(`Queueing ${id} for destroy`);
  }

  addStoreToEntity<Spec extends ComponentType>(
    entity: Entity,
    spec: Spec,
    initial?: Partial<ComponentInstanceFor<Spec>>,
  ) {
    logger.debug(`Adding ${spec.name} to ${entity.id}`);
    const data = this.__game.stores.acquire(spec);
    if (initial) {
      Object.assign(data, initial);
    }
    entity.__data.set(spec, data);
    this.emit('entityComponentAdded', entity);
    this.__game.queries.onEntityStoresChanged(entity);
    return data;
  }

  removeStoreFromEntity(entity: Entity, spec: ComponentType) {
    if (!entity.__data.has(spec)) return entity;
    entity.__data.delete(spec);
    this.emit('entityComponentRemoved', entity);
    this.__game.queries.onEntityStoresChanged(entity);
    return entity;
  }

  executeDestroys = () => {
    this._destroyList.forEach(this.executeDestroy);
    this._destroyList.length = 0;
  };

  private executeDestroy = (id: string) => {
    const entity = this.entities[id];
    delete this.entities[id];
    this.pool.release(entity);
    this.emit('entityRemoved', entity);
    this.__game.queries.onEntityDestroyed(entity);
    logger.debug(`Destroyed ${id}`);
  };

  serialize() {
    return this.entityList.map(this.serializeEntity);
  }

  private serializeEntity(entity: Entity) {
    const s = {
      id: entity.id,
      data: {} as Record<string, any>,
    };
    for (const [spec, dat] of entity.__data.entries()) {
      // ephemeral, recreated at runtime on load
      if ((spec as any).kind === 'state') return;
      s.data[spec.name] = dat;
    }
    return s;
  }
}
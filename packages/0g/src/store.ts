import { mergeDeepRight, clone } from 'ramda';
import { EntityData, Store, StoreApi, StoreData } from './types';
import { memoizeWith } from 'ramda';

export function store<Kind extends string, S extends StoreData>(
  kind: Kind,
  defaults: S,
  api: StoreApi = {},
): Store<Kind, S> {
  const store = ((overrides?: Partial<S>) => {
    const merged = mergeDeepRight(clone(defaults), overrides || {}) as S;
    return { ...merged, __kind: kind };
  }) as Store<Kind, S, typeof api>;
  store.isData = function isData(data: StoreData): data is S {
    return data.__kind === kind;
  };
  // TODO: memoize
  store.get = memoizeWith(
    (e) => e.id,
    function get(e: EntityData) {
      return Object.values(e.storesData).find(store.isData) ?? null;
    }.bind(store),
  );
  store.getAll = memoizeWith(
    (e) => e.id,
    function getAll(e: EntityData) {
      return Object.values(e.storesData).filter(store.isData);
    }.bind(store),
  );
  // TODO: better way to do this.
  Object.entries(api).forEach(([name, method]) => {
    (store as any)[name] = method.bind(store);
  });
  return store;
}

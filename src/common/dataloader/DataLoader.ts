import * as _DataLoader from 'dataloader';

export declare class DataLoader<K, V, C = K> extends _DataLoader<K, V, C> {
  loadAll(): Promise<Array<V>>;
}

import { Injectable } from '@angular/core';
import { DBSchema, openDB } from 'idb';
import { Area, Areas, Observation, Observations } from '../types/types';
import { BehaviorSubject } from 'rxjs';
import { TileInfo, TileLayerOffline } from 'leaflet.offline';

type ObjectStores = ObjectStore[];

type ObjectStore = { name: ObjectStoresName; keyPath: KeyPath };

type ObjectStoresName = 'observations' | 'offline-areas';

type KeyPath = 'uuid' | 'id';

type ObjectStoresType<T> = T extends 'observations'
  ? Observation
  : T extends 'offline-areas'
    ? Area
    : never;

type ObjectStoresData = Observations | Areas;

interface DB extends DBSchema {
  observations: {
    value: Observation;
    key: string;
  };
  'offline-areas': {
    value: Area;
    key: number;
  };
}

const dbVersion = 1;

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  observationsPending = new BehaviorSubject<number | null>(null);

  async handleObservationsPending() {
    const observationsPending = (await this.getAllDataInStore('observations'))
      .length;
    this.observationsPending.next(
      observationsPending && observationsPending !== 0
        ? observationsPending
        : null,
    );
  }

  async getDB() {
    const db = await openDB<DB>('db', dbVersion, {
      upgrade(db, oldVersion) {
        switch (oldVersion) {
          case 0: {
            const objectStoresNames: ObjectStores = [
              { name: 'observations', keyPath: 'uuid' },
              { name: 'offline-areas', keyPath: 'id' },
            ];

            objectStoresNames.forEach((objectStoresName) => {
              if (!db.objectStoreNames.contains(objectStoresName.name)) {
                db.createObjectStore(objectStoresName.name, {
                  keyPath: objectStoresName.keyPath,
                });
              }
            });
          }
        }
      },
    });
    return db;
  }

  async getDataInStore<T extends ObjectStoresName>(
    name: T,
    dataId: string | number,
  ): Promise<ObjectStoresType<T>> {
    const grwDb = await this.getDB();
    const data = await grwDb.get(name, dataId);
    grwDb.close();
    return data as ObjectStoresType<T>;
  }

  async getAllDataInStore<T extends ObjectStoresName>(
    name: T,
  ): Promise<ObjectStoresType<T>[]> {
    const grwDb = await this.getDB();
    const data = await grwDb.getAll(name);
    grwDb.close();
    return data as ObjectStoresType<T>[];
  }

  async writeOrUpdateDataInStore(
    name: ObjectStoresName,
    data: ObjectStoresData,
  ) {
    if (data) {
      const grwDb = await this.getDB();
      const tx = grwDb.transaction(name, 'readwrite');
      await Promise.all([...data.map((d) => tx.store.put(d)), tx.done]);
      grwDb.close();
    }
  }

  async deleteDataInStore(name: ObjectStoresName, dataId: string[]) {
    const grwDb = await this.getDB();
    const tx = grwDb.transaction(name, 'readwrite');
    await Promise.all([...dataId.map((d) => tx.store.delete(d)), tx.done]);
    grwDb.close();
  }

  async writeOrUpdateTilesInStore(
    offlineLayer: TileLayerOffline,
    bounds: any,
    minZoom: any,
    MaxZoom: any,
  ) {
    const { downloadTile, getBlobByKey, saveTile } = await import(
      'leaflet.offline'
    );
    const L = await import('leaflet');

    const tilesToStore: TileInfo[] = [];
    for (let index = minZoom; index <= MaxZoom; index++) {
      tilesToStore.push(
        ...offlineLayer.getTileUrls(
          L.default.bounds(
            L.default.CRS.EPSG3857.latLngToPoint(bounds.getNorthWest(), index),
            L.default.CRS.EPSG3857.latLngToPoint(bounds.getSouthEast(), index),
          ),
          index,
        ),
      );
    }

    const tilesToDownload = [];
    for (let index = 0; index < tilesToStore.length; index++) {
      if (!(await getBlobByKey(tilesToStore[index].key))) {
        tilesToDownload.push(
          downloadTile(tilesToStore[index].url).catch(() => null),
        );
      }
    }

    const tilesBlob = await Promise.all(
      tilesToDownload.filter((tileToDownload) => tileToDownload),
    ).then((blob) => blob);
    for (let index = 0; index < tilesBlob.length; index++) {
      await saveTile(tilesToStore[index], tilesBlob[index]!);
    }
  }

  async removeTilesInStore(
    offlineLayer: TileLayerOffline,
    bounds: any,
    minZoom: any,
    MaxZoom: any,
  ) {
    const { getBlobByKey, removeTile } = await import('leaflet.offline');
    const L = await import('leaflet');

    const tilesToStore: TileInfo[] = [];
    for (let index = minZoom; index <= MaxZoom; index++) {
      tilesToStore.push(
        ...offlineLayer.getTileUrls(
          L.default.bounds(
            L.default.CRS.EPSG3857.latLngToPoint(bounds.getNorthWest(), index),
            L.default.CRS.EPSG3857.latLngToPoint(bounds.getSouthEast(), index),
          ),
          index,
        ),
      );
    }

    const tilesToRemove = [];
    for (let index = 0; index < tilesToStore.length; index++) {
      if (await getBlobByKey(tilesToStore[index].key)) {
        tilesToRemove.push(
          removeTile(tilesToStore[index].url).catch(() => null),
        );
      }
    }

    await Promise.all(tilesToRemove.filter((tileToRemove) => tileToRemove));
  }
}

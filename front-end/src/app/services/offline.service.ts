import { Injectable } from '@angular/core';
import { DBSchema, openDB } from 'idb';
import { Observation, Observations } from '../types/types';
import { BehaviorSubject } from 'rxjs';

type ObjectStores = ObjectStore[];

type ObjectStore = { name: ObjectStoresName; keyPath: KeyPath };

type ObjectStoresName = 'observations';

type KeyPath = 'id_event';

type ObjectStoresType<T> = T extends 'observations' ? Observation : never;

type ObjectStoresData = Observations;

interface DB extends DBSchema {
  observations: {
    value: Observation;
    key: string;
  };
}

const dbVersion = 1;

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  observationsPending = new BehaviorSubject<number | null>(null);

  constructor() {}

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
              { name: 'observations', keyPath: 'id_event' },
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
    dataId: string,
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
}

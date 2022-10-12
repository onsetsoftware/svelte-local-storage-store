import type { StartStopNotifier, Writable } from "svelte/store";
import { writable } from "svelte/store";

const stores: Record<string, LocalStorageStore<any>> = {};

export class LocalStorageStore<T> implements Writable<T> {
  protected store: Writable<T>;

  constructor(
      protected key: string,
      initialValue: T,
      setter?: StartStopNotifier<T>
  ) {
    initialValue = this.exists() ? this.getData() : initialValue;

    this.setData(initialValue);

    this.store = writable<T>(initialValue, (set) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key)
          set(event.newValue ? JSON.parse(event.newValue) : null);
      };

      window.addEventListener("storage", handleStorage);

      const setterUnsubscriber = setter
          ? setter((data) => {
            this.setData(data);
            set(data);
          })
          : null;

      return () => {
        if (setterUnsubscriber) {
          setterUnsubscriber();
        }
        window.removeEventListener("storage", handleStorage);
      };
    });
  }

  public update(callback: (arg: T) => T) {
    const update = (data: T) => {
      const newData = callback(data);
      this.setData(newData);
      return newData;
    };
    this.store.update(update);
  }

  public set(data: T) {
    this.store.set(data);
    this.setData(data);
  }

  public get(): T {
    return this.getData();
  }
  
  public subscribe(callback: (value: T) => void) {
    return this.store.subscribe(callback);
  }
  
  public detach() {
    localStorage.removeItem(this.key);
  }
  
  private exists(): boolean {
    const value = localStorage.getItem(this.key);
    return !!value && value !== "undefined";
  }

  private getData(): T {
    const DATA = localStorage.getItem(this.key);
    return JSON.parse(DATA as string);
  }

  private setData(data: T) {
    const DATA = JSON.stringify(data);
    localStorage.setItem(this.key, DATA);
  }
}

export const localStorageStore = <T>(
    key: string,
    initialValue: T,
    setter?: StartStopNotifier<T>
) => {
  return (
      stores[key] ||
      (stores[key] = new LocalStorageStore<T>(key, initialValue, setter))
  );
};

export const destroyLocalStorageStore = (key: string) => {
  if (stores[key]) {
    stores[key].detach();
    delete stores[key];
  }
};

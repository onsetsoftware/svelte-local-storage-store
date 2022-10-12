# Svelte Local Storage Store

A thin wrapper on top of a Svelte writable store, backing up to local storage with built-in event handling to sync across multiple tabs.

## Installation

```bash
npm install -D @onsetsoftware/svelte-local-storage-store
```

## Usage

### Basic
```ts
import { localStorageStore } from '@onsetsoftware/svelte-local-storage-store';

const countStore = localStorageStore('count', 0);
```

### Async
```ts
import { localStorageStore } from '@onsetsoftware/svelte-local-storage-store';

const timerStore = localStorageStore('timer', 0, (set) => {
  let timer = timerStore.get();
  const interval = setInterval(() => {
    set(++timer);
  }, 1000);

  return () => clearInterval(interval);
});
```

## API

The `localStorageStore` function takes three arguments:

- `key` - The key to use for local storage
- `initialValue` - The initial value to use if the key is not found in local storage
- `start` - An optional function that will be called when the store is first subscribed to. It will be passed a `set` function that can be used to update the store. It should return a function that will be called when the store is unsubscribed from.

This is essentially the same API as the `writable` function from Svelte's `svelte/store` package, with the addition of the `key` argument.

> **Note**
> Subsequent calls to `localStorageStore` with the same `key` will return the same store instance. If you want to delete the store from local storage, you can call `destroyLocalStorageStore(key)`.
> 
> If this cache doesn't work for you, please can use the `LocalStorageStore` class directly to manage your own stores. It takes the same 3 arguments as the `localStorageStore` function.

The `localStorageStore` function returns a Svelte store that can be used in the same way as any other Svelte store and which implements the `Writable` interface.

```ts
const countStore = localStorageStore('count', 0);

countStore.set(1);

countStore.update((count) => count + 1);

countStore.subscribe((value) => {
  console.log(value);
});
```

It also exposes an additional `get` method that can be used to retrieve the current value of the store without subscribing to it.

```ts
const countStore = localStorageStore('count', 0);

countStore.get(); // => 0
```

Finally, it exposes a `detach` method that can be used to remove the key/value pair from local storage.

```ts
const countStore = localStorageStore('count', 0);
// localStorage.getItem('count') => 0

countStore.detach();
// localStorage.getItem('count') => undefined
```

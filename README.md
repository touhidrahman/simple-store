# Simple Store

## Overview
Lightweight RxJS-based state utilities for TypeScript:

- `SimpleStore<T extends Record<string, unknown>>`: Keyed selection and immutable partial updates.
- `QueryResultStore<Q,R,T>`: Manage `query`, `result`, and `transient` with cache by query.

### Peer deps
- `rxjs`
- `es-toolkit`
- `qs`
- `serialize-javascript`
- `rxjs-state-subject`

## Quick Start

### SimpleStore
Keyed selection and immutable partial updates.

```typescript
import { SimpleStore } from 'simple-store'

type AppState = { user: { name: string }, theme: 'light' | 'dark' }
const store = new SimpleStore<AppState>({ user: { name: 'Ada' }, theme: 'light' })

store.select('user').subscribe((u) => console.log(u.name))
store.setState({ theme: 'dark' })
store.destroy() // complete subscriptions bound with takeUntil
```

### QueryResultStore
Manage `query`, `result`, and `transient` with cache by query.

```typescript
import { QueryResultStore } from 'simple-store'

type Query = { q?: string; page?: number }
type Result = { items: string[] }
type Transient = { loading: boolean }

const qrs = new QueryResultStore<Query, Result, Transient>({
	query: { q: '', page: 1 },
	result: { items: [] },
	transient: { loading: false },
})

qrs.query$.subscribe(console.log)
qrs.setQuery({ q: 'books' })
// use cache key derived from query (stable, sorted, no undefineds)
const key = qrs.getCacheKey()
qrs.setResult({ items: ['A', 'B'] }) // also caches by key
const cached = qrs.getCachedResult() // -> { items: ['A','B'] }
```

## API Reference

- **`SimpleStore<T extends Record<string, unknown>>`:**
	- **`constructor(initial, unsubscriber?)`:** Optional `Subject<void>` for teardown.
	- **`setState(partial, sideEffectFn?)`:** Shallow-merge into current state.
	- **`getState()`:** Current state.
	- **`select(key, filterFn?)`:** Observable of `state[key]`, with deep equality and optional filter.
	- **`selectAll()`:** Observable of the whole state.
	- **`reset(sideEffectFn?)`:** Reset via underlying `StateSubject`.
	- **`destroy()`:** Trigger unsubscribe via `takeUntil`.

- **`QueryResultStore<Q,R,T>` extends `SimpleStore<{query:Q; result:R; transient:T}>`:**
	- **streams:** `query$`, `result$`, `transient$`.
	- **getters/setters:** `setQuery`, `getQuery`, `setResult`, `getResult`, `setTransient`, `getTransient`.
	- **cache:** `getCacheKey()`, `getCachedResult()`, `cacheResult(result)`; cache key via `qs.stringify` of query (sorted, no `undefined`).


## License
MIT

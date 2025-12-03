**Simple Store**
- **Overview:** Lightweight RxJS-based state utilities for TypeScript: `StateSubject`, `SimpleStore`, and `QueryResultStore`.
- **Why:** Minimal, predictable state with deep-equality emissions, selection by key, and optional query-result caching.

- **Peer deps:** Requires `rxjs`, `es-toolkit`, and `qs`.


**Quick Start**
- **StateSubject:** Deep-equality BehaviorSubject with reset. Only emits if a value has truly changed.
```
import { StateSubject } from 'simple-store'

const counter$ = new StateSubject({ count: 0 })
counter$.value$.subscribe(console.log) // emits only on deep changes
counter$.update({ count: 1 })
counter$.reset() // back to { count: 0 }
```

- **SimpleStore:** Keyed selection and immutable partial updates.
```
import { SimpleStore } from 'simple-store'

type AppState = { user: { name: string }, theme: 'light' | 'dark' }
const store = new SimpleStore<AppState>({ user: { name: 'Ada' }, theme: 'light' })

store.select('user').subscribe((u) => console.log(u.name))
store.setState({ theme: 'dark' })
store.destroy() // complete subscriptions bound with takeUntil
```

- **QueryResultStore:** Manage `query`, `result`, and `transient` with cache by query.
```
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

**API Reference**
- **`StateSubject<T>`:**
	- **`value$`:** Observable<T> with deep `isEqual` change checks.
	- **`update(value)`:** Push next value.
	- **`reset()`:** Reset to initial value.

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

**Notes**
- **Emissions:** Deep equality via `es-toolkit/isEqual` prevents redundant emissions.
- **Unsubscribe:** `SimpleStore.select*` streams complete on `destroy()`.
- **Cache key:** Deterministic across param order; excludes `undefined` values.
- **Type safety:** Fully generic; align your `Q`, `R`, and `T` types.

**License**
- MIT

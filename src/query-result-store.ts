import { Observable } from 'rxjs'
import { SimpleStore } from './simple-store'
import { removeOldestEntry, serializeObject } from './util'

/**
 * A specialized store for managing the state of a query, its results, and any transient data.
 * It extends SimpleStore and provides dedicated methods and observables for 'query', 'result', and 'transient' states.
 * It also includes optional caching functionality for query results.
 *
 * @template Q The type of the query object.
 * @template R The type of the query result.
 * @template T The type of transient data.
 */
export class QueryResultStore<
    Q extends Record<string, any>,
    R extends Record<string, any>,
    T extends Record<string, any>,
> extends SimpleStore<{
    query: Q
    result: R
    transient: T
}> {
    /**
     * A private cache to store query results, keyed by a string representation of the query.
     * @private
     * @type {Map<string, R>}
     */
    private cache: Map<string, R> = new Map()

    /**
     * A protected flag to control whether caching is enabled. Default is `false`.
     * @protected
     * @type {boolean}
     */
    protected useCaching = false

    /**
     * In-memory cache limit. Default is 100
     * @protected
     * @type {number}
     */
    protected cacheLimit = 100

    /**
     * An observable stream for the 'query' state.
     * Emits the current query object whenever it changes.
     * @returns {Observable<Q>} An observable of the query object.
     */
    get query$(): Observable<Q> {
        return this.select('query')
    }

    /**
     * An observable stream for the 'result' state.
     * Emits the current query result whenever it changes.
     * @returns {Observable<R>} An observable of the query result.
     */
    get result$(): Observable<R> {
        return this.select('result')
    }

    /**
     * An observable stream for the 'transient' state.
     * Emits the current transient data whenever it changes.
     * @returns {Observable<T>} An observable of the transient data.
     */
    get transient$(): Observable<T> {
        return this.select('transient')
    }

    /**
     * Updates the 'query' state with a partial query object.
     * The new query object is merged with the existing query state.
     * @param {Partial<Q>} query - A partial query object to merge.
     * @returns {void}
     */
    setQuery(query: Partial<Q>): void {
        this.setState({ query: { ...this.getState().query, ...query } })
    }

    /**
     * Retrieves the current 'query' state.
     * @returns {Q} The current query object.
     */
    getQuery(): Q {
        return this.getState().query
    }

    /**
     * Updates the 'result' state with a partial result object.
     * The new result object is merged with the existing result state.
     * If caching is enabled, the new result is also cached.
     * @param {Partial<R>} result - A partial result object to merge.
     * @returns {void}
     */
    setResult(result: Partial<R>): void {
        const newResult = { ...this.getState().result, ...result }
        this.cacheResult(newResult)
        this.setState({ result: newResult })
    }

    /**
     * Retrieves the current 'result' state.
     * @returns {R} The current query result.
     */
    getResult(): R {
        return this.getState().result
    }

    /**
     * Updates the 'transient' state with a partial transient data object.
     * The new transient data object is merged with the existing transient state.
     * @param {Partial<T>} transient - A partial transient data object to merge.
     * @returns {void}
     */
    setTransient(transient: Partial<T>): void {
        this.setState({
            transient: { ...this.getState().transient, ...transient },
        })
    }

    /**
     * Retrieves the current 'transient' state.
     * @returns {T} The current transient data.
     */
    getTransient(): T {
        return this.getState().transient
    }

    /**
     * Generates a cache key based on the current 'query' state.
     * Creates a unique string identifier for the query.
     * @private
     * @returns {string} The cache key for the current query.
     */
    private getCacheKey(): string {
        return serializeObject(this.getQuery(), true)
    }

    /**
     * Retrieves a cached result for the current query, if caching is enabled and a result exists in the cache.
     * @returns {R | undefined} The cached result, or `undefined` if caching is disabled or no cached result is found.
     */
    getCachedResult(): R | undefined {
        if (!this.useCaching) return undefined

        const key = this.getCacheKey()
        if (this.cache.has(key)) {
            return this.cache.get(key)
        }
        return undefined
    }

    /**
     * Caches a given result using the current query's cache key.
     * This operation is performed only if caching is enabled.
     * @param {R} result - The result to be cached.
     * @returns {void}
     */
    cacheResult(result: R): void {
        if (!this.useCaching) return
        if (this.cache.size >= Math.abs(this.cacheLimit)) {
            removeOldestEntry(this.cache)
        }
        this.cache.set(this.getCacheKey(), result)
    }

    /**
     * Enables or disables caching for the store.
     * @param {boolean} value - `true` to enable caching, `false` to disable.
     * @returns {void}
     */
    shouldCache(value: boolean): void {
        this.useCaching = value
    }
}

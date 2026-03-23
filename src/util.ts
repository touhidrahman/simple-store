import { omitBy } from 'es-toolkit'
import serialize from 'serialize-javascript'

export function serializeObject<Q extends Record<string, any>>(query: Q, sortKeys = true): string {
    const filtered = omitBy(query, (value) => value === undefined)
    if (!sortKeys) {
        return serialize(filtered, {
            isJSON: true,
            ignoreFunction: true,
        })
    }

    const sorted = Object.keys(filtered)
        .sort()
        .reduce(
            (acc, key) => {
                acc[key] = filtered[key]
                return acc
            },
            {} as Record<string, any>,
        )

    return serialize(sorted, {
        isJSON: true,
        ignoreFunction: true,
    })
}

export function removeOldestEntry<K, V>(map: Map<K, V>) {
    const firstKey = map.keys().next().value
    if (firstKey !== undefined) {
        map.delete(firstKey)
    }
}

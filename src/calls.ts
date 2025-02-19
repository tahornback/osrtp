import type { Maybe } from "./types"

export const getLatest = async (id: Maybe<string>) => {
    //todo
    const r = await fetch("https://prices.runescape.wiki/api/v1/osrs/latest", {
        
    })
    return await r.json()
}

export const getMapping = async () => {
    const r = await fetch("https://prices.runescape.wiki/api/v1/osrs/mapping")
    return await r.json()
}
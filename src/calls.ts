import type { Maybe } from "./types"

export const getLatest = async (id: Maybe<string>) => {
    //todo
    const params = new URLSearchParams()
    if(id) params.append("id",id)
    const r = await fetch(`https://prices.runescape.wiki/api/v1/osrs/latest?${params}`)
    return await r.json()
}

export const getMapping = async () => {
    const r = await fetch("https://prices.runescape.wiki/api/v1/osrs/mapping")
    return await r.json()
}
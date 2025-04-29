import type { Maybe, Timestep } from "./types"

export const getLatest = async (id: Maybe<string>) => {
    const params = new URLSearchParams()
    if(id) params.append("id",id)
    const r = await fetch(`https://prices.runescape.wiki/api/v1/osrs/latest?${params}`)
    return await r.json()
}

export const getMapping = async () => {
    const r = await fetch("https://prices.runescape.wiki/api/v1/osrs/mapping")
    return await r.json()
}

export const getFiveMinAverage = async (timestamp: Maybe<string>) => {
    const params = new URLSearchParams()
    if(timestamp) params.append("timestamp",timestamp)
    const r = await fetch(`https://prices.runescape.wiki/api/v1/osrs/5m?${params}`)
    return await r.json()
}

export const getOneHourAverage = async (timestamp: Maybe<string>) => {
    const params = new URLSearchParams()
    if(timestamp) params.append("timestamp",timestamp)
    const r = await fetch(`https://prices.runescape.wiki/api/v1/osrs/1h?${params}`)
    return await r.json()
}

export const getTimeSeries = async (id: number, timestep: Timestep) => {
    const params = new URLSearchParams()
    params.append("id",id+"");
    params.append("timestep", timestep);
    const r = await fetch(`https://prices.runescape.wiki/api/v1/osrs/timeseries?${params}`)
    return await r.json()
}
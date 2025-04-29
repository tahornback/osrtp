import type { LatestDataResponse, Maybe, Timestep } from "./types"

export class OldSchoolPriceAPI {

    apiRoot: String = 'https://prices.runescape.wiki/api/v1/osrs'

    getLatest = async (id: Maybe<string>): Promise<LatestDataResponse> => {
        const params = new URLSearchParams()
        if(id) params.append("id",id)
        const r = await fetch(`${this.apiRoot}/latest?${params}`)
        return await r.json()
    }
    
    getMapping = async () => {
        const r = await fetch(`${this.apiRoot}/mapping`)
        return await r.json()
    }
    
    getFiveMinAverage = async (timestamp: Maybe<string>) => {
        const params = new URLSearchParams()
        if(timestamp) params.append("timestamp",timestamp)
        const r = await fetch(`${this.apiRoot}/5m?${params}`)
        return await r.json()
    }
    
    getOneHourAverage = async (timestamp: Maybe<string>) => {
        const params = new URLSearchParams()
        if(timestamp) params.append("timestamp",timestamp)
        const r = await fetch(`${this.apiRoot}/1h?${params}`)
        return await r.json()
    }
    
    getTimeSeries = async (id: number, timestep: Timestep) => {
        const params = new URLSearchParams()
        params.append("id",id+"");
        params.append("timestep", timestep);
        const r = await fetch(`${this.apiRoot}/timeseries?${params}`)
        return await r.json()
    }
}
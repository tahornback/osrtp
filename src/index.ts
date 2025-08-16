
interface ApiResponse<T> {
  data: T;
}

interface LatestPrices {
  [itemId: string]: {
    high: number;
    highTime: number;
    low: number;
    lowTime: number;
  };
}

interface ItemMapping {
  id: number;
  name: string;
  examine: string;
  members: boolean;
  lowalch: number;
  highalch: number;
  limit: number;
  value: number;
}

interface AveragedPrice {
  avgHighPrice: number;
  highPriceVolume: number;
  avgLowPrice: number;
  lowPriceVolume: number;
}

interface AveragedPrices {
  [itemId: string]: AveragedPrice;
}

type TimeStep = "5m" | "1h" | "6h" | "24h";

interface TimeSeriesData {
  timestamp: number;
  avgHighPrice: number;
  highPriceVolume: number;
  avgLowPrice: number;
  lowPriceVolume: number;
}

const OSRTP_API_BASE_URL = "https://prices.runescape.wiki/api/v1/osrs";
const USER_AGENT = "osrtp - https://github.com/thornback/osrtp";

class OSRTPClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = OSRTP_API_BASE_URL;
  }

  private async _fetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }

    if (path === "/mapping") {
      return response.json() as Promise<T>;
    }

    const { data } = await response.json() as ApiResponse<T>;
    return data;
  }

  async getLatestPrices(): Promise<LatestPrices> {
    return this._fetch<LatestPrices>("/latest");
  }

  async getMapping(): Promise<ItemMapping[]> {
    return this._fetch<ItemMapping[]>("/mapping");
  }

  async get5mAvg(timestamp?: number): Promise<AveragedPrices> {
    const params: Record<string, number> = {};
    if (timestamp !== undefined) {
      params.timestamp = timestamp;
    }
    return this._fetch<AveragedPrices>("/5m", params);
  }

  async get1hAvg(timestamp?: number): Promise<AveragedPrices> {
    const params: Record<string, number> = {};
    if (timestamp !== undefined) {
      params.timestamp = timestamp;
    }
    return this._fetch<AveragedPrices>("/1h", params);
  }

  async getTimeSeries(id: number, timestep: TimeStep): Promise<TimeSeriesData[]> {
    return this._fetch<TimeSeriesData[]>("/timeseries", { id, timestep });
  }
}

export default OSRTPClient;

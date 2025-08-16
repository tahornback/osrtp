
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

class OSRTPClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = OSRTP_API_BASE_URL;
  }

  async getLatestPrices(): Promise<LatestPrices> {
    const response = await fetch(`${this.baseUrl}/latest`, {
      headers: {
        // TODO: Replace with a proper User-Agent
        "User-Agent": "osrtp - https://github.com/thornback/osrtp",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch latest prices: ${response.statusText}`);
    }

    const { data } = await response.json() as ApiResponse<LatestPrices>;
    return data;
  }

  async getMapping(): Promise<ItemMapping[]> {
    const response = await fetch(`${this.baseUrl}/mapping`, {
      headers: {
        // TODO: Replace with a proper User-Agent
        "User-Agent": "osrtp - https://github.com/thornback/osrtp",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch item mapping: ${response.statusText}`);
    }

    return await response.json() as ItemMapping[];
  }

  async get5mAvg(timestamp?: number): Promise<AveragedPrices> {
    const url = new URL(`${this.baseUrl}/5m`);
    if (timestamp) {
      url.searchParams.append("timestamp", timestamp.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        // TODO: Replace with a proper User-Agent
        "User-Agent": "osrtp - https://github.com/thornback/osrtp",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch 5m averaged prices: ${response.statusText}`);
    }

    const { data } = await response.json() as ApiResponse<AveragedPrices>;
    return data;
  }

  async get1hAvg(timestamp?: number): Promise<AveragedPrices> {
    const url = new URL(`${this.baseUrl}/1h`);
    if (timestamp) {
      url.searchParams.append("timestamp", timestamp.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        // TODO: Replace with a proper User-Agent
        "User-Agent": "osrtp - https://github.com/thornback/osrtp",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch 1h averaged prices: ${response.statusText}`);
    }

    const { data } = await response.json() as ApiResponse<AveragedPrices>;
    return data;
  }

  async getTimeSeries(id: number, timestep: TimeStep): Promise<TimeSeriesData[]> {
    const url = new URL(`${this.baseUrl}/timeseries`);
    url.searchParams.append("id", id.toString());
    url.searchParams.append("timestep", timestep);

    const response = await fetch(url.toString(), {
      headers: {
        // TODO: Replace with a proper User-Agent
        "User-Agent": "osrtp - https://github.com/thornback/osrtp",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch time series data: ${response.statusText}`);
    }

    const { data } = await response.json() as ApiResponse<TimeSeriesData[]>;
    return data;
  }
}

export default OSRTPClient;

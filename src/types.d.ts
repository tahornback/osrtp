export type Maybe<T> = T | null | undefined 

export type Timestep = "5m" | "1h" | "6h" | "24h"

export type LatestDataPoint = {
    high: number;
    highTime: number;
    low: number;
    lowTime: number;
};

type LatestDataMap = {
    [key: `${number}`]: LatestDataPoint;
};

type LatestDataResponse = {
    data: LatestDataMap
}
  
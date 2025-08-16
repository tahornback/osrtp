# Old School Real-time Prices (osrtp)

This is a TypeScript wrapper for the Old School Runescape real-time Grand Exchange price information REST API.

## Installation

```bash
npm install osrtp
```

## Usage

```typescript
import OSRTPClient from 'osrtp';

const client = new OSRTPClient();

// Get the latest prices for all items
const latestPrices = await client.getLatestPrices();

// Get the item mapping
const itemMapping = await client.getMapping();

// Get 5-minute averaged prices
const avg5m = await client.get5mAvg();

// Get hourly averaged prices
const avg1h = await client.get1hAvg();

// Get time series data for an item (e.g., Cannonball, ID 2)
const timeSeries = await client.getTimeSeries(2, '5m');
```

## API

The client provides the following methods:

- `getLatestPrices(): Promise<LatestPrices>`
- `getMapping(): Promise<ItemMapping[]>`
- `get5mAvg(timestamp?: number): Promise<AveragedPrices>`
- `get1hAvg(timestamp?: number): Promise<AveragedPrices>`
- `getTimeSeries(id: number, timestep: TimeStep): Promise<TimeSeriesData[]>`

For more information on the data returned by these methods, please refer to the [official API documentation](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices).

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript wrapper for the Old School RuneScape real-time Grand Exchange price information REST API. It's a simple npm package that provides a client for fetching price data from the RuneScape Wiki API.

## Development Environment

This project uses **Bun** as the JavaScript runtime and package manager (not Node.js/npm).

### Common Commands

```bash
# Install dependencies
bun install

# Run TypeScript files directly
bun run src/index.ts

# Type checking (TypeScript compiler in no-emit mode)
bun tsc
```

## Architecture

### Single-File Implementation
The entire client implementation is in `src/index.ts`. The architecture consists of:

1. **Type Definitions**: Interfaces for API responses (`LatestPrices`, `ItemMapping`, `AveragedPrices`, `TimeSeriesData`)
2. **OSRTPClient Class**: Main client class with:
   - Private `_fetch` method that handles all HTTP requests with proper User-Agent headers
   - Public methods for each API endpoint:
     - `getLatestPrices()`: Current Grand Exchange prices
     - `getMapping()`: Item ID to name/metadata mappings
     - `get5mAvg()`: 5-minute averaged prices
     - `get1hAvg()`: Hourly averaged prices
     - `getTimeSeries()`: Historical price data

### Key Implementation Details

- **API Base URL**: `https://prices.runescape.wiki/api/v1/osrs`
- **User-Agent**: Required header `osrtp - https://github.com/thornback/osrtp`
- **Response Handling**: Most endpoints wrap data in `{ data: T }` except `/mapping` which returns array directly
- **TypeScript Config**: Strict mode enabled, ESNext target, module preservation for bundler compatibility

### API Documentation

Refer to the [official API documentation](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices) for endpoint details and data schemas.
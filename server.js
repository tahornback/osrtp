/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { getFiveMinAverage, getOneHourAverage, getTimeSeries, getLatest, getMapping } from './src/calls';
import { OldSchoolPriceAPI } from './src/client';

const express = require('express');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

const client = new OldSchoolPriceAPI();

// App
const app = express();
app.get('/', (req, res) => {
	res.send('Hello remote world!\n');
});

app.get('/latest', async (req, res) => {
	console.log(req.query)
	res.send(await client.getLatest(req.query.id));
});

app.get('/mapping', async (req, res) => {
	res.send(await client.getMapping());
});

app.get('/5m', async (req, res) => {
	console.log(req.query)
	res.send(await client.getFiveMinAverage(req.query.timestamp));
});

app.get('/1h', async (req, res) => {
	console.log(req.query)
	res.send(await client.getOneHourAverage(req.query.timestamp));
});

app.get('/timeseries', async (req, res) => {
	console.log(req.query)
	res.send(await client.getTimeSeries(req.query.id, req.query.timestep));
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { getFiveMinAverage, getOneHourAverage, getLatest, getMapping } from './src/calls';

const express = require('express');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
	res.send('Hello remote world!\n');
});

app.get('/latest', async (req, res) => {
	console.log(req.query)
	res.send(await getLatest(req.query.id));
});

app.get('/mapping', async (req, res) => {
	res.send(await getMapping());
});

app.get('/5m', async (req, res) => {
	console.log(req.query)
	res.send(await getFiveMinAverage(req.query.timestamp));
});

app.get('/1h', async (req, res) => {
	console.log(req.query)
	res.send(await getOneHourAverage(req.query.timestamp));
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
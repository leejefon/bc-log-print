'use strict'

const Promise = require('bluebird');

module.exports = async (logSources, printer) => {
	let topLogs = await Promise.map(logSources, async source => await source.popAsync());
	while (!topLogs.every(log => !log)) {
		const index = nextIndex(topLogs);
		printer.print(topLogs[index]);
		topLogs[index] = await logSources[index].popAsync();
	}
	printer.done();
};

function nextIndex(logs) {
	let earliestDate = new Date();
	let id = 0;
	for (let i = 0; i < logs.length; i++) {
		if (logs[i] && logs[i].date < earliestDate) {
			earliestDate = logs[i].date;
			id = i;
		}
	}
	return id;
}

'use strict'

module.exports = (logSources, printer) => {
	let topLogs = logSources.map(source => source.pop());
	while (!topLogs.every(log => !log)) {
		const index = nextIndex(topLogs);
		printer.print(topLogs[index]);
		topLogs[index] = logSources[index].pop();
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

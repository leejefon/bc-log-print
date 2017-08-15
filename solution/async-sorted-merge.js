'use strict'

module.exports = (logSources, printer) => {
  const logsList = Array.apply(null, Array(logSources.length)).map(() => []);
  let finishedSourceCount = 0; // NOTE: Not the best idea to have a global var in async calls, but since each source has long enough logs, should be ok

  const subscription = events.subscribe('printLog', (obj) => {
    if (!obj.log) {
      finishedSourceCount++;
    }

    logsList[obj.source].push(obj.log);

    const topLogFromSources = logsList.map(logs => logs[0]);
    if (topLogFromSources.filter(l => l).length + finishedSourceCount === logSources.length) {
      const source = nextIndex(topLogFromSources);
      printer.print(logsList[source].shift());
    }

    if (finishedSourceCount === logSources.length) {
      printer.done();
      subscription.remove();
    }
  });

  logSources.forEach(async (source, i) => {
    do {
      const log = await source.popAsync();
      events.publish('printLog', {
        source: i, log
      });
      if (!log) break;
    } while (true);
  });
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

// Source: https://davidwalsh.name/pubsub-javascript
const events = (() => {
  const topics = {};
  const hOP = topics.hasOwnProperty;

  return {
    subscribe: (topic, listener) => {
      // Create the topic's object if not yet created
      if (!hOP.call(topics, topic)) topics[topic] = [];

      // Add the listener to queue
      const index = topics[topic].push(listener) - 1;

      // Provide handle back for removal of topic
      return {
        remove: () => {
          delete topics[topic][index];
        }
      };
    },
    publish: (topic, info) => {
      // If the topic doesn't exist, or there's no listeners in queue, just leave
      if (!hOP.call(topics, topic)) return;

      // Cycle through topics queue, fire!
      topics[topic].forEach((item) => {
    		item(info !== undefined ? info : {});
      });
    }
  };
})();

// Alternative Solution:
//
// const Promise = require('bluebird');
//
// module.exports = async (logSources, printer) => {
// 	let topLogs = await Promise.map(logSources, async source => await source.popAsync());
// 	while (!topLogs.every(log => !log)) {
// 		const index = nextIndex(topLogs);
// 		printer.print(topLogs[index]);
// 		topLogs[index] = await logSources[index].popAsync();
// 	}
// 	printer.done();
// };
//
// function nextIndex(logs) {
// 	let earliestDate = new Date();
// 	let id = 0;
// 	for (let i = 0; i < logs.length; i++) {
// 		if (logs[i] && logs[i].date < earliestDate) {
// 			earliestDate = logs[i].date;
// 			id = i;
// 		}
// 	}
// 	return id;
// }

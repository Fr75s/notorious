import store from "./redux/store";

// Search Filtering
export function searchFilterCheck(itemName, filter) {
	// NOTE: This assumes filter is already uppercase
	const settings = store.getState().settings;
	if (settings.strictFiltering) {
		return itemName.toUpperCase().indexOf(filter) === 0;
	} else {
		return itemName.toUpperCase().indexOf(filter) > -1;
	}
}

export function taskIndexFromID(taskData, taskSectionIndex, taskID) {
	for (let i = 0; i < taskData[taskSectionIndex].data.length; i++) {
		console.log("CHECKING", taskData[taskSectionIndex].data[i].id, "VS", taskID);
		if (taskData[taskSectionIndex].data[i].id === taskID) {
			return i;
		}
	}
}

export function getTaskFromID(taskData, taskID) {
	const sections = ["unfinished", "partial", "finished"];
	for (let i = 0; i < sections.length; i++) {
		const indexInSection = taskIndexFromID(taskData, i, taskID);
		if (indexInSection !== null) {
			return [i, indexInSection];
		}
	}
}

export function noteIndexFromID(noteData, notebook, noteID) {
	for (let i = 0; i < noteData[notebook].length; i++) {
		//console.log("CHECKING", taskData[taskSectionIndex].data[i].id, "VS", taskID);
		if (noteData[notebook][i].id === noteID) {
			return i;
		}
	}
}

export function getItemsFromCalendarDate(date, calendar) {
	let dateDataItems = [];

	// One-time Date Items
	try {
		dateDataItems = [
			...dateDataItems,
			...calendar[date.getFullYear()][date.getMonth()][date.getDate() - 1]
		]
	} catch {
		console.log(`No data for today [${date.getDate()}] (dates)`);
	}

	// Daily Items
	try {
		dateDataItems = [
			...dateDataItems,
			...calendar["daily"]
		]
	} catch {
		console.log(`No data for today [${date.getDate()}] (daily)`);
	}

	// Weekly Items
	try {
		dateDataItems = [
			...dateDataItems,
			...calendar["weekly"][d.getDay()]
		]
	} catch {
		console.log(`No data for today [${date.getDate()}] (weekly)`);
	}

	// Yearly Items
	try {
		dateDataItems = [
			...dateDataItems,
			...calendar["yearly"][date.getMonth()][date.getDate() - 1]
		]
	} catch {
		console.log(`No data for today [${date.getDate()}] (yearly)`);
	}

	return dateDataItems;
}
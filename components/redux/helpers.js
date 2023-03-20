

export function taskIndexFromID(taskData, taskSectionIndex, taskID) {
	for (let i = 0; i < taskData[taskSectionIndex].data.length; i++) {
		//console.log("CHECKING", taskData[taskSectionIndex].data[i].id, "VS", taskID);
		if (taskData[taskSectionIndex].data[i].id === taskID) {
			return i;
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
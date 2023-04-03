import { combineReducers } from "redux";

import { 
	CHANGE_SETTING, 
	SET_SETTINGS,
	RESET_SETTINGS
} from "./SettingActions";
import {
	RESET_TASKS,
	SET_TASK_DATA,
	ADD_TASK,
	MOVE_TASK,
	REMOVE_TASK,
	MODIFY_TASK,
	CHANGE_TASK_SECTION
} from "./TaskActions";
import {
	RESET_NOTES,
	SET_NOTES,
	ADD_NOTE,
	MODIFY_NOTE,
	SHIFT_NOTE,
	MOVE_NOTE,
	REMOVE_NOTE,
	CHANGE_NOTEBOOK,
	CREATE_NOTEBOOK,
	REMOVE_NOTEBOOK,
	CHANGE_SELECTED_NOTEBOOK
} from "./NoteActions";
import {
	ADD_CALENDAR_ITEM,
	DELETE_CALENDAR_ITEM,
	MODIFY_CALENDAR_ITEM,
	RESET_CALENDAR
} from "./CalendarActions";
import { 
	taskIndexFromID,
	noteIndexFromID,
} from "./helpers";

const initialSettingsState = {
	"usePartialCompletions": false,
	"clearOldFinished": true,
	"strictFiltering": false,
	"oldTaskThreshold": 7,
	"notesDrawerOnLeft": false,
};

const initialTasksState = [
	{
		title: "unfinished",
		data: [

		]
	},
	{
		title: "partial",
		data: [

		]
	},
	{
		title: "finished",
		data: [

		]
	}
];

const initialNotesState = {
	"Standard": [
		
	],
	"Archived": [
		
	],
	"Deleted": [

	]
};

/*
{
	2023: {
		0: [
			[],
			[],
			[
				{
					name: "MY ITEM!",
					desc: "It's my item!"
				}
			],
			[],
			...
		]
		3: [
			[
				{
					name: "April",
					desc: "For the 1st day"
				}
			],
			[],
			...
		]
	},
	2024: {
		2: [
			...
		]
	}
}
*/
const initialCalendarState = {};

const initialSelectedNotebookState = "Standard";

const settingReducer = (state = initialSettingsState, action) => {
	switch (action.type) {
		case CHANGE_SETTING: {
			const { key, value } = action.payload
			
			let merge = {}
			merge[key] = value;

			return {
				...state,
				...merge,
			}
		}
		case SET_SETTINGS: {
			const { settings } = action.payload
			return {
				...settings
			}
		}
		case RESET_SETTINGS: {
			return {
				...initialSettingsState
			}
		}
		default:
			return state;
	}
}

const taskReducer = (state = initialTasksState, action) => {
	switch (action.type) {
		case RESET_TASKS: {
			const { layout } = action.payload;
			return [
				...layout
			];
		}
		case SET_TASK_DATA: {
			const { data } = action.payload;
			return [
				...data
			];
		}
		case ADD_TASK: {
			const { task } = action.payload;

			//const creationDate = (new Date()).toString();
			//task.creationDate = creationDate;
			//task.completionDate = null;

			//if (task.notify) { }
			
			let newTasks = state;
			newTasks[0].data.unshift(task)
			return [
				...newTasks
			]
		}
		case MOVE_TASK: {
			const { id, sectionIndex, up } = action.payload;
			
			const taskDataIndex = taskIndexFromID(state, sectionIndex, id);
			const task = state[sectionIndex].data[taskDataIndex];

			let newTasks = state;

			if ((up && taskDataIndex > 0) || (!up && taskDataIndex < state[sectionIndex].data.length - 1)) {
				let firstPart = newTasks[sectionIndex].data.slice(0, taskDataIndex);
				let secondPart = newTasks[sectionIndex].data.slice(taskDataIndex + 1);
				
				if (up && taskDataIndex > 0) {
					secondPart.unshift(firstPart.pop());
					firstPart.push(task);
				}
				if (!up && taskDataIndex < state[sectionIndex].data.length - 1) {
					firstPart.push(secondPart.shift());
					secondPart.unshift(task);
				}

				newTasks[sectionIndex].data = firstPart.concat(secondPart);
			}

			return [
				...newTasks
			]
		}
		case REMOVE_TASK: {
			const { id, sectionIndex } = action.payload;
			const taskDataIndex = taskIndexFromID(state, sectionIndex, id);

			let newTasks = state;
			newTasks[sectionIndex].data.splice(taskDataIndex, 1);

			return [
				...newTasks
			]
		}
		case MODIFY_TASK: {
			const { id, sectionIndex, newTask } = action.payload;
			const taskDataIndex = taskIndexFromID(state, sectionIndex, id);

			let newTasks = state;
			newTasks[sectionIndex].data[taskDataIndex] = newTask;
			
			// CANCEL/RESTART NOTIFICATION IF NOTIF ENABLED

			return [
				...newTasks
			]
		}
		case CHANGE_TASK_SECTION: {
			const { id, sectionIndex, newSectionIndex, completionDate } = action.payload;
			const taskDataIndex = taskIndexFromID(state, sectionIndex, id);

			const task = state[sectionIndex].data[taskDataIndex]

			if (completionDate) {
				task.completionDate = completionDate.toString();
			}

			let newTasks = state;
			newTasks[sectionIndex].data.splice(taskDataIndex, 1);
			newTasks[newSectionIndex].data.unshift(task);

			console.log("Changing...");

			return [
				...newTasks
			]
		}
		default:
			return state;
	}
}

const noteReducer = (state = initialNotesState, action) => {
	switch (action.type) {
		case RESET_NOTES: {
			return {
				...initialNotesState
			};
		}
		case SET_NOTES: {
			const { data } = action.payload;
			return {
				...data
			};
		}
		case ADD_NOTE: {
			const { note } = action.payload;
			
			let newNotes = state;
			newNotes["Standard"].unshift(note);

			return { ...newNotes };
		}
		case MODIFY_NOTE: {
			const { id, notebook, newNote } = action.payload;
			const noteIndex = noteIndexFromID(state, notebook, id);

			let newNotes = state;
			newNotes[notebook][noteIndex] = newNote;
			
			return { ...newNotes };
		}
		case MOVE_NOTE: {
			const { id, notebook, index } = action.payload;
			const noteIndex = noteIndexFromID(state, notebook, id);
			const note = state[notebook][noteIndex];

			let newNotes = state;
			newNotes[notebook].splice(noteIndex, 1);
			newNotes[notebook].splice(index, 0, note);

			return { ...newNotes };
		}
		case SHIFT_NOTE: {
			const { id, notebook, up } = action.payload;
			const noteIndex = noteIndexFromID(state, notebook, id);
			const note = state[notebook][noteIndex];
			
			let newNotes = state;
			
			if (up && noteIndex > 0) {
				newNotes[notebook].splice(noteIndex, 1);
				newNotes[notebook].splice(noteIndex - 1, 0, note);
			}
			if (!up && noteIndex < newNotes[notebook].length - 1) {
				newNotes[notebook].splice(noteIndex, 1);
				newNotes[notebook].splice(noteIndex + 1, 0, note);
			}

			return { ...newNotes };
		}
		case REMOVE_NOTE: {
			const { id, notebook } = action.payload;
			const noteIndex = noteIndexFromID(state, notebook, id);
			const note = state[notebook][noteIndex];
			
			let newNotes = state;
			newNotes[notebook].splice(noteIndex, 1);
			//newNotes["Deleted"].unshift(note);

			return { ...newNotes };
		}
		case CREATE_NOTEBOOK: {
			const { name } = action.payload;

			let newNotes = state;
			newNotes[name] = [];

			return { ...newNotes };
		}
		case REMOVE_NOTEBOOK: {
			const { name } = action.payload;

			let newNotes = state;
			delete newNotes[name];

			return { ...newNotes };
		}
		case CHANGE_NOTEBOOK: {
			const { id, notebook, newNotebook } = action.payload;
			const noteIndex = noteIndexFromID(state, notebook, id);
			const note = state[notebook][noteIndex];
			
			let newNotes = state;
			
			if (!newNotes[newNotebook]) {
				newNotes[newNotebook] = [];
			}

			newNotes[notebook].splice(noteIndex, 1);
			newNotes[newNotebook].unshift(note);

			return { ...newNotes };
		}
		default: return state;
	}
}

const selectedNotebookReducer = (state = initialSelectedNotebookState, action) => {
	switch (action.type) {
		case CHANGE_SELECTED_NOTEBOOK: {
			const { name } = action.payload;
			return name;
		}
		default: return state;
	}
}

const calendarReducer = (state = initialCalendarState, action) => {
	switch (action.type) {
		case ADD_CALENDAR_ITEM: {
			const { item, year, month, day } = action.payload
			let newCal = state;

			if (!newCal[year])
				newCal[year] = {}
			
			if (!newCal[year][month]) {
				newCal[year][month] = [];
				for (let d = new Date(year, month, 1); d < new Date(year, month + 1, 1); d.setDate(d.getDate() + 1)) {
					newCal[year][month][d.getDate() - 1] = [];
				}
			}

			if (newCal[year][month][day - 1].length === 0) {
				newCal[year][month][day - 1] = [item]
			} else {
				newCal[year][month][day - 1].push(item);
			}

			return newCal;
		}
		case RESET_CALENDAR: {
			//console.log("RESETTING");
			return {};
		}
		default:
			return state;
	}
}

mainReducer = combineReducers({ 
	settings: settingReducer, 
	tasks: taskReducer,
	notes: noteReducer,
	selectedNotebook: selectedNotebookReducer,
	calendar: calendarReducer,
});

export default mainReducer;
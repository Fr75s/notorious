import { combineReducers } from "redux";

import { CHANGE_SETTING, SET_SETTINGS } from "./SettingActions";
import {
	RESET_TASKS,
	SET_TASK_DATA,
	ADD_TASK,
	MOVE_TASK,
	REMOVE_TASK,
	MODIFY_TASK,
	CHANGE_TASK_SECTION
} from "./TaskActions";
import { taskIndexFromID } from "./helpers";

const initialSettingsState = {
	"usePartialCompletions": false,
	"clearOldFinished": true,
	"oldTaskThreshold": 7,
}

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
]

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
			const creationDate = (new Date()).toString();

			task.creationDate = creationDate;
			task.completionDate = null;

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

mainReducer = combineReducers({ settings: settingReducer, tasks: taskReducer });

export default mainReducer;
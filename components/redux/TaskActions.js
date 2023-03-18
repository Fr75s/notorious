export const RESET_TASKS = "RESET_TASKS";
export const resetTasks = () => ({
	type: RESET_TASKS,
	payload: {
		layout: [
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
	}
});

export const SET_TASK_DATA = "SET_TASK_DATA";
export const setTaskData = (taskData) => ({
	type: SET_TASK_DATA,
	payload: {
		data: taskData,
	}
})

export const ADD_TASK = "ADD_TASK";
export const addTask = (taskObj) => ({
	type: ADD_TASK,
	payload: {
		task: taskObj,
	}
});

export const MOVE_TASK = "MOVE_TASK";
export const moveTask = (taskID, taskSectionIndex, up) => ({
	type: MOVE_TASK,
	payload: {
		id: taskID,
		sectionIndex: taskSectionIndex,
		up: up
	}
});

export const REMOVE_TASK = "REMOVE_TASK";
export const removeTask = (taskID, taskSectionIndex) => ({
	type: REMOVE_TASK,
	payload: {
		id: taskID,
		sectionIndex: taskSectionIndex
	}
});

export const MODIFY_TASK = "MODIFY_TASK";
export const modifyTask = (taskID, taskSectionIndex, newTaskObj) => ({
	type: MODIFY_TASK,
	payload: {
		id: taskID,
		sectionIndex: taskSectionIndex,
		newTask: newTaskObj
	}
});

export const CHANGE_TASK_SECTION = "CHANGE_TASK_SECTION";
export const changeTaskSection = (taskID, taskSectionIndex, newSectionIndex, assignedCompletionDate) => ({
	type: CHANGE_TASK_SECTION,
	payload: {
		id: taskID,
		sectionIndex: taskSectionIndex,
		newSectionIndex: newSectionIndex,
		completionDate: assignedCompletionDate
	}
});
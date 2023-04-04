export const ADD_CALENDAR_ITEM = "ADD_CALENDAR_ITEM";
export const addCalendarItem = (item, repeatType, year, month, day) => ({
	type: ADD_CALENDAR_ITEM,
	payload: {
		item: item,
		repeatType: repeatType,
		year: year,
		month: month,
		day: day,
	}
});

export const DELETE_CALENDAR_ITEM = "DELETE_CALENDAR_ITEM";
export const deleteCalendarItem = (id, repeatType, year, month, day) => ({
	type: DELETE_CALENDAR_ITEM,
	payload: {
		id: id,
		repeatType: repeatType,
		year: year,
		month: month,
		day: day,
	}
});

export const MODIFY_CALENDAR_ITEM = "MODIFY_CALENDAR_ITEM";
export const modifyCalendarItem = (id, repeatType, newItem, year, month, day) => ({
	type: DELETE_CALENDAR_ITEM,
	payload: {
		id: id,
		newItem: newItem,
		repeatType: repeatType,
		year: year,
		month: month,
		day: day,
	}
});

export const SET_CALENDAR = "SET_CALENDAR";
export const setCalendar = (data) => ({
	type: SET_CALENDAR,
	payload: {
		data: data
	}
})

export const RESET_CALENDAR = "RESET_CALENDAR";
export const resetCalendar = () => ({
	type: RESET_CALENDAR,
	payload: {}
})
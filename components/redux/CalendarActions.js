export const ADD_CALENDAR_ITEM = "ADD_CALENDAR_ITEM";
export const addCalendarItem = (item, year, month, day) => ({
	type: ADD_CALENDAR_ITEM,
	payload: {
		item: item,
		year: year,
		month: month,
		day: day,
	}
});

export const DELETE_CALENDAR_ITEM = "DELETE_CALENDAR_ITEM";
export const deleteCalendarItem = (id, year, month, day) => ({
	type: DELETE_CALENDAR_ITEM,
	payload: {
		id: id,
		year: year,
		month: month,
		day: day,
	}
});

export const MODIFY_CALENDAR_ITEM = "MODIFY_CALENDAR_ITEM";
export const modifyCalendarItem = (oldID, newItem, year, month, day) => ({
	type: DELETE_CALENDAR_ITEM,
	payload: {
		oldID: oldID,
		newItem: newItem,
		year: year,
		month: month,
		day: day,
	}
});

export const RESET_CALENDAR = "RESET_CALENDAR";
export const resetCalendar = () => ({
	type: RESET_CALENDAR,
	payload: {}
})
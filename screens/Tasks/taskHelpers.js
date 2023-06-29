import AsyncStorage from "@react-native-async-storage/async-storage";
import store from "../../components/redux/store";

//
// Conversions
//

// Convert Internal Repeat interval to that used by Expo
export const repeatIntervalToType = {
	"5sec": "date",
	"day": "daily",
	"week": "weekly",
	"year": "yearly"
}

// Get the Section index of the Section by its name
export function getSectionIndex(sectionName) {
	switch (sectionName) {
		case "unfinished":
			return 0;
		case "partial":
			return 1;
		case "finished":
			return 2;
	}
}

// Get Interval Display name from Internal
export function getNotifIntervalTitle(shorthand) {
	switch (shorthand) {
		case "5sec": return "Every 5 Seconds";
		case "day": return "Every Day";
		case "week": return "Every Week";
		case "month": return "Every Month";
		case "year": return "Every Year";
		default: return "";
	}
}

//
// Formatting
//

// Date string formatting for Time/Date Displays
export function formatDateString(dateString, dateMode) {
	let dateObj = {};
	if (typeof(dateString) == typeof("a"))
		dateObj = new Date(dateString);
	else
		dateObj = dateString;
	if (dateMode === "date") {
		return dateObj.toLocaleString([], {
			weekday: "short",
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	}
	if (dateMode === "time") {
		return dateObj.toLocaleString([], {
			hour: "2-digit",
			minute: "2-digit",
		})
	}
}

//
// Checks
//

// Check if no tasks are present
export function emptyTasks(tasks) {
	const noUnfinished = tasks[0].data.length === 0;
	const noPartial = tasks[1].data.length === 0;
	const noFinished = tasks[2].data.length === 0;

	return noUnfinished && noPartial && noFinished;
}
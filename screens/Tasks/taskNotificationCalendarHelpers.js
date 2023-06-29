import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import store from "../../components/redux/store";

import * as calActions from "../../components/redux/CalendarActions";

//
// Notification Helpers
//

// Create a Notification *if the task specifies to do so*
export async function createTaskNotification(task) {
	if (task.notify) {
		const notifyDate = new Date(task.notifyDate)

		console.log("Creating Notification for task", task.id);
			
		let notificationTrigger = null; //notifyDate,
		let notificationType = (task.repeatInterval ? repeatIntervalToType(task.repeatInterval) : "date");
		switch (task.repeatInterval) {
			case "5sec": {
				notificationTrigger = {
					seconds: 60,
					repeats: true,
				};
				break;
			}
			case "day": {
				notificationTrigger = {
					hour: notifyDate.getHours(),
					minute: notifyDate.getMinutes(),
					repeats: true,
				};
				break;
			}
			case "week": {
				notificationTrigger = {
					hour: notifyDate.getHours(),
					minute: notifyDate.getMinutes(),
					weekday: notifyDate.getDay() + 1,
					repeats: true,
				};
				break;
			}
			// Guess who has no monthly trigger?
			case "year": {
				notificationTrigger = {
					hour: notifyDate.getHours(),
					minute: notifyDate.getMinutes(),
					day: notifyDate.getDate(),
					month: notifyDate.getMonth() + 1,
					repeats: true,
				};
				break;
			}
			default: {
				notificationTrigger = notifyDate;
				break;
			}
		}

		console.log(notificationTrigger);

		const result = await Notifications.scheduleNotificationAsync({
			content: {
				title: task.name,
				body: task.desc,
				color: "#74aaff",
				categoryIdentifier: "taskNotifActions",
				data: {
					taskName: task.name,
					startDate: notifyDate.toLocaleString()
				}
			},
			identifier: task.id,
			trigger: notificationTrigger,//notifyDate,
		});

		if (result) {
			console.log("Notification successfully created (", task.id, ")");
		
			createCalendarItem(task);
		}
	}
}

// Cancel a task's notification
export async function cancelTaskNotification(task) {
	console.log("Cancelling Notification for task", task.id);
	await Notifications.cancelScheduledNotificationAsync(task.id);
	console.log("Notification successfully cancelled.");

	removeCalendarItem(task);
}

//
// Calendar Helpers
//

// Create a Calendar Item
export async function createCalendarItem(task) {
	const notifyDate = new Date(task.notifyDate)
	const notificationType = (task.repeatInterval ? repeatIntervalToType(task.repeatInterval) : "date");
	const calTime = notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

	const calItem = {
		id: task.id,
		type: "task",
		title: task.name,
		body: task.desc,
		time: calTime,
		creationDate: task.creationDate.toLocaleString()
	}

	store.dispatch(calActions.addCalendarItem(calItem, notificationType, notifyDate.getFullYear(), notifyDate.getMonth(), notifyDate.getDate()));
	console.log("Notification added to calendar (", task.id, ")");

	saveCalendarData();
}

// Remove a Calendar Item
export async function removeCalendarItem(task) {
	const notifyDate = new Date(task.notifyDate);
	const repeatInterval = (task.repeatInterval ? repeatIntervalToType(task.repeatInterval) : "date");
	
	store.dispatch(calActions.deleteCalendarItem(task.id, repeatInterval, notifyDate.getFullYear(), notifyDate.getMonth(), notifyDate.getDate()));
	console.log("Calendar Item successfully removed.");
	
	saveCalendarData();
}

// [LOCAL] Saves modified Calendar Data
async function saveCalendarData() {
	try {
		const calString = JSON.stringify(store.getState().calendar);
		await AsyncStorage.setItem("@calendar", calString);
		console.log("Calendar Data successfully saved.");
	} catch (e) {
		console.log("There was an error saving calendar data:");
		console.log(e);
	}
}
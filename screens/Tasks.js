import React, { useEffect, useRef } from "react";
import { View, Text, Image, Alert, Switch, TextInput, Pressable, Vibration, StyleSheet, ScrollView, SectionList } from "react-native";

import { createStackNavigator } from "@react-navigation/stack";
import { useIsFocused } from "@react-navigation/native";

import "react-native-gesture-handler";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { globalStyles } from "./../components/GlobalStyles.js";
import TaskView from "./../components/TaskView.js";
import FAB from "./../components/FAB.js";
const LogoImage = require("../assets/images/logo_dark.png");

// Partial Completions Variable

const usePartialCompletions = false;
const clearOldFinished = true;

const TIME_THRESHOLD = 604800000; //7 days

// The data for each task on the list

/*
Task Properties:
name: Task Name
desc: Short Description

keep: Whether to keep the task after 1 day after completion

creationDate: When this task was created
completionDate: When this task was completed
notifyDate: Time when the user should be notified
*/

let taskData = [
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

/* 0: Unfinished
 * 1: Partially Finished
 * 2: Finished
 */

// Fetch Section Index from Name
function getSectionIndex(sectionName) {
	switch (sectionName) {
		case "unfinished":
			return 0;
		case "partial":
			return 1;
		case "finished":
			return 2;
	}
}

// Save Data
async function saveTaskData() {
	try {
		const taskDataString = JSON.stringify(taskData)
		await AsyncStorage.setItem("@taskData", taskDataString);
		console.log("Task Data successfully saved.");

		//console.log(taskData);
		//console.log(taskDataString);
	} catch (e) {
		console.log("There was an error saving task data:");
		console.log(e);
	}
}



// Footer item rendering for the list of tasks
function renderFooterItem({section}) {
	// If it's the last section, add a space underneath
	if (section.title == "finished")
		return <View style={styles.listFooterAlt} />
	// If not the last and if empty, add nothing
	if (section.data.length == 0)
		return null

	// If neither, add a small line
	return <View style={styles.listFooter} />
}

// Date string formatting
function formatDateString(dateString, dateMode) {
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

function clearOldFinishedTasks() {
	let removeIndices = [];
	for (let i = 0; i < taskData[2].data.length; i++) {
		const currentDate = new Date();
		const taskCompleteDate = new Date(taskData[2].data[i].completionDate);
		
		const difference = currentDate - taskCompleteDate;
		
		if (difference > TIME_THRESHOLD) {
			console.log("Queue", taskData[2].data[i].name, "for deletion.");
			removeIndices.push(i);
		}
	}

	for (let i = taskData[2].data.length; i >= 0; i--) {
		if (removeIndices.includes(i)) {
			console.log("Removing task with index", i);

			// Remove task, also cancel its notification just in case
			cancelTaskNotification(taskData[2].data[i]);
			taskData[2].data.splice(i, 1);
		}
	}

	saveTaskData();
}

// Notification Tasks
async function createTaskNotification(task) {
	const currentTime = new Date()
	const notifyDate = new Date(task.notifyDate)
	if (currentTime < notifyDate) {
		console.log("Creating Notification for this task");
		const notifID = task.name + ";" + task.creationDate;

		await Notifications.scheduleNotificationAsync({
			content: {
				title: task.name,
				body: task.desc,
				color: "#74aaff",
				categoryIdentifier: "taskNotifActions",
				data: {
					taskName: task.name
				}
			},
			identifier: notifID,
			trigger: { seconds: 2 },
		});
	}
}

async function cancelTaskNotification(task) {
	console.log("Cancelling Notification for task", task.name);
	const notifID = task.name + ";" + task.creationDate;
	await Notifications.cancelScheduledNotificationAsync(notifID);
}



let loadedTaskData = false;

function TasksMain({ navigation }) {

	const [localTaskData, setLocalTaskData] = React.useState(taskData);
	
	const [rearrangeOn, setRearrangeOn] = React.useState(false);

	// Effect to set local task data on screen focus
	const mainFocused = useIsFocused();
	useEffect(() => {
		if (mainFocused) {
			setLocalTaskData(JSON.parse(JSON.stringify(taskData)));
		}
	}, [mainFocused])

	// Effect to handle notifications
	useEffect(() => {
		const subscription = Notifications.addNotificationResponseReceivedListener(response => {
			if (response.actionIdentifier == "markCompleted") {
				// Get vars
				const notifID = response.notification.request.identifier
				const notifData = response.notification.request.content.data

				// Clear the notification
				Notifications.dismissNotificationAsync(notifID);

				console.log("Mark task", notifData.taskName, "completed.")

				// Fetch the correct item
				const taskIndexUnfinished = taskData[0].data.findIndex( s => (s.name + ";" + s.creationDate === notifID) );
				const taskIndexPartial = taskData[1].data.findIndex( s => (s.name + ";" + s.creationDate === notifID) );

				if (taskIndexUnfinished >= 0) {
					let transferItem = taskData[0].data[taskIndexUnfinished];
					transferItem.completionDate = new Date();
					taskData[0].data.splice(taskIndexUnfinished, 1);
					taskData[2].data.unshift(transferItem);

					setLocalTaskData(taskData);
					saveTaskData();

					console.log("Task Successfully Marked Completed.");
				}
				if (taskIndexPartial >= 1) {
					let transferItem = taskData[1].data[taskIndexUnfinished];
					transferItem.completionDate = new Date();
					taskData[1].data.splice(taskIndexUnfinished, 1);
					taskData[2].data.unshift(transferItem);

					setLocalTaskData(taskData);
					saveTaskData();

					console.log("Task Successfully Marked Completed.");
				}
			}
		});
		return () => subscription.remove();
	}, []);

	// Load task data from storage
	if (!loadedTaskData) {
		console.log("Loading Task Data");
		AsyncStorage.getItem("@taskData")
			.then((loadedData) => {
				if (loadedData) {
					taskData = JSON.parse(loadedData);
					clearOldFinishedTasks();
					setLocalTaskData(JSON.parse(JSON.stringify(taskData)));
					console.log("Task Data successfully loaded.");
				} else {
					console.log("No Task Data Exists.");
				}

				loadedTaskData = true;
			})
			.catch((err) => {
				console.log("There was an error loading task data:");
				console.log(e);
			})
	}

	return (
		<View style={globalStyles.screen}>
			<Image style={styles.logo} source={LogoImage} />
			
			<SectionList
				style={styles.listBox}
				showsVerticalScrollIndicator={false}

				sections={localTaskData}
				renderItem={({item, index, section}) => <TaskView 
					taskData={item}
					completionState={getSectionIndex(section.title)}
					usePartialCompletionIcons={usePartialCompletions}
					clearAction={() => {
						console.log("Prepare for Clearing");
						Alert.alert("Delete This Task?", "You will not be able to restore this task after deletion.", [
							{
								text: "Cancel",
							},
							{
								text: "OK",
								onPress: () => {
									cancelTaskNotification(item);
									taskData[getSectionIndex(section.title)].data.splice(index, 1);
									setLocalTaskData(JSON.parse(JSON.stringify(taskData)));
									saveTaskData();
									console.log("Item successfully deleted.");
								}
							}
						], {
							cancelable: true,
						});
					}}
					infoAction={() => {
						navigation.navigate("NewTask", {
							mode: "modify",
							task: item,
							taskSection: getSectionIndex(section.title)
						});
					}}
					checkAction={() => {
						let transferItem = item;
						
						// Move From Unfinished
						if (section.title === "unfinished" && usePartialCompletions) {
							taskData[getSectionIndex(section.title)].data.splice(index, 1);
							taskData[1].data.unshift(transferItem);

							console.log("Item Marked as Partially Completed");
						} else if (section.title === "unfinished" || section.title === "partial") {
							transferItem.completionDate = (new Date()).toString();

							taskData[getSectionIndex(section.title)].data.splice(index, 1);
							cancelTaskNotification(item);

							taskData[2].data.unshift(transferItem);
							console.log("Item Marked as Completed");
						} else {
							transferItem.completionDate = null;

							taskData[2].data.splice(index, 1);
							taskData[0].data.unshift(transferItem)

							createTaskNotification(item);
							console.log("Item Marked as Uncompleted");
						}

						setLocalTaskData(JSON.parse(JSON.stringify(taskData)));
						saveTaskData();
					}}
					longInfoAction={() => {
						Vibration.vibrate(10);
						setRearrangeOn(!rearrangeOn);
					}}
					rearrangeMode={rearrangeOn}
					upperRearrangeAction={() => {
						console.log("Moving", item.name, "Up");

						if (index > 0) {
							const transferItem = item;

							let firstPart = section.data.slice(0, index);
							let secondPart = section.data.slice(index + 1);

							secondPart.unshift(firstPart.pop());
							firstPart.push(transferItem);

							taskData[getSectionIndex(section.title)].data = firstPart.concat(secondPart);
							setLocalTaskData(JSON.parse(JSON.stringify(taskData)));
							saveTaskData();
						}

					}}
					lowerRearrangeAction={() => {
						console.log("Moving", item.name, "Down");

						if (index < section.data.length - 1) {
							const transferItem = item;
							
							let firstPart = section.data.slice(0, index);
							let secondPart = section.data.slice(index + 1);

							firstPart.push(secondPart.shift());
							secondPart.unshift(transferItem);

							taskData[getSectionIndex(section.title)].data = firstPart.concat(secondPart);
							setLocalTaskData(JSON.parse(JSON.stringify(taskData)));
							saveTaskData();
						}
					}}
				/>}
				renderSectionFooter={renderFooterItem}
			/>

			<FAB 
				icon={"plus"}
				onPress={() => {
					navigation.navigate("NewTask", {
						mode: "addNew",
					});
				}}
			/>
		</View>
	)
}

function NewTask({ route, navigation }) {
	// For auto-skipping to description
	const descRef = useRef();

	// Handle modes
	const mode = route.params.mode;
	let taskMod = {};
	if (route.params.hasOwnProperty("task")) {
		taskMod = route.params.task;
		taskModSectionIndex = route.params.taskSection;
	}

	// Task Name/Description Initialization
	const [taskName, onTaskName] = React.useState(mode === "addNew" ? "" : taskMod.name);
	const [taskDesc, onTaskDesc] = React.useState(mode === "addNew" ? "" : taskMod.desc);

	// Notification Date Default (Next Hour)
	let defaultDate = new Date()
	const [notifDate, setNotifDate] = React.useState(mode === "addNew" ? defaultDate : taskMod.notifyDate);
	if (notifDate === defaultDate) {
		notifDate.setHours(notifDate.getHours() + Math.ceil(notifDate.getMinutes() / 60));
		notifDate.setMinutes(0, 0, 0);
	}

	// Notification Toggle Initialization
	const [notifEnabled, setNotifEnabled] = React.useState(mode === "addNew" ? true : taskMod.notify);

	return (
		<View style={globalStyles.screen}>
			<ScrollView style={globalStyles.scrollScreen} contentContainerStyle={globalStyles.scrollScreenContent}>
				<Text style={globalStyles.h1}>
					{mode === "addNew" ? "Add a new task" : "Modify this task"}
				</Text>

				<TextInput 
					style={[styles.taskInput, styles.taskNameInput]}
					placeholderTextColor={"#7c7f8e"}
					selectionColor={"#74aaff"}

					autoFocus={true}
					onSubmitEditing={() => { descRef.current.focus(); }}
					onChangeText={onTaskName}
					value={taskName}
					placeholder={"Name"}
				/>

				<TextInput 
					ref={descRef}

					style={[styles.taskInput, styles.taskDescInput]}
					placeholderTextColor={"#7c7f8e"}
					selectionColor={"#74aaff"}

					onChangeText={onTaskDesc}
					value={taskDesc}
					placeholder={"Short Description"}
				/>

				<View style={[globalStyles.row, { width: "85%" }]}>
					<Text style={[globalStyles.h2, { flex: 1, paddingLeft: 15 }]}>Notify Me</Text>
					<Switch 
						style={{ 
							flex: 1, 
							alignItems: "flex-end",
							marginTop: 30,
						}}
						trackColor={{ false: "#16171a", true: "#74aaff" }}
						thumbColor={"#f2f6ff"}
						onValueChange={() => { 
							setNotifEnabled(previousState => !previousState )
						}}
						value={notifEnabled}
					/>
				</View>
				<View style={[globalStyles.row, { width: "85%", marginTop: 20 }]}>
					<Pressable
						style={{ flex: 1, padding: 15 }}
						onPress={() => {
							DateTimePickerAndroid.open({
								value: notifDate,
								accentColor: "#74aaff",
								onChange: (event, selectedDate) => {
									setNotifDate(selectedDate.toString());
								},
								mode: "date"
							});
						}}
					>
						<Text style={globalStyles.h3}>
							{formatDateString(notifDate, "date")}
						</Text>
					</Pressable>
					<Pressable
						style={{ flex: 1, alignItems: "flex-end", padding: 15 }}
						onPress={() => {
							DateTimePickerAndroid.open({
								value: notifDate,
								accentColor: "#74aaff",
								onChange: (event, selectedDate) => {
									setNotifDate(selectedDate.toString());
								},
								mode: "time"
							});
						}}
					>
						<Text style={globalStyles.h3}>
							{formatDateString(notifDate, "time")}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
			<FAB 
				icon={"check"}
				disabled={true}
				onPress={() => {
					const creationDate = (mode === "addNew" ? (new Date()).toString() : taskMod.creationDate);
					const completionDate = (mode === "addNew" ? null : taskMod.completionDate);

					// Only Create a task if it has a name
					if (taskName !== "") {
						const newTaskObj = {
							name: taskName,
							desc: taskDesc,
	
							notify: notifEnabled,
							notifyDate: notifDate.toString(),
							creationDate: creationDate,
							completionDate: completionDate,
						}

						if (mode === "addNew") {
							taskData[0].data.unshift(newTaskObj);
		
							if (notifEnabled) {
								createTaskNotification(newTaskObj);
							}

							saveTaskData();
							console.log("Added Task with Name", taskName, "on", creationDate.toLocaleString());
		
							navigation.navigate("TasksMain");
						} else if (mode === "modify") {
							// Get the index of the task in the data list it corresponds to
							const taskIndex = taskData[taskModSectionIndex].data.findIndex( s => (s.name + ";" + s.creationDate === taskMod.name + ";" + taskMod.creationDate));
							taskData[taskModSectionIndex].data[taskIndex] = newTaskObj;

							cancelTaskNotification(newTaskObj);
							if (notifEnabled) {
								createTaskNotification(newTaskObj);
							}

							saveTaskData();
							console.log("Modifications applied to task.");

							navigation.navigate("TasksMain");
						}
					}
				}}
			/>
		</View>
	)
}

const Stack = createStackNavigator();

export default function TasksScreen({ navigation }) {
	useEffect(() => {
		const focusListener = navigation.addListener("focus", () => {
			console.log("-------------- Focused");
			loadedTaskData = false;
		})
	}, [navigation]);
	
	notifDateInitTime = false;
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="TasksMain" component={TasksMain} />
			<Stack.Screen name="NewTask" component={NewTask} options={{ presentation: "modal" }} />
		</Stack.Navigator>
	)
}



const styles = StyleSheet.create({
	logo: {
		position: "absolute",
		width: 250,
		height: 62.5,
		left: 10,
		top: 10,
	},



	listBox: {
		width: "85%",
		marginTop: 65,
	},

	listFooter: {
		backgroundColor: "#7c7f8e",
		height: 2,

		marginTop: 15,
		borderRadius: 2,
	},

	listFooterAlt: {
		marginBottom: 30,
	},



	fab: {
		position: "absolute",
		
		flex: 1,
		alignItems: "center",
		justifyContent: "center",

		width: 65,
		height: 65,

		//right: 20,
		bottom: 15,
		borderRadius: (65 / 2),

		elevation: 3,
	},



	taskInput: {
		color: "#f2f6ff",

		width: "85%",
		marginTop: 10,
		padding: 20,

		borderBottomWidth: 2,
		borderBottomColor: "#31333a",
	},

	taskNameInput: {
		fontFamily: "Inter-Bold",
		fontSize: 18,
	},

	taskDescInput: {
		fontFamily: "Inter-Light",
		fontSize: 16,
	},

	text: {
		fontFamily: "Inter-Light",
		fontSize: 24,
		color: "#f2f6ff",
	}
})
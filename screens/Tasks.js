import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, Image, Alert, Switch, TextInput, Pressable, Vibration, StyleSheet, ScrollView, SectionList } from "react-native";

import { createStackNavigator } from "@react-navigation/stack";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import "react-native-gesture-handler";

import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useSelector } from "react-redux";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";

import store from "../components/redux/store";
import {
	resetTasks,
	setTaskData,
	addTask,
	removeTask,
	moveTask,
	modifyTask,
	changeTaskSection,
} from "../components/redux/TaskActions";
import { globalMenuStyles, globalStyles } from "./../components/GlobalStyles.js";
import TaskView from "./../components/TaskView.js";
import FAB from "./../components/FAB.js";

const LogoImage = require("../assets/images/logo_dark.png");
const NoTaskImage = require("../assets/images/nothingtodo.png");

// Settings

let settings = {}

// Tasks

/*
Task Properties:
name: Task Name
desc: Short Description

keep: Whether to keep the task after 1 day after completion

creationDate: When this task was created
completionDate: When this task was completed
repeatInterval: Time until this task gets notified again
notifyDate: Time when the user should be notified
*/

let tasks = []

/* Index Reference:
 * 0: Unfinished
 * 1: Partially Finished
 * 2: Finished
 */

// Check if no tasks are present
function emptyTasks() {
	const noUnfinished = tasks[0].data.length === 0;
	const noPartial = tasks[1].data.length === 0;
	const noFinished = tasks[2].data.length === 0;

	return noUnfinished && noPartial && noFinished;
}

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

// Get Interval title from shorthand interval
function getNotifIntervalTitle(shorthand) {
	switch (shorthand) {
		case "5sec": return "Every 5 Seconds";
		case "day": return "Every Day";
		case "week": return "Every Week";
		case "month": return "Every Month";
		case "year": return "Every Year";
		default: return "";
	}
}

// Save Data
async function saveTaskData() {
	try {
		const taskDataString = JSON.stringify(tasks)
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

// Search Filtering
function searchFilterCheck(itemName, filter) {
	// NOTE: This assumes filter is already uppercase
	if (settings.strictFiltering) {
		return itemName.toUpperCase().indexOf(filter) === 0;
	} else {
		return itemName.toUpperCase().indexOf(filter) > -1;
	}
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
	if (settings.clearOldFinished) {
		let removeIndices = [];
		for (let i = 0; i < tasks[2].data.length; i++) {
			const currentDate = new Date();
			const taskCompleteDate = new Date(tasks[2].data[i].completionDate);
			
			const difference = currentDate - taskCompleteDate;
			const timeThreshold = settings.oldTaskThreshold * 86400000;
			
			if (difference > timeThreshold) {
				console.log("Queue", tasks[2].data[i].name, "for deletion.");
				removeIndices.push(i);
			}
		}

		for (let i = tasks[2].data.length; i >= 0; i--) {
			if (removeIndices.includes(i)) {
				console.log("Removing task with index", i);
				
				// Remove task, also cancel its notification just in case
				store.dispatch(removeTask(tasks[2].data[i].id, 2));
				cancelTaskNotification(tasks[2].data[i]);
			}
		}

		saveTaskData();
	}
}

// Notification Tasks
async function createTaskNotification(task) {
	const currentTime = new Date()
	const notifyDate = new Date(task.notifyDate)
	if (currentTime < notifyDate) {
		console.log("Creating Notification for task", task.id);

		let notificationTrigger = null; //notifyDate,
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
				}
			},
			identifier: task.id,
			trigger: notificationTrigger,//notifyDate,
		});
		if (result) {
			console.log("Notification successfully created (", task.id, ")");
		}
	}
}

async function cancelTaskNotification(task) {
	console.log("Cancelling Notification for task", task.id);
	await Notifications.cancelScheduledNotificationAsync(task.id);
}



function TasksMain({ navigation }) {

	const [localTaskData, setLocalTaskData] = React.useState(tasks);	
	const [localTaskFilter, setLocalTaskFilter] = React.useState("");
	const [rearrangeOn, setRearrangeOn] = React.useState(false);

	function updateLocalTaskData() {
		setLocalTaskData(JSON.parse(JSON.stringify(tasks)));
	}

	tasks = useSelector((state) => {
		return state.tasks;
	});
	
	// Effect to handle notifications
	useEffect(() => {
		const subscription = Notifications.addNotificationResponseReceivedListener(response => {
			// Get Notification Data
			const notifID = response.notification.request.identifier
			const notifData = response.notification.request.content.data

			// Handle Completed Notifications
			if (response.actionIdentifier == "markCompleted") {
				// Get vars
				
				// Clear the notification
				Notifications.dismissNotificationAsync(notifID);

				console.log("Mark task", notifData.taskName, "completed.")

				// Fetch the correct item
				const taskIndexUnfinished = tasks[0].data.findIndex( s => (s.id === notifID) );
				const taskIndexPartial = tasks[1].data.findIndex( s => (s.id === notifID) );

				console.log(taskIndexPartial);

				if (taskIndexUnfinished >= 0) {
					const taskID = tasks[0].data[taskIndexUnfinished].id;
					
					const modItem = tasks[0].data[taskIndexUnfinished];
					modItem.notify = false;
					modItem.completionDate = new Date();

					//transferItem.completionDate = new Date();
					//taskData[0].data.splice(taskIndexUnfinished, 1);
					//taskData[2].data.unshift(transferItem);

					store.dispatch(changeTaskSection(taskID, 0, 2, new Date()));
					store.dispatch(modifyTask(taskID, 0, modItem));
					cancelTaskNotification(tasks[0].data[taskIndexUnfinished]);

					updateLocalTaskData();
					saveTaskData();

					console.log("Task Successfully Marked Completed.");
				}
				if (taskIndexPartial >= 0) {
					const taskID = tasks[1].data[taskIndexPartial].id;
					//transferItem.completionDate = new Date();
					//taskData[1].data.splice(taskIndexUnfinished, 1);
					//taskData[2].data.unshift(transferItem);

					const modItem = tasks[1].data[taskIndexPartial];
					modItem.notify = false;
					modItem.completionDate = new Date();

					store.dispatch(changeTaskSection(taskID, 1, 2, new Date()));
					store.dispatch(modifyTask(taskID, 1, modItem));
					cancelTaskNotification(tasks[1].data[taskIndexPartial]);

					updateLocalTaskData();
					saveTaskData();

					console.log("Task Successfully Marked Completed.");
				}
			}
		});
		return () => subscription.remove();
	}, []);

	// Listen for focus
	useEffect(() => {
		const focusListener = navigation.addListener("focus", () => {
			clearOldFinishedTasks();
			setLocalTaskData(JSON.parse(JSON.stringify(tasks)));
		});
		return focusListener;
	}, [navigation]);

	// Listen for settings
	useEffect(() => {
		const unsubscribeSettings = store.subscribe(() => {
			if (!store.getState().settings.usePartialCompletions && tasks[1].data.length > 0) {
				for (let i = tasks[1].data.length - 1; i >= 0; i--) {
					console.log("Moving Task", tasks[1].data[i].id, "for safety");
					store.dispatch(changeTaskSection(tasks[1].data[i].id, 1, 0, null));
				}
			}
		})
		//unsubscribeSettings();
	});

	//console.log(settings);

	return (
		<View style={globalStyles.screen}>
			<Image style={styles.logo} source={LogoImage} />
			
			<View style={styles.searchBar}>
				<View style={{ 
					flex: 1, 
					flexDirection: "row", 
					height: 30,
					alignItems: "center",
					justifyContent: "center",
				}}>
					<View style={styles.searchIcon}>
						<MaterialCommunityIcons 
							name={"magnify"} 
							size={25} 
							color={"#f2f6ff"} 
						/>
					</View>
					<TextInput
						style={styles.searchInput}
						placeholderTextColor={"#7c7f8e"}
						selectionColor={"#74aaff"}
						placeholder={"Search..."}

						onChangeText={(currentValue) => {
							setLocalTaskFilter(currentValue.toUpperCase());
						}}
						defaultValue={""}
					/>
				</View>
			</View>

			<SectionList
				style={styles.listBox}
				showsVerticalScrollIndicator={false}

				sections={localTaskData}
				renderItem={({item, index, section}) => (searchFilterCheck(item.name, localTaskFilter) ? <TaskView 
					taskData={item}
					completionState={getSectionIndex(section.title)}
					usePartialCompletionIcons={settings.usePartialCompletions}
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
									store.dispatch(removeTask(item.id, getSectionIndex(section.title)));
									updateLocalTaskData();

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
						//let transferItem = item;
						const itemSection = getSectionIndex(section.title);

						//store.dispatch(changeTaskSection(item.id, itemSection, //));
						
						// Move From Unfinished
						if (section.title === "unfinished" && settings.usePartialCompletions) {
							store.dispatch(changeTaskSection(item.id, itemSection, 1, null));
							//updateLocalTaskData();
							//taskData[getSectionIndex(section.title)].data.splice(index, 1);
							//taskData[1].data.unshift(transferItem);
							console.log(tasks);

							console.log("Item Marked as Partially Completed");
						} else if (section.title === "unfinished" || section.title === "partial") {
							//transferItem.completionDate = (new Date()).toString();

							//taskData[getSectionIndex(section.title)].data.splice(index, 1);
							store.dispatch(changeTaskSection(item.id, itemSection, 2, new Date()));
							//updateLocalTaskData();
							cancelTaskNotification(item);

							console.log(tasks);
							//taskData[2].data.unshift(transferItem);
							console.log("Item Marked as Completed");
						} else {
							//transferItem.completionDate = null;

							//taskData[2].data.splice(index, 1);
							//taskData[0].data.unshift(transferItem)
							store.dispatch(changeTaskSection(item.id, itemSection, 0, null));
							//updateLocalTaskData();
							if (item.notify) {
								createTaskNotification(item);
							}

							console.log(tasks);
							console.log("Item Marked as Uncompleted");
						}

						setLocalTaskData(JSON.parse(JSON.stringify(tasks)));
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
							store.dispatch(moveTask(item.id, getSectionIndex(section.title), true));
							
							updateLocalTaskData();
							saveTaskData();
						}

					}}
					lowerRearrangeAction={() => {
						console.log("Moving", item.name, "Down");

						if (index < section.data.length - 1) {
							store.dispatch(moveTask(item.id, getSectionIndex(section.title), false));
							
							updateLocalTaskData();
							saveTaskData();
						}
					}}
				/> : null)}
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

			{ emptyTasks() ? <Image style={styles.placeholderImage} source={NoTaskImage} /> : null }
			{ emptyTasks() ? <Text style={styles.placeholderLabel} >Nothing to do...</Text> : null }

			<Menu style={styles.menuButton}>
				<MenuTrigger>
					<MaterialCommunityIcons name={"menu"} size={30} color={"#f2f6ff"} />
				</MenuTrigger>
				<MenuOptions customStyles={globalMenuStyles}>
					<MenuOption 
						text="Clear All Queued Notifications"
						onSelect={() => {
							Alert.alert("Clear Notifications?", "Any notifications you have scheduled will be removed.", [
								{
									text: "Cancel",
								},
								{
									text: "OK",
									onPress: () => {
										console.log("Clearing...");

										for (let i = 0; i <= 2; i++) {
											for (let j = 0; j < tasks[i].data.length; j++) {
												if (tasks[i].data[j].notify) {
													const newTaskObj = {
														...tasks[i].data[j],
														notify: !tasks[i].data[j].notify
													}
													store.dispatch(modifyTask(tasks[i].data[j].id, i, newTaskObj));
												}
											}
										}

										Notifications.cancelAllScheduledNotificationsAsync();

										updateLocalTaskData();

										console.log("Cleared.");
									}
								}
							], {
								cancelable: true,
							});
						}}
					/>
					<MenuOption 
						text="Delete All Tasks"
						onSelect={() => {
							Alert.alert("Are you sure?", "This is a destructive action, IT WILL DELETE EVERYTHING!", [
								{
									text: "Cancel",
								},
								{
									text: "OK",
									onPress: () => {
										console.log("Clearing Tasks...");
										
										AsyncStorage.removeItem("@taskData");
										store.dispatch(resetTasks());
										Notifications.cancelAllScheduledNotificationsAsync();
										updateLocalTaskData();

										console.log("Cleared.");
									}
								}
							], {
								cancelable: true,
							});
						}}
					/>
					<MenuOption 
						text={"Log Scheduled"}
						onSelect={() => {
							Notifications.getAllScheduledNotificationsAsync()
								.then((response) => {
									for (let i = 0; i < response.length; i++) {
										console.log(response[i].identifier);
										console.log(response[i].trigger);
									}
								})
								.catch(() => console.log("Couldn't get them :("));
						}}
					/>
					{/*
					<MenuOption 
						text={"Local Filter: " + localTaskFilter}
					/>
					*/}
				</MenuOptions>
			</Menu>

			<View />
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
	const [notifDate, setNotifDate] = React.useState(mode === "addNew" ? defaultDate : new Date(taskMod.notifyDate));
	if (notifDate === defaultDate) {
		notifDate.setHours(notifDate.getHours() + Math.ceil(notifDate.getMinutes() / 60));
		notifDate.setMinutes(0, 0, 0);
	}

	// Notification Toggle Initialization
	const [notifEnabled, setNotifEnabled] = React.useState(mode === "addNew" ? true : taskMod.notify);
	const [notifInterval, setNotifInterval] = React.useState(mode === "addNew" ? null : taskMod.repeatInterval);

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
								value: new Date(notifDate),
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
								value: new Date(notifDate),
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

				<View style={[globalStyles.row, { width: "85%", marginTop: 20 }]}>
					<Menu style={{ flex: 3 }}>
						<MenuTrigger>
							<Text style={[globalStyles.h3, {flex: 1, padding: 15}]}>Select Repeat Interval...</Text>
						</MenuTrigger>
						<MenuOptions customStyles={globalMenuStyles}>
							<MenuOption 
								text={"Never"}
								onSelect={() => {setNotifInterval(null)}}
							/>
							<MenuOption 
								text={"Every Day"}
								onSelect={() => {setNotifInterval("day")}}
							/>
							<MenuOption 
								text={"Every Week"}
								onSelect={() => {setNotifInterval("week")}}
							/>
							<MenuOption 
								text={"Every Year"}
								onSelect={() => {setNotifInterval("year")}}
							/>
						</MenuOptions>
					</Menu>
					<Text style={[globalStyles.h3, {flex: 1, alignItems: "flex-end"}]}>
						{getNotifIntervalTitle(notifInterval)}
					</Text>
				</View>
				
			</ScrollView>
			<FAB 
				icon={"check"}
				onPress={() => {
					const creationDate = (mode === "addNew" ? (new Date()).toString() : taskMod.creationDate);
					const completionDate = (mode === "addNew" ? null : taskMod.completionDate);
					const taskID = "@" + taskName + ";" + creationDate;

					// Only Create a task if it has a name
					if (taskName !== "") {
						const newTaskObj = {
							id: taskID,
							name: taskName,
							desc: taskDesc,
	
							notify: notifEnabled,
							notifyDate: notifDate.toString(),
							repeatInterval: notifInterval,
							creationDate: creationDate,
							completionDate: completionDate,
						}

						if (mode === "addNew") {
							store.dispatch(addTask(newTaskObj));

							if (notifEnabled) {
								createTaskNotification(newTaskObj);
							}
							
							saveTaskData();
							
							console.log("Added Task with Name", taskName);

							navigation.navigate("TasksMain");
						} else if (mode === "modify") {
							// Get the index of the task in the data list it corresponds to
							console.log("-------");
							store.dispatch(modifyTask(taskMod.id, taskModSectionIndex, newTaskObj));

							//cancelTaskNotification(taskMod);
							Notifications.cancelScheduledNotificationAsync(taskMod.id)
								.then(() => {
									console.log("Schedule New?:", notifEnabled);
									if (notifEnabled) {
										createTaskNotification(newTaskObj);
									}
								})
								.catch((err) => {
									console.log("There was an error cancelling the notification:");
									console.log(err);
								});

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
	settings = useSelector(state => state.settings)
	
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



	searchBar: {
		width: "85%",
		marginTop: 60,

		backgroundColor: "#16171a",
		borderRadius: 18,
		//elevation: 0,

		padding: 10,
		height: 50,
	},

	searchIcon: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},

	searchInput: {
		flex: 8,
		color: "#f2f6ff",
		textAlign: "left",
		fontFamily: "Inter-Medium",
		fontSize: 18,
	},

	listBox: {
		width: "85%",
		marginTop: 15,
	},

	listFooter: {
		backgroundColor: "#7c7f8e",
		height: 2,

		marginBottom: 15,
		borderRadius: 2,
	},

	listFooterAlt: {
		marginBottom: 30,
	},



	menuButton: {
		position: "absolute",
		
		flex: 1,
		alignItems: "center",
		justifyContent: "center",

		width: 50,
		height: 50,

		right: 20,
		top: 15,
		//borderRadius: (65 / 2),
	},

	placeholderImage: {
		position: "absolute",
		
		flex: 1,
		alignItems: "center",
		justifyContent: "center",

		width: 300,
		height: 150,

		top: 250,
	},

	placeholderLabel: {
		position: "absolute",
		
		flex: 1,
		alignItems: "center",
		justifyContent: "center",

		textAlign: "center",

		width: 400,
		height: 50,

		top: 380,

		color: "#7c7f8e",
		fontFamily: "Inter-Medium",
		fontSize: 16,
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
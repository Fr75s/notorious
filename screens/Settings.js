import { useState, useEffect } from "react";
import { View, Text, Alert, TextInput, Switch, StyleSheet, ScrollView, Pressable } from "react-native";
import { nativeApplicationVersion } from "expo-application";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import DocumentPicker from "react-native-document-picker";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";

import { useSelector } from "react-redux";
import store from "../components/redux/store"
import { changeSetting, resetSettings, setSettings } from "../components/redux/SettingActions";
import { setTaskData } from "../components/redux/TaskActions";
import { setNotes } from "../components/redux/NoteActions";
import { setCalendar } from "../components/redux/CalendarActions";

import { globalStyles } from "./../components/GlobalStyles.js";
import FAB from "./../components/FAB.js"


let settings = {};

async function SaveSettings(settingsObj) {
	store.dispatch(setSettings(settingsObj));
	
	const settingsString = JSON.stringify(settingsObj);
	try {
		AsyncStorage.setItem("@settings", settingsString);
		console.log("Successfully saved settings.");
	} catch (e) {
		console.log("There was an error saving settings:");
		console.log(e);
	}
}


// Components

// Switch
function SettingSwitch({ label, setting, customAction }) {
	return (
		<View style={[globalStyles.row, { width: "85%", marginTop: 10 }]}>
			<Text style={[globalStyles.h3, styles.settingLabel]}>
				{label}
			</Text>
			<Switch 
				style={styles.settingSwitch}
				trackColor={{ false: "#16171a", true: "#74aaff" }}
				thumbColor={"#f2f6ff"}
				onValueChange={() => {
					settings[setting] = !settings[setting];
					if (customAction) {
						customAction();
					}
					SaveSettings(settings);
				}}
				value={settings[setting]}
			/>
		</View>
	)
}

function SettingAction({ label, onPress, danger }) {
	return (
		<Pressable
			style={styles.settingButton}
			onPress={onPress}
		>
			<Text style={[globalStyles.h3, { color: danger ? "#f7597b" : "#bdc0c7" }]}>{label}</Text>
		</Pressable>
	)
}

// Screen
export default function SettingsScreen({ navigation }) {
	
	settings = useSelector(state => state.settings);

	const [localSettings, setLocalSettings] = useState(settings);

	// Effect to set local task data on screen focus
	const focused = useIsFocused();
	useEffect(() => {
		if (focused) {
			console.log("Settings screen focused");
			setLocalSettings(JSON.parse(JSON.stringify(settings)));
		}
	}, [focused])

	return (
		<View style={globalStyles.screen}>
			<ScrollView style={globalStyles.scrollScreen} contentContainerStyle={globalStyles.scrollScreenContent}>
				<Text style={[globalStyles.h1, {marginBottom: 15}]}>Settings</Text>
			
				<Text style={styles.settingHeader}>General</Text>

				<SettingSwitch 
					label={"Strict Search Filtering"}
					setting={"strictFiltering"}
				/>

				<SettingSwitch 
					label={"Disable Notification Prompt"}
					setting={"disableNotificationPermissionPrompt"}
				/>

				<Text style={styles.settingHeader}>Tasks</Text>

				<SettingSwitch 
					label={"Use Partial Task Completions"}
					setting={"usePartialCompletions"}
				/>

				<SettingSwitch 
					label={"Clear Old Finished Tasks"}
					setting={"clearOldFinished"}
				/>

				<View style={[globalStyles.row, { width: "85%", marginTop: 15 }]}>
					<Text style={[globalStyles.h3, styles.settingLabel]}>
						Old Task Clearing Threshold (days)
					</Text>
					<TextInput
						style={[styles.settingSwitch, styles.settingTextInput]}
						placeholderTextColor={"#7c7f8e"}
						selectionColor={"#74aaff"}

						onChangeText={(currentValue) => {
							if (currentValue !== "") {
								const numberValue = Number(currentValue)
								if (numberValue > 0) {
									settings.oldTaskThreshold = numberValue;
									setLocalSettings(JSON.parse(JSON.stringify(settings)));
									SaveSettings(settings);
								}
							}
						}}
						defaultValue={String(localSettings.oldTaskThreshold)}
						placeholder={"#"}
						keyboardType={"numeric"}
					/>
				</View>

				<Text style={styles.settingHeader}>Notes</Text>

				<SettingSwitch 
					label={"Notebook Drawer On Left Side"}
					setting={"notesDrawerOnLeft"}
				/>

				<Text style={styles.settingHeader}>Calendar</Text>
		
				<SettingSwitch 
					label={"Show Names on Calendars"}
					setting={"verboseCalendar"}
				/>

				<Text style={styles.settingHeader}>Actions</Text>

				<SettingAction 
					label={"Import Data"}
					onPress={() => {
						const selectAndRead = async () => {
							const path = await DocumentPicker.pickSingle();
							if (path && path.uri) {
								if (path.uri.slice(-4) === "json") {
									const fileStringContents = await FileSystem.readAsStringAsync(path.uri);
									console.log(fileStringContents);
									const fileContent = JSON.parse(fileStringContents);

									const fileContentKeys = Object.keys(fileContent);
								
									const validFile = fileContentKeys.includes("settings")
										&& fileContentKeys.includes("tasks")
										&& fileContentKeys.includes("notes")
										&& fileContentKeys.includes("calendar")
										&& fileContent["tasks"].length === 3;

									if (validFile) {
										Notifications.cancelAllScheduledNotificationsAsync();

										store.dispatch(setSettings(fileContent.settings));
										store.dispatch(setTaskData(fileContent.tasks));
										store.dispatch(setNotes(fileContent.notes));
										store.dispatch(setCalendar(fileContent.calendar));
									}
								}
							}
						}

						console.log("Importing Data...");
						selectAndRead();
					}}
				/>

				<SettingAction 
					label={"Export Data"}
					onPress={() => {
						const selectAndSave = async () => {
							const path = await DocumentPicker.pickDirectory();
							if (path && path.uri) {
								const newFileName = "notorious-" + new Date().toISOString();
								const newFileURI = await FileSystem.StorageAccessFramework.createFileAsync(path.uri, newFileName, "application/json");
								const storeContents = store.getState();
								await FileSystem.writeAsStringAsync(newFileURI, JSON.stringify(storeContents));
								
								console.log("File Written.");
							}
						}

						console.log("Exporting Data...");
						selectAndSave();
					}}
				/>

				<SettingAction 
					label={"Reset Settings"}
					danger={true}
					onPress={() => {
						Alert.alert("Are you sure?", "This will reset your settings to the default settings.", [
							{
								text: "Cancel",
							},
							{
								text: "OK",
								onPress: () => {
									store.dispatch(resetSettings());
									setLocalSettings(JSON.parse(JSON.stringify(settings)));
									SaveSettings(settings);
								}
							}
						], {
							cancelable: true,
						});
					}}
				/>

				<Text style={styles.settingHeader}>Developer</Text>
						
				<SettingSwitch 
					label={"Enable Developer Mode"}
					setting={"devMode"}
				/>



				<View 
					style={{ height: 40 }}
				/>
				
			</ScrollView>

			{/*
			<FAB
				icon={"close"}
				onPress={() => {
					console.log(settings);
					//AsyncStorage.removeItem("@settings");
				}}
			/>
			<FAB
				icon={"close"}
				onPress={() => {
					AsyncStorage.removeItem("@settings");
				}}
			/>
			*/}

			

			<Text style={styles.versionInfo}>
				Notorious v{nativeApplicationVersion}
			</Text>
		</View>
	)
}


const styles = StyleSheet.create({
	settingHeader: {
		...globalStyles.h2,
		marginBottom: 20
	},
	
	settingLabel: {
		flex: 4,
		alignItems: "flex-start",
		justifyContent: "center",
	},

	settingSwitch: { 
		flex: 1, 
		alignItems: "flex-end",
		justifyContent: "center",
	},

	settingButton: {
		flex: 1,
		alignItems: "center",
		backgroundColor: "#16171a",
		width: "85%",

		padding: 10,
		borderRadius: 10,
		marginBottom: 10,

		elevation: 2,
	},

	settingTextInput: {
		color: "#f2f6ff",
		textAlign: "right",
		fontFamily: "Inter-Medium",
		fontSize: 16,

		borderBottomWidth: 1,
		borderBottomColor: "#7c7f8e",
	},


	
	versionInfo: {
		...globalStyles.smallText,
		
		position: "absolute",
		right: 10,
		bottom: 10,
	}
})
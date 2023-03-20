import { useState, useEffect } from "react";
import { View, Text, Alert, TextInput, Switch, StyleSheet, ScrollView, Pressable } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

import { useSelector } from "react-redux";
import store from "../components/redux/store"
import { changeSetting, resetSettings, setSettings } from "../components/redux/SettingActions";

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
function SettingSwitch({ label, setting }) {
	return (
		<View style={[globalStyles.row, { width: "85%" }]}>
			<Text style={[globalStyles.h3, styles.settingLabel]}>
				{label}
			</Text>
			<Switch 
				style={styles.settingSwitch}
				trackColor={{ false: "#16171a", true: "#74aaff" }}
				thumbColor={"#f2f6ff"}
				onValueChange={() => {
					settings[setting] = !settings[setting];
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
			
				<Text style={[globalStyles.h2, {marginBottom: 20}]}>Tasks</Text>

				<SettingSwitch 
					label={"Use Partial Task Completions"}
					setting={"usePartialCompletions"}
				/>

				<SettingSwitch 
					label={"Clear Old Finished Tasks"}
					setting={"clearOldFinished"}
				/>

				<SettingSwitch 
					label={"Strict Search Filtering"}
					setting={"strictFiltering"}
				/>

				<View style={[globalStyles.row, { width: "85%", marginTop: 15 }]}>
					<Text style={[globalStyles.h3, styles.settingLabel]}>
						Old Task Age Clearing Threshold (days)
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

				<Text style={[globalStyles.h2, {marginBottom: 20}]}>Actions</Text>

				<SettingAction 
					label={"Export Data"}
					onPress={() => {
						console.log("ACTION GOES HERE");
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
				Notorious v0.1.1
			</Text>
		</View>
	)
}


const styles = StyleSheet.create({
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
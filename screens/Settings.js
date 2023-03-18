import { useState, useEffect } from "react";
import { View, Text, TextInput, Switch, StyleSheet, ScrollView, Pressable } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

import { useSelector } from "react-redux";
import store from "../components/redux/store"
import { setSettings } from "../components/redux/SettingActions";

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

				<View style={[globalStyles.row, { width: "85%" }]}>
					<Text style={[globalStyles.h3, styles.settingLabel]}>
						Use Partial Task Completions
					</Text>
					<Switch 
						style={styles.settingSwitch}
						trackColor={{ false: "#16171a", true: "#74aaff" }}
						thumbColor={"#f2f6ff"}
						onValueChange={() => {
							settings.usePartialCompletions = !settings.usePartialCompletions;
							setLocalSettings(JSON.parse(JSON.stringify(settings)));
							SaveSettings(settings);
						}}
						value={localSettings.usePartialCompletions}
					/>
				</View>

				<View style={[globalStyles.row, { width: "85%" }]}>
					<Text style={[globalStyles.h3, styles.settingLabel]}>
						Clear Old Finished Tasks
					</Text>
					<Switch 
						style={styles.settingSwitch}
						trackColor={{ false: "#16171a", true: "#74aaff" }}
						thumbColor={"#f2f6ff"}
						onValueChange={() => {
							settings.clearOldFinished = !settings.clearOldFinished;
							setLocalSettings(JSON.parse(JSON.stringify(settings)));
							SaveSettings(settings);
						}}
						value={localSettings.clearOldFinished}
					/>
				</View>

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

				<Pressable
					style={styles.settingButton}
					onPress={() => {
						console.log("Test");
					}}
				>
					<Text style={globalStyles.h3}>Setting Action</Text>
				</Pressable>
				
			</ScrollView>

			{/*
			<FAB
				icon={"close"}
				onPress={() => {
					console.log(settings);
					//AsyncStorage.removeItem("@settings");
				}}
			/>
			
			*/}

			<FAB
				icon={"close"}
				onPress={() => {
					AsyncStorage.removeItem("@settings");
				}}
			/>

			<Text style={styles.versionInfo}>
				Notorious v0.1.0
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
		position: "absolute",
		fontFamily: "Inter-Medium",
		fontSize: 12,
		color: "#7c7f8e",

		right: 10,
		bottom: 10,
	}
})
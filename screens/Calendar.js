import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

import * as Notifications from "expo-notifications";
import { useSelector } from "react-redux";
import store from "../components/redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import Agenda from "../components/Agenda";

import { globalStyles, globalMenuStyles } from "./../components/GlobalStyles.js";



let selectedDate = new Date();
selectedDate.setHours(0, 0, 0, 0);

function dateToISO(rawDate) {
	const year = rawDate.getFullYear();
	const month = (rawDate.getMonth() <= 9 ? "0" + (rawDate.getMonth() + 1) : (rawDate.getMonth() + 1).toString());
	const day = (rawDate.getDate() <= 9 ? "0" + rawDate.getDate() : rawDate.getDate().toString());

	return year + "-" + month + "-" + day;
}

function getCalendarData(year, month) {
	//console.log("Nerd", new Date(year, month + 1, 0).getDate());
	let calData = new Array(new Date(year, month + 1, 0).getDate());

	return new Promise((resolve, reject) => {
		// Go through notifications
		Notifications.getAllScheduledNotificationsAsync()
			.then((result) => {
				for (let i = 0; i < result.length; i++) {
					// Get trigger and content
					const content = result[i].content;
					const trigger = result[i].trigger;

					// Check for repeating trigger
					if (trigger.type === "date") {
						const triggerDate = new Date(trigger.value);
						if (triggerDate.getMonth() === month && triggerDate.getFullYear() === year) {
							const idx = triggerDate.getDate() - 1;

							const itemBody = {
								title: content.title,
								body: content.body,
								repeat: false,
								time: triggerDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
							}

							if (calData[idx]) {
								calData[idx].items = [
									...calData[idx].items,
									itemBody
								]
							} else {
								calData[idx] = {
									items: [
										itemBody
									]
								}
							}
						}
					} else {
						//console.log("Repeating Trigger", trigger);
						const triggerDate = new Date();
						triggerDate.setHours(trigger.hour, trigger.minute);

						const itemBody = {
							title: content.title,
							body: content.body,
							repeat: true,
							time: triggerDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
						}

						let valid = false;
						switch(trigger.type) {
							case "daily": {
								for (let i = 0; i < calData.length; i++) {
									if (calData[i]) {
										calData[i].items = [
											...calData[i].items,
											itemBody
										]
									} else {
										calData[i] = {
											items: [
												itemBody
											]
										}
									}
								}
							}
							case "weekly": {
								let startDate = new Date(year, month, 1);
								for (let i = 1; i <= 7; i++) {
									const weekdayCheckDate = new Date(year, month, i);
									//console.log(weekdayCheckDate.getDay(), trigger.weekday - 1);
									if (weekdayCheckDate.getDay() === trigger.weekday - 1) {
										//console.log(weekdayCheckDate.toLocaleDateString());
										startDate = weekdayCheckDate;
										break;
									}
								}

								const endDate = new Date(year, month + 1, 1);

								//console.log(startDate.toLocaleDateString(), endDate.toLocaleDateString());

								for (let d = startDate; d < endDate; d.setDate(d.getDate() + 7)) {
									//console.log(d.toLocaleDateString());
									if (calData[d.getDate() - 1]) {
										calData[d.getDate() - 1].items = [
											...calData[d.getDate() - 1].items,
											itemBody
										]
									} else {
										calData[d.getDate() - 1] = {
											items: [
												itemBody
											]
										}
									}
								}
							}
							// For monthly, just use the day.
							case "yearly": {
								if (trigger.month - 1 === month) {
									if (calData[trigger.day - 1]) {
										calData[trigger.day - 1].items = [
											...calData[trigger.day - 1].items,
											itemBody
										]
									} else {
										calData[trigger.day - 1] = {
											items: [
												itemBody
											]
										}
									}
								}
							}
						}
						//console.log("Skipped for now");
					}
				}
				
				resolve(calData);
			})
			.catch((err) => {
				reject(err);
			})
	})

	
}

export default function CalendarScreen({ navigation }) {
	const [thisDate, setThisDate] = useState({
		year: new Date().getFullYear(), 
		month: new Date().getMonth()
	});
	
	const [itemList, setItemList] = useState([]);
	const [loadedItems, setLoadedItems] = useState([]);

	const [selectedDate, setSelectedDate] = useState(new Date());

	settings = useSelector(state => state.settings);

	// Get Stuff
	useEffect(() => {
		//console.log("naw");
		//console.log("Called");
		const focusListener = navigation.addListener("focus", () => {
			getCalendarData(thisDate.year, thisDate.month)
				.then((res) => {
					console.log(res);
					setItemList(res);
				});
		});
		return focusListener;
	}, []);

	return (
		<GestureHandlerRootView style={globalStyles.screen}>
			<View style={[globalStyles.row, { flex: 0, width: "85%" }]}>
				<Text style={[globalStyles.h2, { flex: 6, marginTop: 0}]}>Calendar</Text>
				<Menu style={{ flex: 1, alignItems: "flex-end" }}>
					<MenuTrigger>
						<MaterialCommunityIcons name={"menu"} size={30} color={"#f2f6ff"} />
					</MenuTrigger>
					<MenuOptions customStyles={globalMenuStyles}>
						<MenuOption 
							text={"Return To Today"}
							onSelect={() => {
								const todayDate = new Date();
								todayDate.setHours(0, 0, 0, 0);

								setThisDate({
									year: todayDate.getFullYear(),
									month: todayDate.getMonth()
								})
								getCalendarData(todayDate.getFullYear(), todayDate.getMonth())
									.then((res) => {
										setItemList(res);
									});
			
								setSelectedDate(todayDate);
							}}
						/>
					</MenuOptions>
				</Menu>
			</View>

			<Agenda 
				dateData={thisDate}
				
				itemsThisMonth={itemList}
				onNextMonth={() => {
					const newDate = new Date(thisDate.year, thisDate.month);
					newDate.setMonth(newDate.getMonth() + 1);

					setThisDate({
						year: newDate.getFullYear(),
						month: newDate.getMonth()
					})
					getCalendarData(newDate.getFullYear(), newDate.getMonth())
						.then((res) => {
							setItemList(res);
						});
				}}
				onPrevMonth={() => {
					const newDate = new Date(thisDate.year, thisDate.month);
					newDate.setMonth(newDate.getMonth() - 1);

					setThisDate({
						year: newDate.getFullYear(),
						month: newDate.getMonth()
					})
					getCalendarData(newDate.getFullYear(), newDate.getMonth())
						.then((res) => {
							setItemList(res);
						});
				}}

				selectedDate={selectedDate}
				onSelectDate={(day) => {
					const newSelectedDate = new Date(thisDate.year, thisDate.month, day);
					newSelectedDate.setHours(0, 0, 0, 0);

					setSelectedDate(newSelectedDate);
				}}
				onChangeMonthYear={(newDate) => {
					console.log(newDate);
					setThisDate({
						year: newDate.getFullYear(),
						month: newDate.getMonth()
					})
					getCalendarData(newDate.getFullYear(), newDate.getMonth())
						.then((res) => {
							setItemList(res);
						});
					
					const newSelectedDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
					newSelectedDate.setHours(0, 0, 0, 0);

					setSelectedDate(newSelectedDate);
				}}
			/>
		</GestureHandlerRootView>
	)
}

const styles = StyleSheet.create({
	agenda: {
		width: "100%"
	},

	item: {
		backgroundColor: "#16171a",
		borderRadius: 10,

		flex: 1,
		padding: 10,
		margin: 5
	},

	text: {
		fontFamily: "Inter-Bold",
		color: "#f2f6ff",
	}
})
import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { FlatList, Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { getItemsFromCalendarDate, getTaskFromID } from './helpers';
import { globalStyles } from "./GlobalStyles";
import store from "./redux/store";

const monthIcons = {
	0: "snowflake",
	1: "snowflake",
	2: "flower",
	3: "flower",
	4: "flower",
	5: "weather-sunny",
	6: "weather-sunny",
	7: "weather-sunny",
	8: "leaf-maple",
	9: "leaf-maple",
	10: "leaf-maple",
	11: "snowflake"
}



function dateToISO(rawDate) {
	const year = rawDate.getFullYear();
	const month = (rawDate.getMonth() <= 9 ? "0" + (rawDate.getMonth() + 1) : (rawDate.getMonth() + 1).toString());
	const day = (rawDate.getDate() <= 9 ? "0" + rawDate.getDate() : rawDate.getDate().toString());

	return year + "-" + month + "-" + day;
}

function isToday(year, month, day) {
	const rightNow = new Date();
	return rightNow.getFullYear() === year && rightNow.getMonth() === month && rightNow.getDate() === day;
}



function weekdayHeader(index) {
	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	return (
		<View style={styles.calMonthItem}>
			<Text style={[globalStyles.h3, { textAlign: "center" }]}>
				{weekdays[index]}
			</Text>
		</View>
	)
}

function MonthDay({dateData, data, onDayPress}) {
	return (
		<Pressable 
			style={[styles.calMonthItem, {
				backgroundColor: (data.selected ? "#f2f6ff" : null),
				borderRadius: 10,
			}]}
			onPress={() => {
				if (data.day) {
					onDayPress(data.day, data.items);
				}
			}}
		>
			<Text style={[globalStyles.h3, { 
				textAlign: "center",
				color: isToday(dateData.year, dateData.month, data.day) ? "#74aaff" : (data.selected ? "#16171a" : "#bdc0c7")
			}]}>
				{data.day}
			</Text>
			{ !store.getState().settings["verboseCalendar"] ? <View style={styles.calMonthItemDotRow}>
				{ data.items && data.items.length > 0 ? <View style={[styles.calMonthItemDot, {
					backgroundColor: "#74aaff",
				}]}/> : null}
				{ data.items && data.items.length > 1 ? <View style={[styles.calMonthItemDot, {
					backgroundColor: "#74aaff"
				}]}/> : null}
				{ data.items && data.items.length > 2 ? <View style={[styles.calMonthItemDot, {
					backgroundColor: "#74aaff"
				}]}/> : null}
			</View> : <View style={styles.calMonthItemLabelRow}>
				{ data.items && data.items.length > 0 ? 
					<Text style={styles.calMonthItemLabel} numberOfLines={1} >
						{data.items[0].title}
					</Text>
				: null}
				{ data.items && data.items.length > 1 ? 
					<Text style={styles.calMonthItemLabel} numberOfLines={1} >
						{data.items[1].title}
					</Text>
				: null}
			</View>}
		</Pressable>
	)
}

function DaysInMonth({
	dateData, 
	monthData, 
	selectedDate, 
	onDayPress,
}) {
	let dates = [[]];
	const startDate = new Date(dateData.year, dateData.month, 1);
	const endDate = new Date(dateData.year, dateData.month + 1, 1);

	for (let d = 0; d < startDate.getDay(); d++) {
		dates[0][d] = {};
	}

	let row = 0;

	for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
		//console.log(dateData.year + "-" + dateData.month + "-" + d.getDate() + ";;;" + dateToISO(selectedDate));
		//console.log("MD", d.toLocaleDateString(), i, monthData);
		let itemsToday = getItemsFromCalendarDate(d, monthData);
		//console.log(itemsToday);

		//console.log(itemsToday);
		
		dates[row][d.getDay()] = {
			items: itemsToday,
			day: d.getDate(),
			selected: (dateToISO(new Date(dateData.year, dateData.month, d.getDate())) === dateToISO(selectedDate))
		};
		
		if (d.getDay() === 6) {
			row += 1;
			dates[row] = [];
		}
	}

	console.log("-----");

	for (let d = endDate.getDay(); d <= 6; d++) {
		dates[row][d] = {};
	}

	//console.log(dates);

	return (
		<FlatList
			data={dates}
			renderItem={({item}) => (
				<View style={styles.calMonthRow}>
					<MonthDay dateData={dateData} data={item[0]} onDayPress={(day, items) => { onDayPress(day, items); }}/>
					<MonthDay dateData={dateData} data={item[1]} onDayPress={(day, items) => { onDayPress(day, items); }}/>
					<MonthDay dateData={dateData} data={item[2]} onDayPress={(day, items) => { onDayPress(day, items); }}/>
					<MonthDay dateData={dateData} data={item[3]} onDayPress={(day, items) => { onDayPress(day, items); }}/>
					<MonthDay dateData={dateData} data={item[4]} onDayPress={(day, items) => { onDayPress(day, items); }}/>
					<MonthDay dateData={dateData} data={item[5]} onDayPress={(day, items) => { onDayPress(day, items); }}/>
					<MonthDay dateData={dateData} data={item[6]} onDayPress={(day, items) => { onDayPress(day, items); }}/>
				</View>
			)}
		/>
	)
}

export default function Agenda({
	navigation,

	dateData,
	itemsThisMonth,
	refresh,
	onNextMonth,
	onPrevMonth,
	selectedDate,
	selectedDateData,
	onSelectDate,
	onChangeMonthYear
}) {
	//console.log("RE");

	// OPTIMIZATION: Only refresh calendar elements when dateData changes or itemsThisMonth changes

	return (
		<View style={styles.calView}>
			<View style={[styles.calMonthHeader, { alignItems: "center" }]}>
				<Pressable
					onPress={onPrevMonth}
				>
					<MaterialCommunityIcons 
						name={"chevron-left"} 
						size={20} 
						color={"#f2f6ff"}
						style={{ padding: 8 }}
					/>
				</Pressable>
				<Pressable 
					style={[styles.calMonthHeader, { flex: 1 }]}
					onPress={() => {
						DateTimePickerAndroid.open({
							value: new Date(dateData.year, dateData.month),
							accentColor: "#74aaff",
							onChange: (event, selected) => {
								if (event.type === "set")
									onChangeMonthYear(selected);
							},
							mode: "date"
						});
					}}
				>
					<Text style={[globalStyles.h2, { marginTop: 10, marginBottom: 10 }]}>
						{Intl.DateTimeFormat([], { year: "numeric", month: "long" }).format(new Date(dateData.year, dateData.month))}
					</Text>
					<MaterialCommunityIcons 
						name={monthIcons[dateData.month]} 
						size={16} 
						color={"#f2f6ff"}
					/>
				</Pressable>
				<Pressable
					onPress={onNextMonth}
				>
					<MaterialCommunityIcons 
						name={"chevron-right"} 
						size={20} 
						color={"#f2f6ff"}
						style={{ padding: 8 }}
					/>
				</Pressable>
			</View>

			<View style={styles.calMonth}>
				<View style={styles.calMonthRow}>
					{weekdayHeader(0)}
					{weekdayHeader(1)}
					{weekdayHeader(2)}
					{weekdayHeader(3)}
					{weekdayHeader(4)}
					{weekdayHeader(5)}
					{weekdayHeader(6)}
				</View>

				<DaysInMonth 
					dateData={dateData}
					monthData={itemsThisMonth}
					selectedDate={selectedDate}
					onDayPress={(day, items) => {
						onSelectDate(day);
					}}
				/>
			</View>

			<Text style={[globalStyles.h3, {marginTop: 0, width: "100%"}]}>
				{new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toLocaleDateString()}
			</Text>

			<FlatList
				data={selectedDateData}
				style={{ width: "100%" }}
				renderItem={({item}) => (
					<Pressable 
						style={styles.agendaItem}
						onPress={() => {
							if (item.type === "task") {
								const tasks = store.getState().tasks;
								const taskID = "@" + item.title + ";" + item.creationDate;

								const taskIdx = getTaskFromID(tasks, taskID);
								const taskData = tasks[taskIdx[0]].data[taskIdx[1]];

								console.log(taskID, taskData);

								navigation.navigate("NewTask", {
									mode: "modify",
									task: taskData,
									taskSection: taskIdx[0],
									returnTo: "calendar"
								});
							}
						}}
					>
						<View style={{ flex: 3 }}>
							<Text style={globalStyles.h1} numberOfLines={1}>
								{item.title}
							</Text>
							<Text style={globalStyles.h3} numberOfLines={1}>
								{item.body}
							</Text>
						</View>
						<View style={{ flex: 1, alignItems: "flex-end" }}>
							<MaterialCommunityIcons
								name={item.repeat ? "alarm" : "bell"} 
								size={16}
								color={"#7c7f8e"}
							/>
							<Text style={globalStyles.smallText}>
								{item.time}
							</Text>
						</View>
					</Pressable>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	calView: {
		...globalStyles.screen,
		width: "85%",
	},



	calMonthHeader: {
		flexDirection: "row",

		alignItems: "baseline",
		justifyContent: "center",

		gap: 10
	},

	calMonth: {
		width: "100%",
		margin: 10,
		//borderWidth: 2,

		backgroundColor: "#16171a",
		borderRadius: 10,
		elevation: 3
	},

	calMonthRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},

	calMonthItem: {
		flex: 1,

		alignContent: "center",
		justifyContent: "center",

		height: 60,

		//borderWidth: 2,
	},



	calMonthItemDotRow: {
		position: "absolute",
		bottom: 10,

		width: "100%",
		gap: 5,

		flexDirection: "row",
		alignContent: "center",
		justifyContent: "center",
	},

	calMonthItemLabelRow: {
		position: "absolute",
		bottom: 2,
		gap: -2,

		width: "100%",

		alignContent: "center",
		justifyContent: "center",
	},

	calMonthItemDot: {
		width: 5,
		height: 5,
		
		borderRadius: 5,
	},

	calMonthItemLabel: {
		...globalStyles.smallText,
		width: "100%",
		
		fontSize: 8,
		textAlign: "center",

		color: "#74aaff"
	},



	agendaItem: {
		//flex: 1,
		flexDirection: "row",
		//alignItems: "center",

		maxHeight: 100,
		overflow: "hidden",
		backgroundColor: "#16171a",
		borderRadius: 18,

		marginTop: 10,
		padding: 15,

		elevation: 1,
	},
})
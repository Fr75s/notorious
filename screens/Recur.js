import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { WidgetPreview } from 'react-native-android-widget';
import * as Linking from "expo-linking";

import { useSelector } from "react-redux";
import store from "../components/redux/store";
import * as calActions from "../components/redux/CalendarActions";

import CalendarWidget from "../components/widgets/CalendarWidget";
import { globalStyles } from "./../components/GlobalStyles.js";
import FAB from "../components/FAB";

export default function RecurScreen() {
	const [height, setHeight] = useState(400);

	calendar = useSelector(state => state.calendar);
	
	return (
		<View style={globalStyles.screen}>
			<Text style={globalStyles.h1}>Widget Preview</Text>
			<View style={{ flexDirection: "row", gap: 10 }}>
				<Pressable
					onPress={() => { setHeight(320) }}
				>
					<Text style={globalStyles.h2}>Alpha</Text>
				</Pressable>
				<Pressable
					onPress={() => { setHeight(400) }}
				>
					<Text style={globalStyles.h2}>Beta</Text>
				</Pressable>
			</View>

			<View style={{ flexDirection: "row", gap: 15, marginTop: 30 }}>
				<Pressable
					onPress={() => { console.log(calendar[2023] ? calendar[2023][4] : "um") }}
				>
					<Text style={globalStyles.h3}>LOG</Text>
				</Pressable>
				<Pressable
					onPress={() => {
						const calItem = {
							id: "baueba-2iaubfu",
							name: "hi"
						}
						store.dispatch(calActions.addCalendarItem(calItem, 2023, 4, 5)); 
					}}
				>
					<Text style={globalStyles.h3}>ADD</Text>
				</Pressable>
				<Pressable
					onPress={() => {
						const id = "baueba-2iaubfu"
						store.dispatch(calActions.deleteCalendarItem(id, 2023, 4, 5)); 
					}}
				>
					<Text style={globalStyles.h3}>DELETE</Text>
				</Pressable>
				<Pressable
					onPress={() => { store.dispatch(calActions.resetCalendar()); }}
				>
					<Text style={globalStyles.h3}>RESET</Text>
				</Pressable>
			</View>

			<View style={[globalStyles.screen, { justifyContent: "center" }]}>
				<WidgetPreview
					renderWidget={() => <CalendarWidget />}
					width={320}
					height={height}
				/>
			</View>

			<FAB
				icon={"link"}
				onPress={() => {
					Linking.openURL("com.fr75s.notorious://Calendar?year=2024&month=3&day=20");
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	text: {
		fontFamily: "Inter-Bold",
		color: "#f2f6ff",
	}
})
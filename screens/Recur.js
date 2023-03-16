import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import * as Notifications from "expo-notifications";

import { globalStyles } from "./../components/GlobalStyles.js";
import FAB from "./../components/FAB.js";

export default function RecurScreen() {
	return (
		<View style={globalStyles.screen}>
			<Text style={styles.text}>Reocurring Tasks Screen</Text>
			<Pressable 
				onPress={() => {
					Notifications.cancelScheduledNotificationAsync("test-nofif");
				}}
			>
				<Text style={globalStyles.h1}>hihihihi</Text>
			</Pressable>
			<FAB 
				icon={"bell"}
				onPress={() => {
					Notifications.scheduleNotificationAsync({
						content: {
							title: "Hey!",
							body: "I want DIE!",
							color: "#74aaff",
							categoryIdentifier: "taskNotifActions",
							data: {
								taskName: "My Task"
							}
						},
						identifier: "test-nofif",
						trigger: null,
					});
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
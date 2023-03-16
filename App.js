import { useCallback, useState, useEffect, useRef } from "react";
import { Platform, StyleSheet } from "react-native";

import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import Constants from "expo-constants";

import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { globalStyles } from "./components/GlobalStyles.js";
import TasksScreen from "./screens/Tasks.js";
import RecurScreen from "./screens/Recur.js";
import NotesScreen from "./screens/Notes.js";
import CalendarScreen from "./screens/Calendar.js";

Notifications.setNotificationHandler({
	handleNotification: async() => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	})
})

Notifications.setNotificationCategoryAsync(
	"taskNotifActions",
	[
		{
			buttonTitle: "Mark Completed",
			identifier: "markCompleted",
			options: {
				isDestructive: true,
				opensAppToForeground: false,
			}
		}
	]
)

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Tab State
export default function App() {
	const [expoPushToken, setExpoPushToken] = useState("");
	const [notification, setNotification] = useState(false);

	const notificationListener = useRef();
	const responseListener = useRef();
	
	const [appIsReady, setAppIsReady] = useState(false);

	useEffect(() => {
		async function loadResourcesAsync() {
			try {
				SplashScreen.preventAutoHideAsync();

				NavigationBar.setBackgroundColorAsync("#16171a");

				const fontAssets = Font.loadAsync({
					"Inter-Light": require("./assets/fonts/Inter/Inter-Light.ttf"),
					"Inter-Medium": require("./assets/fonts/Inter/Inter-Medium.ttf"),
					"Inter-Bold": require("./assets/fonts/Inter/Inter-Bold.ttf"),
				});

				await Promise.all([ fontAssets ]);
			} catch (e) {
				console.warn(e)
			} finally {
				setAppIsReady(true);
				SplashScreen.hideAsync();
			}
		}

		loadResourcesAsync();
	}, []);

	useEffect(() => {
		registerForPushNotificationsAsync()
			.then(token => setExpoPushToken(token))
			.catch((err) => { console.log("whelp.", err)});

		notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
			setNotification(notification);
		});

		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
			console.log(response);
		});

		return () => {
			Notifications.removeNotificationSubscription(notificationListener.current);
			Notifications.removeNotificationSubscription(responseListener.current);
		}
	}, []);

	if (!appIsReady) {
		return null;
	}

	return (
		<NavigationContainer>
			<Tab.Navigator 
				sceneContainerStyle={styles.navScreens} 
				screenOptions={navigationOpts}
			>
				<Tab.Screen 
					name="Tasks" 
					component={TasksScreen}
					options = {{
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="check" color={color} size={size} />
						)
					}}
				/>
				<Tab.Screen 
					name="Reocurring Tasks" 
					component={RecurScreen} 
					options = {{
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="alarm-check" color={color} size={size} />
						)
					}}
				/>
				<Tab.Screen 
					name="Notes" 
					component={NotesScreen} 
					options = {{
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="notebook" color={color} size={size} />
						)
					}}
				/>
				<Tab.Screen 
					name="Calendar" 
					component={CalendarScreen} 
					options = {{
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="calendar" color={color} size={size} />
						)
					}}
				/>
			</Tab.Navigator>
			<StatusBar backgroundColor="#1e2126" style="light"/>
		</NavigationContainer>
	);
}

// Notification Functions
async function schedulePushNotification() {
	await Notifications.scheduleNotificationAsync({
		content: {
			title: "Wow!",
			body: "A notification!",
		},
		trigger: { seconds: 2 },
	})
}

async function registerForPushNotificationsAsync() {
	let token;

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.DEFAULT,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}
	if (finalStatus !== "granted") {
		alert("Could not get push notification token!");
		return;
	}

	token = (await Notifications.getExpoPushTokenAsync({
		projectId: "notorious",
	})).data;
	console.log("NOTIF TOKEN:", token)

	return token;
}



// App Styles
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

const styles = StyleSheet.create({
	navScreens: {
		paddingTop: STATUSBAR_HEIGHT,
	}
});

const navigationOpts = {
	tabBarActiveTintColor: "#f2f6ff",
	tabBarInactiveTintColor: "#7c7f8e",
	tabBarShowLabel: false,

	headerShown: false,

	tabBarStyle: {
		backgroundColor: "#16171a",
		height: 65,

		paddingBottom: 0,
		borderTopWidth: 0,
	},
}
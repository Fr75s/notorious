import { useCallback, useState, useEffect, useRef } from "react";
import { Text, Alert, Easing, Platform, StyleSheet, Settings } from "react-native";

import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import Constants from "expo-constants";

import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MenuProvider } from "react-native-popup-menu";

import store from "./components/redux/store";
import { setSettings } from "./components/redux/SettingActions";
import { setTaskData } from "./components/redux/TaskActions";
import { setNotes } from "./components/redux/NoteActions";
import { setCalendar } from "./components/redux/CalendarActions";
import { Provider } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TasksScreen from "./screens/Tasks.js";
import NotesScreen from "./screens/Notes.js";
import RecurScreen from "./screens/Recur";
import CalendarScreen from "./screens/Calendar.js";
import SettingsScreen from "./screens/Settings.js";

// Set the default way to handle notifications
Notifications.setNotificationHandler({
	handleNotification: async() => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	})
})

// Set notification actions for notifications
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

// Linking
const linkingPrefix = Linking.createURL("/");

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Tab State
export default function App() {
	const [expoPushToken, setExpoPushToken] = useState("");
	const [notification, setNotification] = useState(false);

	const notificationListener = useRef();
	const responseListener = useRef();
	
	const [appIsReady, setAppIsReady] = useState(false);

	const linking = {
		prefixes: [linkingPrefix],
	};

	useEffect(() => {
		async function loadResourcesAsync() {
			try {
				// Do not hide splash until everything's loaded
				SplashScreen.preventAutoHideAsync();

				// Set the navigation bar color
				NavigationBar.setBackgroundColorAsync("#16171a");

				// Load fonts
				const fontAssets = Font.loadAsync({
					"Inter-Light": require("./assets/fonts/Inter/Inter-Light.ttf"),
					"Inter-Medium": require("./assets/fonts/Inter/Inter-Medium.ttf"),
					"Inter-Bold": require("./assets/fonts/Inter/Inter-Bold.ttf"),

					"Meslo-Regular": require("./assets/fonts/Meslo/Meslo-Regular.ttf"),
				});

				const askForNotifications = async () => {
					const permissions = await Notifications.getPermissionsAsync();
					const allowed = permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
					
					if (allowed) {
						return allowed;
					} else {
						return await Notifications.requestPermissionsAsync({
							ios: {
								allowAlert: true,
								allowBadge: true,
								allowSound: true,
							}
						})
					}
				}

				// Load Settings
				const loadedSettings = await AsyncStorage.getItem("@settings");
				if (loadedSettings) {
					console.log("Preloaded Settings:", loadedSettings);
					const parsedSettings = JSON.parse(loadedSettings);
					store.dispatch(setSettings(parsedSettings));

					// Alert user if notifications are disabled
					console.log("Asking user for notifications (if necessary)");
					if (!Object.keys(parsedSettings).includes("disableNotificationPermissionPrompt") || !parsedSettings["disableNotificationPermissionPrompt"]) {
						askForNotifications();
					}
				} else {
					console.log("Couldn't load settings, doing notification prompt");
					askForNotifications();
				}

				// Load Tasks
				const loadedTasks = await AsyncStorage.getItem("@taskData");
				if (loadedTasks) {
					console.log("Preloaded Tasks:", loadedTasks);
					store.dispatch(setTaskData(JSON.parse(loadedTasks)));
				}

				// Load Notes
				const loadedNotes = await AsyncStorage.getItem("@notes");
				if (loadedNotes) {
					console.log("Preloaded Notes:", loadedNotes);
					store.dispatch(setNotes(JSON.parse(loadedNotes)));
				}

				// Load Calendar Data
				const loadedCalendar = await AsyncStorage.getItem("@calendar");
				if (loadedCalendar) {
					console.log("Preloaded Calendar");
					store.dispatch(setCalendar(JSON.parse(loadedCalendar)));
				}

				// Return fonts
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

	if (!appIsReady) {
		return null;
	}

	return (
		<Provider store={store}>
			<MenuProvider>
				<NavigationContainer linking={linking}>
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
						<Tab.Screen 
							name="Settings" 
							component={SettingsScreen} 
							options = {{
								tabBarIcon: ({ color, size }) => (
									<MaterialCommunityIcons name="cog" color={color} size={size} />
								)
							}}
						/>
					</Tab.Navigator>
					<StatusBar backgroundColor="#1e2126" style="light"/>
				</NavigationContainer>
			</MenuProvider>
		</Provider>
	);
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
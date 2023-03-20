import { View, Text,  Pressable, StyleSheet } from "react-native";
import Markdown from "react-native-marked";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { globalMenuStyles, globalMDStyles } from "./GlobalStyles";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";

export default function NoteView({ data, rearrange, openAction, longOpenAction }) {
	const iconSize = 30;
	
	return (
		<View style={styles.back}>
			{/*
			{taskData.notify ? <MaterialCommunityIcons 
				style={styles.repeatIndicator}
				name={taskData.repeatInterval ? "alarm" : "bell"} 
				size={20} 
				color={"#7c7f8e"}
			/> : null}
			*/}

			

			<View style={styles.flexZone}>
				<Pressable
					style={styles.info}
					onPress={openAction}
					delayLongPress={300}
					onLongPress={longOpenAction}
				>
					<Text 
						style={[styles.title, {
							color: data.accentColor ? data.accentColor : "#f2f6ff"
						}]}
						numberOfLines={1}
					>
						{data.name}
					</Text>
					<Markdown 
						value={data.content}
						styles={globalMDStyles}
					/>
				</Pressable>
			</View>



			<Menu style={styles.menuButton}>
				<MenuTrigger>
					<MaterialCommunityIcons 
						//style={styles.menuButton}
						name={"menu"} 
						size={30} 
						color={"#7c7f8e"}
					/>
				</MenuTrigger>
				<MenuOptions customStyles={globalMenuStyles}>
					<MenuOption 
						text={"Move To Different Notebook"}
					/>
					<MenuOption 
						text={"Archive Note"}
					/>
					<MenuOption 
						text={"Delete Note"}
					/>
				</MenuOptions>
			</Menu>
		</View>
	)
}

const styles = StyleSheet.create({
	back: {
		//flex: 1,
		//flexDirection: "row",
		//alignItems: "center",

		maxHeight: 200,
		//height: 50,
		overflow: "hidden",
		
		backgroundColor: "#16171a",
		borderRadius: 18,

		marginBottom: 15,
		padding: 15,

		elevation: 1,
	},

	flexZone: {
		width: "100%",
		flexDirection: "row",

		//alignItems: "center",
	},



	info: {
		flex: 7,
		//borderWidth: 2
	},

	menuButton: {
		position: "absolute",
		right: 15,
		top: 15,
	},

	actions: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",

		//borderWidth: 2,
	},

	actionButton: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},



	title: {
		fontFamily: "Inter-Bold",
		fontSize: 24,
		color: "#f2f6ff",
	},

	desc: {
		marginTop: 5,
		fontFamily: "Inter-Light",
		fontSize: 16,
		color: "#7c7f8e",
	}
})
import { View, Text, Pressable, StyleSheet } from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { globalMenuDestructiveText, globalMenuStyles, globalStyles } from "./GlobalStyles";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";

export default function NotebookView({ notebook, pressAction, renameAction, deleteAction }) {
	const iconSize = 30;
	const defaultNotebooks = ["Standard", "Archived", "Deleted"]

	return (
		<View style={styles.back}>
			<View style={styles.flexZone}>
				<Pressable
					style={styles.info}
					android_ripple={{
						color: "#26282d"
					}}
					onPress={pressAction}
				>
					<Text 
						style={styles.title}
					>
						{notebook}
					</Text>
				</Pressable>
				{ !defaultNotebooks.includes(notebook) ? <Menu style={styles.menuButton}>
					<MenuTrigger>
						<MaterialCommunityIcons 
							//style={styles.menuButton}
							name={"menu"} 
							size={25} 
							color={"#7c7f8e"}
						/>
					</MenuTrigger>
					<MenuOptions customStyles={globalMenuStyles}>
						<MenuOption 
							text={"Rename Notebook"}
							onSelect={() => { renameAction(notebook) }}
						/>
						<MenuOption 
							text={"Delete Notebook"}
							customStyles={globalMenuDestructiveText}
							onSelect={deleteAction}
						/>
					</MenuOptions>
				</Menu> : null }
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	back: {
		//flex: 1,
		//flexDirection: "row",
		//alignItems: "center",
		
		overflow: "hidden",
		
		backgroundColor: "#16171a",
		borderRadius: 18,

		marginBottom: 15,
		padding: 15,

		elevation: 4,
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
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},



	title: {
		fontFamily: "Inter-Medium",
		fontSize: 20,
		color: "#f2f6ff",
	},
})
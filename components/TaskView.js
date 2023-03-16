import { View, Text, Pressable, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function TaskView({ taskData, completionState, clearAction, checkAction }) {
	
	let checkColor = "#7c7f8e"
	if (completionState === 2) {
		checkColor = "#74ffaa"
	}
	
	return (
		<View style={styles.back}>
			<View style={styles.info}>
				<Text 
					style={styles.title}
					numberOfLines={1}
				>{taskData.name}</Text>
				<Text 
					style={styles.desc}
					numberOfLines={1}
				>{taskData.desc}</Text>
			</View>
			<View style={styles.actions}>
				<Pressable
					style={styles.actionButton}
					onPress={() => clearAction()}
				>
					<MaterialCommunityIcons name="close" size={30} color={"#7c7f8e"} />
				</Pressable>
				<Pressable
					style={styles.actionButton}
					onPress={() => checkAction()}
				>
					<MaterialCommunityIcons name="check" size={30} color={checkColor}/>
				</Pressable>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	back: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",

		height: 125,
		backgroundColor: "#16171a",
		borderRadius: 18,

		marginTop: 15,
		padding: 15,

		elevation: 1,
	},

	info: {
		flex: 6,
	},

	actions: {
		flex: 1,
		flexDirection: "column",
		alignItems: "flex-end",
		justifyContent: "center",
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
		fontFamily: "Inter-Light",
		fontSize: 16,
		color: "#7c7f8e",
	}
})
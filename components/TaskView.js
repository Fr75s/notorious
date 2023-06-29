import { View, Text, Alert, Pressable, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function TaskView({ taskData, completionState, usePartialCompletionIcons, rearrangeMode, clearAction, checkAction, infoAction, longInfoAction, upperRearrangeAction, lowerRearrangeAction }) {
	
	let checkColor = "#7c7f8e"
	if (!rearrangeMode) {
		if (completionState === 1) {
			checkColor = "#f2f6ff"
		}
		if (completionState === 2) {
			checkColor = "#74ffaa"
		}
	}

	let upperIcon = "close";
	if (rearrangeMode) {
		upperIcon = "chevron-up";
	}

	let lowerIcon = "check";
	if (rearrangeMode) {
		lowerIcon = "chevron-down";
	} else {
		if (usePartialCompletionIcons) {
			switch (completionState) {
				case 0:
					lowerIcon = "circle-outline";
					break;
				case 1:
					lowerIcon = "circle-half-full"
					break;
				case 2:
					lowerIcon = "circle"
					break;
			}
		}
	}

	const iconSize = 30;

	return (
		<View style={styles.back}>
			{taskData.notify && (new Date(taskData.notifyDate) > new Date() || taskData.repeatInterval) ? <MaterialCommunityIcons 
				style={styles.repeatIndicator}
				name={taskData.repeatInterval ? "alarm" : "bell"} 
				size={20} 
				color={"#7c7f8e"}
			/> : null}
			<View style={styles.flexZone}>
				<Pressable
					style={styles.info}
					onPress={() => infoAction()}
					delayLongPress={300}
					onLongPress={() => longInfoAction()}
				>
					<Text 
						style={styles.title}
						numberOfLines={1}
					>{taskData.name}</Text>
					<Text 
						style={styles.desc}
						numberOfLines={1}
					>{taskData.desc}</Text>
				</Pressable>
				<View style={styles.actions}>
					<Pressable
						style={styles.actionButton}
						onPress={() => {
							if (rearrangeMode)
								upperRearrangeAction()
							else
								clearAction()
						}}
					>
						<MaterialCommunityIcons name={upperIcon} size={iconSize} color={"#7c7f8e"} />
					</Pressable>
					{/*
					<Pressable
						style={styles.actionButton}
						onPress={() => infoAction()}
					>
						<MaterialCommunityIcons name="pencil" size={iconSize} color={"#7c7f8e"}/>
					</Pressable>
					*/}
					<Pressable
						style={styles.actionButton}
						onPress={() => {
							if (rearrangeMode)
								lowerRearrangeAction()
							else
								checkAction()
						}}
					>
						<MaterialCommunityIcons name={lowerIcon} size={iconSize} color={checkColor}/>
					</Pressable>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	back: {
		//flex: 1,
		//flexDirection: "row",
		//alignItems: "center",

		height: 125,
		backgroundColor: "#16171a",
		borderRadius: 18,

		marginBottom: 15,
		padding: 15,

		elevation: 1,
	},

	flexZone: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
	},



	info: {
		flex: 7,
	},

	repeatIndicator: {
		position: "absolute",
		left: 12,
		top: 10,
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
		fontFamily: "Inter-Light",
		fontSize: 16,
		color: "#7c7f8e",
	}
})
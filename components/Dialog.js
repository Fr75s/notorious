import { useState } from "react";
import { View, Text, Modal, Pressable, TextInput, StyleSheet, KeyboardAvoidingView } from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { globalStyles } from "./GlobalStyles";

export default function Dialog({ visible, type, title, details, inputPlaceholder, dismissAction, action1, action2, action1Name = "Ok", action2Name = "Cancel" }) {
	const [textInputValue, setTextInputValue] = useState("");

	return (
		<Modal 
			visible={visible}
			animationType={"fade"}
			transparent={true}
			statusBarTranslucent={true}

			onRequestClose={dismissAction}
		>
			<KeyboardAvoidingView
				behavior="height"
				style={styles.back}
			>
				<Pressable 
					style={styles.fill}
					onPress={dismissAction}
				>
					<Pressable 
						style={styles.window}
					>
						<Text style={globalStyles.h1}>
							{title}
						</Text>
						<Text style={globalStyles.h3}>
							{details}
						</Text>

						{ type === "textInput" ? <TextInput 
							style={styles.input}
							placeholder={inputPlaceholder}
							placeholderTextColor={"#7c7f8e"}
							selectionColor={"#74aaff"}

							onChangeText={setTextInputValue}
							onSubmitEditing={() => {
								action1(textInputValue);
								dismissAction();
							}}
							autoFocus={true}
							value={textInputValue}
						/> : null}

						<View style={styles.choiceContainer}>
							{ action2 ? <Pressable
								style={styles.choiceButton}
								android_ripple={{ color: "#26282d" }}
								onPress={() => {
									action2();
									dismissAction();
								}}
							>
								<Text style={globalStyles.h3}>
									{action2Name}
								</Text>
							</Pressable> : action1 }
							{ action1 ? <Pressable
								style={styles.choiceButton}
								android_ripple={{ color: "#26282d" }}
								onPress={() => {
									if (type === "textInput") {
										action1(textInputValue);
									} else {
										action1();
									}
									dismissAction();
								}}
							>
								<Text style={globalStyles.h3}>
									{action1Name}
								</Text>
							</Pressable> : null}
						</View>
					</Pressable>
				</Pressable>
			</KeyboardAvoidingView>
		</Modal>
	)
}

const styles = StyleSheet.create({
	back: {
		flex: 1,
		//flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",

		backgroundColor: "#16171a40",
	},

	fill: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
	},

	window: {
		//flex: 1,
		padding: 20,

		width: "85%",
		//height: 250,

		alignItems: "center",

		backgroundColor: "#16171a",
		borderRadius: 10,

		elevation: 5,
	},


	
	choiceContainer: {
		flexDirection: "row",
		marginTop: 20
	},

	choiceButton: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",

		padding: 15,
	},



	input: {
		width: "90%",

		borderBottomColor: "#7c7f8e",
		borderBottomWidth: 2,
		marginBottom: 10,
		padding: 5,

		fontFamily: "Inter-Light",
		fontSize: 16,
		color: "#f2f6ff",
	}
})
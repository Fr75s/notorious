import { View, Text, Pressable } from "react-native";
import { globalStyles } from "./GlobalStyles";

export function AlertModal({ modal }) {
	

	const title = modal.getParam("title", "Alert");
	const message = modal.getParam("message", "");

	const action1Name = modal.getParam("action1Name", "Ok")
	const action1 = modal.getParam("action1", modal.closeModal)

	const action2Name = modal.getParam("action2Name", "Cancel")
	const action2 = modal.getParam("action2", modal.closeModal)

	return (
		<View style={globalStyles.modal}>
			<Text style={globalStyles.h1}>{title}</Text>
			<Text style={globalStyles.h3}>{message}</Text>

			<View style={[globalStyles.row, { flex: 0, height: 50, marginTop: 15 }]}>
				<Pressable
					style={{ flex: 1, alignItems: "center" }}
					android_ripple={{color: "#16171a"}}
					onPress={action2}
				>
					<Text style={[globalStyles.h3, { padding: 15 }]}>{action2Name}</Text>
				</Pressable>
				<Pressable
					style={{ flex: 1, alignItems: "center" }}
					android_ripple={{color: "#16171a"}}
					onPress={action1}
				>
					<Text style={[globalStyles.h3, { padding: 15 }]}>{action1Name}</Text>
				</Pressable>
			</View>
		</View>
	)
}
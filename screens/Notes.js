import { View, Text, StyleSheet } from "react-native";

import { globalStyles } from "./../components/GlobalStyles.js";

export default function NotesScreen() {
	return (
		<View style={globalStyles.screen}>
			<Text style={styles.text}>Notes Screen</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	text: {
		fontFamily: "Inter-Bold",
		color: "#f2f6ff",
	}
})
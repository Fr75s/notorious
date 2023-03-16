import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#1e2126",
		alignItems: "center",

		paddingTop: 20,
	},

	scrollScreen: {
		flex: 1,
		backgroundColor: "#1e2126",
		width: "100%",

		paddingTop: 20,
	},

	scrollScreenContent: {
		alignItems: "center",
	},

	row: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},

	rowItem: {
		flex: 1,
		alignItems: "center",
	},



	h1: {
		fontFamily: "Inter-Bold",
		fontSize: 24,
		color: "#f2f6ff",
	},

	h2: {
		marginTop: 30,
		fontFamily: "Inter-Light",
		fontSize: 18,
		color: "#f2f6ff",
	},

	h3: {
		fontFamily: "Inter-Medium",
		fontSize: 14,
		color: "#bdc0c7",
	},
})
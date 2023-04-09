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

		marginTop: 20,
		marginBottom: 0,

		//borderWidth: 2
	},

	modal: {
		//flex: 1,
		//alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#26282d",
		
		//borderWidth: 2,

		//height: 200,
		padding: 30,
		borderRadius: 20,
		elevation: 5,
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

	smallText: {
		fontFamily: "Inter-Medium",
		fontSize: 12,
		color: "#7c7f8e",
	}
})

export const globalMenuStyles = {
	optionsContainer: {
		backgroundColor: "#16171a",
		borderRadius: 15,
		marginTop: 30,
	},
	optionText: {
		color: "#f2f6ff",
		fontFamily: "Inter-Medium",
		fontSize: 16,
		color: "#f2f6ff",
		padding: 10,
	}
}

export const globalMenuDestructiveText = {
	optionText: {
		...globalMenuStyles.optionText,
		color: "#ff7474"
	}
}

export const globalMDStyles = {
	container: {
		width: "85%",
		backgroundColor: "#00000000"
	},

	codespan: {
		fontFamily: "Meslo-Regular",
		fontSize: 16,
		color: "#f2f6ff",
		backgroundColor: "#16171a"
	},

	code: {
		padding: 20,
		borderRadius: 10,
		width: "100%",
		backgroundColor: "#16171a"
	},

	h1: {
		fontFamily: "Inter-Medium",
		fontSize: 22,
		color: "#f2f6ff",

		marginTop: 10,
		paddingBottom: 5,
		borderBottomWidth: 1,
		borderBottomColor: "#7c7f8e",
	},

	h2: {
		fontFamily: "Inter-Light",
		fontSize: 20,
		color: "#f2f6ff",
		
		marginTop: 5,
		marginBottom: 5,
	},

	h3: {
		fontFamily: "Inter-Medium",
		fontSize: 16,
		color: "#bdc0c7",
	},

	h4: {
		fontFamily: "Inter-Medium",
		fontSize: 14,
		color: "#bdc0c7",
	},

	h5: {
		fontFamily: "Inter-Medium",
		fontSize: 14,
		color: "#7c7f8e",
	},

	h6: {
		fontFamily: "Inter-Medium",
		fontSize: 12,
		color: "#7c7f8e",
	},

	text: {
		fontFamily: "Inter-Light",
		fontSize: 16,
		color: "#f2f6ff",
	},

	link: {
		fontFamily: "Inter-Light",
		fontSize: 16,
		color: "#74aaff",
	}
}
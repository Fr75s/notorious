import { StyleSheet } from "react-native";

const frontPageStyles = StyleSheet.create({
	logo: {
		position: "absolute",
		width: 200,
		height: 50,
		left: 15,
		top: 15,
	},

	menuButton: {
		position: "absolute",
		
		flex: 1,
		alignItems: "center",
		justifyContent: "center",

		width: 50,
		height: 50,

		right: 20,
		top: 15,
		//borderRadius: (65 / 2),
	},

	placeholderImage: {
		position: "absolute",
		
		flex: 1,
		alignItems: "center",
		justifyContent: "center",

		width: 300,
		height: 150,

		top: 250,
	},

	placeholderLabel: {
		position: "absolute",
		
		flex: 1,
		alignItems: "center",
		justifyContent: "center",

		textAlign: "center",

		width: 400,
		height: 50,

		top: 380,

		color: "#7c7f8e",
		fontFamily: "Inter-Medium",
		fontSize: 16,
	}
})



const taskListStyles = StyleSheet.create({
	listBox: {
		width: "85%",
		marginTop: 15,
	},

	listFooter: {
		backgroundColor: "#7c7f8e",
		height: 2,

		marginBottom: 15,
		borderRadius: 2,
	},

	listFooterAlt: {
		marginBottom: 30,
	}
})



const searchStyles = StyleSheet.create({
	searchBar: {
		width: "85%",
		marginTop: 60,

		backgroundColor: "#16171a",
		borderRadius: 18,
		//elevation: 0,

		padding: 10,
		height: 50,
	},

	searchIcon: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},

	searchInput: {
		flex: 8,
		color: "#f2f6ff",
		textAlign: "left",
		fontFamily: "Inter-Medium",
		fontSize: 18,
	}
})



const taskModPageStyles = StyleSheet.create({
	taskInput: {
		color: "#f2f6ff",

		width: "85%",
		marginTop: 10,
		padding: 20,

		borderBottomWidth: 2,
		borderBottomColor: "#31333a",
	},

	taskNameInput: {
		fontFamily: "Inter-Bold",
		fontSize: 18,
	},

	taskDescInput: {
		fontFamily: "Inter-Light",
		fontSize: 16,
	}
})



export default styles = StyleSheet.create({
	...frontPageStyles,
	...taskListStyles,
	...searchStyles,
	...taskModPageStyles
})
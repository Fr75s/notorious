import { View, Text, Pressable, StyleSheet } from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { globalStyles } from "./../components/GlobalStyles.js";
import { Menu, MenuTrigger } from "react-native-popup-menu";

export default function Header({ menuOptions, backAction, label }) {
	return (
		<View style={[globalStyles.row, { flex: 0, width: "85%" }]}>
			<Pressable
				style={{ flex: 1, alignItems: "flex-start" }}
				onPress={backAction}
			>
				<MaterialCommunityIcons 
					name={"arrow-left"} 
					size={30} 
					color={"#f2f6ff"} 
				/>
			</Pressable>
			<Text style={[globalStyles.h2, {marginTop: 0}]}>{label}</Text>
			<Menu style={{ flex: 1, alignItems: "flex-end" }}>
				<MenuTrigger>
					<MaterialCommunityIcons name={"menu"} size={30} color={"#f2f6ff"} />
				</MenuTrigger>
				{menuOptions}
			</Menu>
		</View>
	)
}
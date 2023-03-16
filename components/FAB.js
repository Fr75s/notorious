import { Pressable, Vibration } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function FAB({ icon, onPress }) {
	
	
	return (
		<Pressable 
			style={() => [
				{
					position: "absolute",
		
					flex: 1,
					alignItems: "center",
					justifyContent: "center",

					backgroundColor: "#74aaff",

					width: 65,
					height: 65,

					bottom: 15,
					borderRadius: (65 / 2),

					elevation: 3,
				}
			]}
			android_ripple={{
				color: "#f2f6ff",
				radius: (65 / 2),
			}}
			onPress={() => {
				Vibration.vibrate(10);
				onPress()
			}}
		>
			<MaterialCommunityIcons name={icon} size={25} color={"#16171a"} />
		</Pressable>
	)
}
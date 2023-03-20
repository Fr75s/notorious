import { useState, useRef, useEffect } from "react";
import { View, Text, Image, FlatList, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";

import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useSelector } from "react-redux";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Markdown from "react-native-marked";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";

import store from "../components/redux/store";
import * as noteActions from "../components/redux/NoteActions";
import FAB from "./../components/FAB.js";
import NoteView from "../components/NoteView";

import { globalStyles, globalMenuStyles, globalMDStyles } from "./../components/GlobalStyles.js";

// Settings

let settings = {}

// Notes

/*
Note Properties:
id: Note ID
name: Note Name
content: Note Content (raw Markdown, lines split with \n)

accentColor: Accent color to distinguish/categorize/whatever this note
tags: List of tags applied to this note
attachedTasks: List of tasks attached to this note

creationDate: When this task was created
modifyDate: When this task was modified
reminderDate: Time when the user should be notified with a reminder
*/

/* 
The Notes variable itself is divided into 3 objects:
- Standard: Normal notes display.
- Archived: Notes that are archived
- Deleted: Notes that are deleted, tags removed upon deletion, autodelete after defined period.

Other objects may be present as "notebooks" with the same features as Standard.
*/

let notes = {}



// Note Helper Functions
function getAllTags(thisNotebook) {
	let tagList = []

	if (thisNotebook) {
		for (let i = 0; i < notes[thisNotebook].length; i++) {
			tagList = [
				...tagList,
				...notes[thisNotebook][i].tags
			]
		}
	} else {
		for (const notebookName in notes) {
			const notebook = notes[notebookName];
	
			for (let i = 0; i < notebook.length; i++) {
				tagList = [
					...tagList,
					...notebook[i].tags
				]
			}
		}
	}

	return tagList;
}

function getAllTasks() {
	let allTasks = store.getState().tasks;
	let tasks = [];

	for (let i = 0; i < allTasks.length; i++) {
		for (let j = 0; j < allTasks[i].data.length; j++) {
			tasks.push(allTasks[i].data[j]);
		}
	}

	return tasks;
}



// Note-Related Functions
async function saveNotes() {
	try {
		const noteDataString = JSON.stringify(notes)
		await AsyncStorage.setItem("@notes", noteDataString);
		console.log("Note Data successfully saved.");
	} catch (e) {
		console.log("There was an error saving note data:");
		console.log(e);
	}
}



function NoteListScreen({ navigation }) {
	notes = useSelector((state) => {
		console.log(state.notes);
		return state.notes;
	});

	const [notebook, setNotebook] = useState("standard");
	const emptyNotebook = () => {
		return notes[notebook].length === 0;
	}

	return (
		<View style={globalStyles.screen}>
			<Text style={styles.text}>Notes Screen</Text>

			{/*
			<Markdown
				value={`# Hello World \n ## Subtitle \n\n Some Content`}
				styles={{
					container: {
						width: "85%",
						backgroundColor: "#00000000"
					}
				}}
			/>
			*/}

			<FlatList 
				style={styles.searchItemsBox}
				data={notes[notebook]}
				renderItem={({item}) => 
					<NoteView
						data={item}
						openAction={() => {
							navigation.navigate("ViewNote", {
								mode: "modify",
								note: item,
								notebook: notebook
							});
						}}
						longOpenAction={() => {
							console.log(notes[notebook]);
						}}
					/>
				}
			/>


			{ emptyNotebook() ? <Image style={styles.placeholderImage} source={require("../assets/images/nothingtodo.png")} /> : null }
			{ emptyNotebook() ? <Text style={styles.placeholderLabel} >Nothing of note...</Text> : null }

			{ notebook !== "archived" && notebook !== "deleted" ? <FAB 
				icon={"plus"}
				onPress={() => {
					navigation.navigate("ViewNote", {
						mode: "new",
					});
				}}
			/> : null}
			{ notebook === "deleted" ? <FAB 
				icon={"close"}
				onPress={() => {
					console.log("Alert and clear deleted notes");
				}}
			/> : null}
		</View>
	)
}



function ViewNoteScreen({ route, navigation }) {
	const noteMode = route.params.mode;

	let passedNote = {};
	if (route.params.hasOwnProperty("note")) {
		passedNote = route.params.note;
	}

	const writeRef = useRef();

	const [editMode, setEditMode] = useState(noteMode === "new" ? true : false);
	const [localNoteContent, setLocalNoteContent] = useState(noteMode === "new" ? "" : passedNote.content);
	const [localNoteName, setLocalNoteName] = useState(noteMode === "new" ? "" : passedNote.name);
	
	const [localNoteTags, setLocalNoteTags] = useState(noteMode === "new" ? [] : passedNote.tags);
	
	const [localNoteColor, setLocalNoteColor] = useState(noteMode === "new" ? "None" : (passedNote.accentColor ? passedNote.accentColor : "None"));
	
	// You may need to move this snippet somewhere else
	let actualTasks = []
	if (noteMode !== "new") {
		const allTasks = getAllTasks();
		for (let i = 0; i < passedNote.attachedTasks; i++) {
			if (allTasks.includes(passedNote.attachedTasks[i])) {
				actualTasks.push(passedNote.attachedTasks[i]);
			}
		}
	}
	const [localNoteTasks, setLocalNoteTasks] = useState(noteMode === "new" ? [] : actualTasks);

	const [creationDate, setCreationDate] = useState(noteMode === "new" ? Date() : passedNote.creationDate);

	const notebook = (noteMode === "new" ? "standard" : route.params.notebook);

	const modificationDate = new Date().toString();

	const saveLocalNote = () => {
		console.log("Saving this note...");

		const noteID = "@" + localNoteName + ";" + creationDate;
		
		let realNoteColor = localNoteColor === "None" ? null : localNoteColor;

		const noteObj = {
			id: noteID,
			name: localNoteName,
			content: localNoteContent,

			tags: localNoteTags,
			accentColor: realNoteColor,
			attachedTasks: localNoteTasks,

			creationDate: creationDate,
			modifyDate: modificationDate,
		}

		console.log(noteObj);

		if (noteMode === "new") {
			store.dispatch(noteActions.addNote(noteObj));
			saveNotes();
			console.log("Added Note", noteID);
		} else {
			store.dispatch(noteActions.modifyNote(noteID, notebook, noteObj));
			saveNotes();
			console.log("Modified Note", noteID);
		}
	}

	useEffect(() => navigation.addListener("beforeRemove", (e) => {
		if (localNoteName !== "" || localNoteContent !== "") {
			saveLocalNote();
		}
	}))

	return (
		<View style={globalStyles.screen}>
			{/*<Text style={styles.text}>Edit a note</Text>*/}

			<View style={[globalStyles.row, { flex: 0, width: "85%" }]}>
				<Pressable
					style={{ flex: 1, alignItems: "flex-start" }}
					onPress={() => {
						navigation.goBack();
					}}
				>
					<MaterialCommunityIcons 
						name={"arrow-left"} 
						size={30} 
						color={"#f2f6ff"} 
					/>
				</Pressable>
				<Text style={[globalStyles.h2, {marginTop: 0}]}>Write A Note</Text>
				<Menu style={{ flex: 1, alignItems: "flex-end" }}>
					<MenuTrigger>
						<MaterialCommunityIcons name={"menu"} size={30} color={"#f2f6ff"} />
					</MenuTrigger>
					<MenuOptions customStyles={globalMenuStyles}>
						<MenuOption 
							text={"Set Tags"}
							onSelect={() => { 
								console.log("Opening Tag Set Page");
								navigation.navigate("SelectItems", {
									mode: "tags",
									already: localNoteTags,
									newItems: true,
									multi: true,
									backAction: (selectedTags) => {
										console.log("TAGS:", selectedTags);
										setLocalNoteTags(selectedTags);
									}
								});
							}}
						/>
						<MenuOption 
							text={"Set Color"}
							onSelect={() => { 
								console.log("Opening Color Select");
								navigation.navigate("SelectItems", {
									mode: "colors",
									already: [localNoteColor],
									newItems: false,
									multi: false,
									backAction: (selectedColor) => {
										console.log("COLOR:", selectedColor);
										setLocalNoteColor(selectedColor[0]);
									}
								});
							}}
						/>
						<MenuOption 
							text={"Attach Tasks"}
							onSelect={() => { 
								console.log("Opening Task Select");
								navigation.navigate("SelectItems", {
									mode: "tasks",
									already: localNoteTasks,
									newItems: false,
									multi: true,
									backAction: (selectedTasks) => {
										console.log("TASKS:", selectedTasks);
										setLocalNoteTasks(selectedTasks);
									}
								});
							}}
						/>
					</MenuOptions>
				</Menu>
			</View>

			{ editMode ? <ScrollView 
				style={[
					globalStyles.scrollScreen,
					{ width: "85%" }
				]}
			>
				<TextInput 
					style={[styles.writerTitle, {
						color: localNoteColor !== "None" ? localNoteColor : "#f2f6ff"
					}]}
					placeholderTextColor={"#7c7f8e"}
					selectionColor={"#74aaff"}

					onSubmitEditing={() => { writeRef.current.focus(); }}
					onChangeText={setLocalNoteName}
					value={localNoteName}

					autoFocus={noteMode === "new"}
					placeholder={"Name"}
				/>
				<TextInput 
					ref={writeRef}
					style={styles.writer}
					placeholderTextColor={"#7c7f8e"}
					selectionColor={"#74aaff"}

					autoFocus={noteMode !== "new"}
					multiline={true}

					onChangeText={setLocalNoteContent}
					value={localNoteContent}

					placeholder={"Write a note"}
				/>
				<Text style={styles.smallInfo}>
					Note created on {new Date(creationDate).toLocaleDateString()} at {new Date(creationDate).toLocaleTimeString()}
					{"\n"}Note modified on {new Date(modificationDate).toLocaleDateString()} at {new Date(modificationDate).toLocaleTimeString()}
					{"\n\n"}Tags: {localNoteTags}
					{"\n"}Color: {localNoteColor}
					{"\n"}Attached Tasks: {localNoteTasks}
				</Text>
			</ScrollView> : null}

			{ !editMode ? <Text 
				style={[styles.noteTitle, {
					color: localNoteColor !== "None" ? localNoteColor : "#f2f6ff"
				}]}
			>
				{localNoteName}
			</Text>: null}
			{ !editMode ? <Markdown
				value={localNoteContent}
				styles={globalMDStyles}
			/> : null}

			<FAB 
				icon={editMode ? "eye" : "pencil"}
				onPress={() => {
					//console.log(creationDate);
					setEditMode(!editMode);
				}}
			/>
		</View>
	)
}



function SearchNoteScreen({ route, navigation }) {
	return (
		<View style={globalStyles.screen}>
			<Text style={styles.text}>SEARCH</Text>
		</View>
	)
}



function SelectListedItemsScreen({ route, navigation }) {
	let initial = []

	const prepareSelectableList = (rawList, rawListReal) => {
		let selectableList = []
		for (let i = 0; i < rawList.length; i++) {
			//console.log(!rawListReal[i]);
			selectableList[i] = {
				label: rawList[i],
				real: (rawListReal ? rawListReal[i] : null),
				selected: (rawListReal ? route.params.already.includes(rawListReal[i]) : route.params.already.includes(rawList[i]))
			}
		}
		return selectableList;
	}

	switch(route.params.mode) {
		case "tags": {
			initial = prepareSelectableList(getAllTags());
			break;
		}
		case "colors": {
			initial = prepareSelectableList([
				"None",
				"Red",
				"Green",
				"Blue",
			], [
				"None",
				"#f7597b",
				"#74ff74",
				"#74aaff",
			]);
			break;
		}
		case "tasks": {
			let allTasks = getAllTasks();
			let taskNames = [];
			let taskIDs = [];

			for (let i = 0; i < allTasks.length; i++) {
				taskNames.push(allTasks[i].name);
				taskIDs.push(allTasks[i].id);
			}

			initial = prepareSelectableList(taskNames, taskIDs);
			break;
		}
		default: {
			//setItems([]);
		}
	}
	
	const [items, setItems] = useState(initial);

	const newItems = route.params.newItems;
	const multiSelect = route.params.multi;

	const [newItemText, setNewItemText] = useState("");
	
	const [refreshList, setRefreshList] = useState(false);

	const removeItem = (index) => {
		let newItems = items;
		newItems.splice(index, 1);

		setItems(newItems);
		setRefreshList(!refreshList);
	}

	const beforeReturn = () => {
		let selectedList = [];
		for (let i = 0; i < items.length; i++) {
			if (items[i].selected) {
				if (items[i].real) {
					selectedList.push(items[i].real);
				} else {
					selectedList.push(items[i].label);
				}
			}
		}
		route.params.backAction(selectedList);
	}

	useEffect(() => navigation.addListener("beforeRemove", (e) => {
		beforeReturn();
	}))

	return (
		<View style={globalStyles.screen}>
			<Text style={globalStyles.h1}>
				Select
			</Text>

			<FlatList 
				style={styles.searchItemsBox}
				data={items}
				ListHeaderComponent={ 
					newItems ? <View style={[globalStyles.row, { flex: 1, marginBottom: 10 }]}>
						<TextInput 
							style={[styles.writerTitle, { flex: 3 }]}
							placeholderTextColor={"#7c7f8e"}
							selectionColor={"#74aaff"}

							onSubmitEditing={() => {
								if (newItemText !== "") {
									setItems([
										...items,
										{
											label: newItemText,
											selected: (multiSelect)
										}
									])
								}
							}}
							onChangeText={setNewItemText}
							value={newItemText}
							placeholder={"New"}
						/>
						<Pressable
							style={globalStyles.rowItem}
							android_ripple={{
								color: "#16171a"
							}}
							onPress={() => {
								if (newItemText !== "") {
									setItems([
										...items,
										{
											label: newItemText,
											selected: (multiSelect)
										}
									])
								}
							}}
						>
							<MaterialCommunityIcons 
								name={"plus"} 
								size={30} 
								color={"#f2f6ff"} 
							/>
						</Pressable>
					</View> : null
				}
				renderItem={({item, index}) => 
					<Menu style={{flex: 1}}>
						<MenuTrigger 
							style={globalStyles.row}
							triggerOnLongPress={true}

							onAlternativeAction={() => {
								let newItems = items;
								
								if (!multiSelect) {
									for (let i = 0; i < newItems.length; i++) {
										if (newItems[i].selected)
											newItems[i].selected = false;
									}
								}

								newItems[index].selected = !newItems[index].selected;
								
								setItems(newItems);
								setRefreshList(!refreshList);
							}}
						>
							<Text style={[globalStyles.h2, {
								flex: 5, 
								marginTop: 0,
								padding: 15,
							}]}>
								{item.label}
							</Text>
							<MaterialCommunityIcons 
								style={{
									padding: 0,
									alignItems: "center",
									flex: 1,
								}}
								name={item.selected ? "checkbox-marked-outline" : "checkbox-blank-outline"} 
								size={25} 
								color={"#f2f6ff"} 
							/>
						</MenuTrigger>
						<MenuOptions customStyles={globalMenuStyles}>
							{ newItems ? <MenuOption 
								text={"Delete"}
								onSelect={() => {
									removeItem(index);
								}}
							/> : null}
						</MenuOptions>
					</Menu>
				}
				extraData={refreshList}
			/>

			<FAB 
				icon={"check"}
				onPress={() => {
					//beforeReturn();
					navigation.goBack();
				}}
			/>
		</View>
	)
}



const Stack = createStackNavigator();

export default function NotesScreen({ navigation }) {
	settings = useSelector(state => state.settings);

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="NoteList" component={NoteListScreen} />
			<Stack.Screen name="ViewNote" component={ViewNoteScreen} options={{ presentation: "modal" }} />
			<Stack.Screen name="SearchNotes" component={SearchNoteScreen} options={{ presentation: "modal" }} />
			<Stack.Screen name="SelectItems" component={SelectListedItemsScreen} options={{ presentation: "modal" }} />
		</Stack.Navigator>
	)
}

const styles = StyleSheet.create({
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
	},



	writerTitle: {
		//marginTop: 20,
		//height: "80%",

		padding: 10,

		fontFamily: "Inter-Bold",
		color: "#f2f6ff",
		fontSize: 18,

		borderBottomColor: "#7c7f8e",
		borderBottomWidth: 2,

		//backgroundColor: "#31333a"
	},

	writer: {
		marginTop: 20,
		padding: 10,
		//height: "80%",

		textAlignVertical: "top",
		fontFamily: "Inter-Medium",
		color: "#f2f6ff",

		//backgroundColor: "#31333a"
	},
	
	noteTitle: {
		...globalStyles.h1,
		textAlign: "left",
		paddingTop: 20,
		marginBottom: 10,
		width: "85%"
	},

	smallInfo: {
		...globalStyles.smallText,
		textAlign: "left",
		padding: 10,
		width: "85%"
	},



	searchItemsBox: {
		width: "85%",
		marginTop: 15,

		//borderWidth: 2,
	},



	text: {
		fontFamily: "Inter-Bold",
		color: "#f2f6ff",
	}
})
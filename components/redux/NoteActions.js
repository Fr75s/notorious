export const RESET_NOTES = "RESET_NOTES";
export const resetNotes = () => ({
	type: RESET_NOTES,
	payload: { }
});

export const SET_NOTES = "SET_NOTES";
export const setNotes = (noteData) => ({
	type: SET_NOTES,
	payload: {
		data: noteData,
	}
})

export const ADD_NOTE = "ADD_NOTE";
export const addNote = (noteObj) => ({
	type: ADD_NOTE,
	payload: {
		note: noteObj
	}
})

export const MODIFY_NOTE = "MODIFY_NOTE";
export const modifyNote = (noteID, notebook, newNote) => ({
	type: MODIFY_NOTE,
	payload: {
		id: noteID,
		notebook: notebook,
		newNote: newNote
	}
})

export const REMOVE_NOTE = "REMOVE_NOTE";
export const removeNote = (noteID, notebook) => ({
	type: REMOVE_NOTE,
	payload: {
		id: noteID,
		notebook: notebook
	}
})

export const SHIFT_NOTE = "SHIFT_NOTE";
export const shiftNote = (noteID, notebook, up) => ({
	type: SHIFT_NOTE,
	payload: {
		id: noteID,
		notebook: notebook,
		up: up
	}
})

export const MOVE_NOTE = "MOVE_NOTE";
export const moveNote = (noteID, notebook, index) => ({
	type: MOVE_NOTE,
	payload: {
		id: noteID,
		notebook: notebook,
		index: index,
	}
})

export const CHANGE_NOTEBOOK = "CHANGE_NOTEBOOK";
export const changeNotebook = (noteID, oldNotebook, newNotebook) => ({
	type: CHANGE_NOTEBOOK,
	payload: {
		id: noteID,
		notebook: oldNotebook,
		newNotebook: newNotebook
	}
})

export const CREATE_NOTEBOOK = "CREATE_NOTEBOOK";
export const createNotebook = (name) => ({
	type: CREATE_NOTEBOOK,
	payload: {
		name: name,
	}
})

export const REMOVE_NOTEBOOK = "REMOVE_NOTEBOOK";
export const removeNotebook = (name) => ({
	type: REMOVE_NOTEBOOK,
	payload: {
		name: name,
	}
})
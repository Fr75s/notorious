

export const CHANGE_SETTING = "CHANGE_SETTING";

export const changeSetting = (key, newValue) => ({
	type: CHANGE_SETTING,
	payload: {
		key: key,
		value: newValue
	}
});

export const SET_SETTINGS = "SET_SETTINGS";

export const setSettings = (settings) => ({
	type: SET_SETTINGS,
	payload: {
		settings: settings
	}
});
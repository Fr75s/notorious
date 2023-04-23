import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

import { globalStyles } from "../GlobalStyles";
import { getItemsFromCalendarDate } from '../helpers';
import store from "../redux/store";

export default function CalendarWidget({ year = new Date().getFullYear() , month = new Date().getMonth() }) {
	
	// Retrieve Data

	const calendar = store.getState().calendar;
	const settings = store.getState().settings;

	//console.log("From the widget, calendar:", calendar);
	
	// Format Data -----
	
	let dates = [[]];
	const startDate = new Date(year, month, 1);
	const endDate = new Date(year, month + 1, 1);

	for (let d = 0; d < startDate.getDay(); d++) {
		dates[0][d] = null;
	}

	let row = 0;
	let selectedDay = -1

	for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
		let dateDataItems = getItemsFromCalendarDate(d, calendar);
		
		dates[row][d.getDay()] = {
			day: d.getDate(),
			items: dateDataItems
		};

		if (d.toLocaleDateString() === new Date().toLocaleDateString()) {
			selectedDay = d.getDate();
		}
		
		if (d.getDay() === 6) {
			row += 1;
			dates[row] = [];
		}
	}

	console.log("#####");

	for (let d = endDate.getDay(); d <= 6; d++) {
		dates[row][d] = null;
	}

	//console.log(dates);
	//console.log(selectedDay);

	// Dates
	/*
	try {
		for (let i = 0; i < calendar[year][month].length; i++) {

		}

	} catch (e) {
		if (e instanceof TypeError) {
			console.log("This year/month doesn't exist yet.")
		} else {
			console.error(e);
		}
	}
	*/


	// Define Widget -----

	const styles = {
		calendarRow: {
			flex: 1,

			width: "match_parent",
			alignItems: "center",
			justifyContent: "center",
			flexDirection: "row",

			//borderWidth: 2,
		},
	
		calendarText: {
			...globalStyles.h3,

			fontFamily: "Inter-Regular",

			width: 30,
			height: 30,
			borderRadius: 15,

			textAlignVertical: "center",
			textAlign: "center",
		},

		topButton: {
			...globalStyles.h3,
			textAlign: "center",
			fontFamily: "Inter-Regular",

			width: 30,
			height: 30,
			borderRadius: 10,

			color: "#16171a",
			backgroundColor: "#74aaff"
		},

		monthLabel: {
			...globalStyles.h2,
			marginTop: 0,
			textAlign: "center",
			fontFamily: "Inter-Regular",

			padding: 5,
			paddingLeft: 40,
			paddingRight: 40,
			borderRadius: 10,
			//backgroundColor: "#26282d"
		},

		dotContainer: {
			flexDirection: "row",
			alignItems: "center",

			flexGap: 2,

			height: 5,
			marginTop: 2,
		},

		dot: {
			height: 5,
			width: 5,

			borderRadius: 5,

			backgroundColor: "#74aaff",
		},

		labelContainer: {
			alignItems: "center",
			height: 10,
			marginTop: 2,
		},

		label: {
			...globalStyles.smallText,
			fontFamily: "Inter-Regular",

			fontSize: 7,
			textAlign: "center",
			
			color: "#74aaff"
		}
	}

	const CalendarItem = ({ data }) => {
		return (
			<FlexWidget 
				style={{ flex: 1, alignItems: "center" }} 
				clickAction={data ? "" + data.day : ""}
				clickActionData={{ year: year, month: month }} 
			>
				<TextWidget text={data ? "" + data.day : " "} style={{
					...styles.calendarText,
					backgroundColor: (data && data.day === selectedDay ? "#31333a" : null)
				}} />
				{ !settings["verboseCalendar"] ? <FlexWidget style={styles.dotContainer}>
					{data && data.items && data.items.length > 0 ? <FlexWidget style={styles.dot}/> : null}
					{data && data.items && data.items.length > 1 ? <FlexWidget style={styles.dot}/> : null}
					{data && data.items && data.items.length > 2 ? <FlexWidget style={styles.dot}/> : null}
				</FlexWidget> : <FlexWidget style={styles.labelContainer}>
					{data && data.items && data.items.length > 0 ? <TextWidget style={styles.label} text={data.items[0].title} maxLines={1} truncate={"MIDDLE"} /> : null}
				</FlexWidget>}
			</FlexWidget>
		)
	}

	return (
		<FlexWidget
			style={{
				height: 'match_parent',
				width: 'match_parent',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#16171a',
				borderRadius: 16,
			}}
		>
			<FlexWidget style={styles.calendarRow} >
				<FlexWidget style={{ flex: 1, alignItems: "center" }}>
					<TextWidget text={"<-"} style={styles.topButton} clickAction={"LEFT"} clickActionData={{ year: year, month: month }} />
				</FlexWidget>
				<FlexWidget style={{ flex: 3, alignItems: "center" }}>
					<TextWidget text={new Date(year, month).toLocaleString([], { month: "long" })} style={styles.monthLabel} clickAction={"CENTER"} />
				</FlexWidget>
				<FlexWidget style={{ flex: 1, alignItems: "center" }}>
					<TextWidget text={"->"} style={styles.topButton} clickAction={"RIGHT"} clickActionData={{ year: year, month: month }} />
				</FlexWidget>
			</FlexWidget>



			<FlexWidget style={styles.calendarRow} >
				<CalendarItem data={{ day: "S" }} />
				<CalendarItem data={{ day: "M" }} />
				<CalendarItem data={{ day: "T" }} />
				<CalendarItem data={{ day: "W" }} />
				<CalendarItem data={{ day: "T" }} />
				<CalendarItem data={{ day: "F" }} />
				<CalendarItem data={{ day: "S" }} />
			</FlexWidget>
			{ dates[0] ? <FlexWidget style={styles.calendarRow} >
				<CalendarItem data={dates[0][0]} />
				<CalendarItem data={dates[0][1]} />
				<CalendarItem data={dates[0][2]} />
				<CalendarItem data={dates[0][3]} />
				<CalendarItem data={dates[0][4]} />
				<CalendarItem data={dates[0][5]} />
				<CalendarItem data={dates[0][6]} />
			</FlexWidget> : null }
			{ dates[1] ? <FlexWidget style={styles.calendarRow} >
				<CalendarItem data={dates[1][0]} />
				<CalendarItem data={dates[1][1]} />
				<CalendarItem data={dates[1][2]} />
				<CalendarItem data={dates[1][3]} />
				<CalendarItem data={dates[1][4]} />
				<CalendarItem data={dates[1][5]} />
				<CalendarItem data={dates[1][6]} />
			</FlexWidget> : null}
			{ dates[2] ? <FlexWidget style={styles.calendarRow} >
				<CalendarItem data={dates[2][0]} />
				<CalendarItem data={dates[2][1]} />
				<CalendarItem data={dates[2][2]} />
				<CalendarItem data={dates[2][3]} />
				<CalendarItem data={dates[2][4]} />
				<CalendarItem data={dates[2][5]} />
				<CalendarItem data={dates[2][6]} />
			</FlexWidget> : null}
			{ dates[3] ? <FlexWidget style={styles.calendarRow} >
				<CalendarItem data={dates[3][0]} />
				<CalendarItem data={dates[3][1]} />
				<CalendarItem data={dates[3][2]} />
				<CalendarItem data={dates[3][3]} />
				<CalendarItem data={dates[3][4]} />
				<CalendarItem data={dates[3][5]} />
				<CalendarItem data={dates[3][6]} />
			</FlexWidget> : null}
			{ dates[4] ? <FlexWidget style={styles.calendarRow} >
				<CalendarItem data={dates[4][0]} />
				<CalendarItem data={dates[4][1]} />
				<CalendarItem data={dates[4][2]} />
				<CalendarItem data={dates[4][3]} />
				<CalendarItem data={dates[4][4]} />
				<CalendarItem data={dates[4][5]} />
				<CalendarItem data={dates[4][6]} />
			</FlexWidget> : null}
			{ dates[5] ? <FlexWidget style={styles.calendarRow} >
				<CalendarItem data={dates[5][0]} />
				<CalendarItem data={dates[5][1]} />
				<CalendarItem data={dates[5][2]} />
				<CalendarItem data={dates[5][3]} />
				<CalendarItem data={dates[5][4]} />
				<CalendarItem data={dates[5][5]} />
				<CalendarItem data={dates[5][6]} />
			</FlexWidget> : null}
		</FlexWidget>
	)
}
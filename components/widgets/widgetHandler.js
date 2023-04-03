import React from 'react';
import CalendarWidget from './CalendarWidget';

import * as Linking from "expo-linking";

const nameToWidget = {
	// Hello will be the **name** with which we will reference our widget.
	Calendar: CalendarWidget
};

export default async function widgetTaskHandler(props) {
	const widgetInfo = props.widgetInfo;
	const Widget = nameToWidget[widgetInfo.widgetName];

	switch (props.widgetAction) {
		case 'WIDGET_ADDED': {
			props.renderWidget(<Widget />);
			break;
		}

		case 'WIDGET_RESIZED': {
			// Not needed for now
			break;
		}

		case 'WIDGET_CLICK': {
			//const newUpper = props.clickAction === "upper" ? "That tickles :)" : "I WANT ATTENTION";
			//props.renderWidget(<Widget {...widgetInfo}/>)
			console.log(props.clickAction);
			console.log(props.clickActionData);
			if (props.clickAction === "LEFT" || props.clickAction === "RIGHT") {
				const currentMonth = new Date(props.clickActionData.year, props.clickActionData.month);
				if (props.clickAction === "LEFT")
					currentMonth.setMonth(currentMonth.getMonth() - 1);
				if (props.clickAction === "RIGHT")
					currentMonth.setMonth(currentMonth.getMonth() + 1);
				
				props.renderWidget(<Widget year={currentMonth.getFullYear()} month={currentMonth.getMonth()} />);
			} else if (props.clickAction === "CENTER") { 
				Linking.openURL(`com.fr75s.notorious://Tasks`);
			} else {
				if (parseInt(props.clickAction)) {
					//console.log(props.clickAction);
					Linking.openURL(`com.fr75s.notorious://Calendar?year=${props.clickActionData.year}&month=${props.clickActionData.month}&day=${parseInt(props.clickAction)}`);
				}
			}
			break;
		}

		default: {
			break;
		}
	}
}
// Header Show/Hide

const header = document.getElementById("header");

window.onscroll = () => {
	if (window.pageYOffset > 500) {
		header.classList.add("show");
	} else if (header.classList.contains("show")) {
		header.classList.remove("show");
	}
}



// Close Responsive Menus (So that no-js users have the menus open)

const headerMenus = document.getElementsByClassName("headerMenu");
for (let i = 0; i < headerMenus.length; i++) {
	headerMenus[i].classList.remove("open");
}

// Handle Header Responsive Menu

function onHeaderMenuClick(id) {
	const headerMenu = document.getElementById(id);
	if (!headerMenu.classList.contains("open")) {
		headerMenu.classList.add("open");
	} else {
		headerMenu.classList.remove("open");
	}
}



// Dark Mode

const darkOn = window.matchMedia("prefers-color-scheme: dark").matches || localStorage.getItem("darkMode") === "yes";
const switches = document.getElementsByClassName("darkSwitch");
const switchContainers = document.getElementsByClassName("darkSwitchContainer");
const darkImages = document.getElementsByClassName("dmi");

for (let i = 0; i < switchContainers.length; i++) {
	switchContainers[i].classList.remove("off");
}

function toggleDarkMode(darkModeEnabled) {
	if (darkModeEnabled) {
		for (let i = 0; i < switches.length; i++) {
			switches[i].checked = true;
		}
		for (let i = 0; i < darkImages.length; i++) {
			if (darkImages[i].classList.contains("off")) {
				darkImages[i].classList.remove("off");
			} else {
				darkImages[i].classList.add("off");
			}
		}
		document.documentElement.classList.add("dark");
		localStorage.setItem("darkMode", "yes");
	} else {
		for (let i = 0; i < switches.length; i++) {
			switches[i].checked = false;
		}
		for (let i = 0; i < darkImages.length; i++) {
			if (darkImages[i].classList.contains("off")) {
				darkImages[i].classList.remove("off");
			} else {
				darkImages[i].classList.add("off");
			}
		}
		document.documentElement.classList.remove("dark");
		localStorage.setItem("darkMode", "no");
	}
}

if (darkOn) {
	toggleDarkMode(true);
} else {
	toggleDarkMode(false);
	for (let i = 0; i < darkImages.length; i++) {
		if (darkImages[i].classList.contains("off")) {
			darkImages[i].classList.remove("off");
		} else {
			darkImages[i].classList.add("off");
		}
	}
}


// Reusable Components

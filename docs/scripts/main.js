// Header Show/Hide

const header = document.getElementById("header");

window.onscroll = () => {
	console.log(window.pageYOffset);
	if (window.pageYOffset > 500) {
		console.log("?");
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
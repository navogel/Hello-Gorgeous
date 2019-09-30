const stringId = sessionStorage.getItem("userId");
const currentUserId = parseInt(stringId);
const currentUserFriends = [];

const API = {
	saveEvent: eventObj => {
		return fetch("http://localhost:8088/events", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(eventObj)
		});
	},
	getEvents: () => {
		let currentUserId = parseInt(sessionStorage.getItem("userId"));
		return API.getFriends(currentUserId)
			.then(data => {
				data.forEach(obj => {
					currentUserFriends.push(obj.userId);
				});
			})
			.then(() => {
				let searchString = "";
				currentUserFriends.forEach(id => {
					searchString += `&userId=${id}`;
				});
				return fetch(
					`http://localhost:8088/events/?userId=${currentUserId}${searchString}&_expand=user&_sort=date&_order=asc`
				).then(response => response.json());
			});
	},
	deleteEvent: eventId => {
		return fetch(`http://localhost:8088/events/${eventId}`, {
			method: "DELETE"
		});
	},
	getEvent: eventId => {
		return fetch(`http://localhost:8088/events/${eventId}`).then(response => response.json());
	},
	editEvent: eventId => {
		const updatedObject = {
			title: document.querySelector("#eventTitle").value,
			date: document.querySelector("#eventDate").value,
			location: document.querySelector("#eventLocation").value
		};
		return fetch(`http://localhost:8088/events/${eventId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(updatedObject)
		})
			.then(res => res.json())
			.then(() => {
				document.querySelector("#eventId").value = "";
				document.querySelector("#eventTitle").value = "";
				document.querySelector("#eventDate").value = "";
				document.querySelector("#eventLocation").value = "";
			});
	},
	getFriends: (currentUserId = parseInt(sessionStorage.getItem("userId"))) => {
		currentUserFriends.length = 0;
		return fetch(
			`http://localhost:8088/friends/?friendInitiate=${currentUserId}&_expand=user`
		).then(response => response.json());
	}
};

//web component obj
const WEB = {
	myEventHTML: obj => {
		return `
		<div class="eventContainer">
				<div class="userImage">
					<img class="profileImg" src="/src/images/users/${obj.userId}.png">
				</div>
            <div class="myEvents">
                <h5>${obj.title}</h5>
                <p>Date: ${obj.date} </p>
                <p>location: ${obj.location}</p>
                <button type="button" class="edit-button" id="edit--${obj.id}">EDIT</button>
                <button type="button" class="delete-button" id="delete--${obj.id}">DELETE</button>
			</div>
			</div>
            `;
	},
	friendEventHTML: obj => {
		return `
		<div class="friendEventContainer">
            <div class="friendsEvents">
                <h5>${obj.title}</h5>
                <p>Organizer: ${obj.user.userName} </p><p>Date: ${obj.date} </p>
                <p>location: ${obj.location}</p>
			</div>
			<div class="userImage">
					<img class="profileImg" src="/src/images/users/${obj.userId}.png">
				</div>
				</div>
            `;
	}
};

//dom object
const DOM = {
	addEventsToDom(events) {
		const eventContainer = document.querySelector("#eventsOutput");
		eventContainer.innerHTML = "";
		for (let i = 0; i < events.length; i++) {
			if (events[i].userId === parseInt(sessionStorage.getItem("userId"))) {
				eventContainer.innerHTML += WEB.myEventHTML(events[i]);
			} else {
				eventContainer.innerHTML += WEB.friendEventHTML(events[i]);
			}
		}
	}
};

const eventEvents = {
	getAllEvents: () => {
		API.getEvents().then(data => DOM.addEventsToDom(data));
	},
	generateEventsOnClick: () => {
		window.addEventListener("click", event => {
			if (event.target.id === "events" && event.target.classList.contains("dropBtn")) {
				console.log("you clicked events");
				API.getEvents().then(data => DOM.addEventsToDom(data));
			}
		});
	},
	submitEditEvent: () => {
		document.querySelector("#submitEvent").addEventListener("click", event => {
			let hiddenId = document.querySelector("#eventId").value;
			if (hiddenId === "") {
				const newEvent = {
					userId: parseInt(sessionStorage.getItem("userId")),
					title: document.querySelector("#eventTitle").value,
					date: document.querySelector("#eventDate").value,
					location: document.querySelector("#eventLocation").value
				};
				if (sessionStorage.getItem("userId")) {
					API.saveEvent(newEvent).then(() => {
						API.getEvents().then(data => DOM.addEventsToDom(data));
					});
				}
				document.querySelector("#eventTitle").value = "";
				document.querySelector("#eventDate").value = "";
				document.querySelector("#eventLocation").value = "";
			} else {
				API.editEvent(hiddenId).then(() => {
					API.getEvents().then(data => DOM.addEventsToDom(data));
				});
			}
		});
	},
	deleteEvent: () => {
		document.querySelector("#eventsOutput").addEventListener("click", event => {
			if (event.target.id.startsWith("delete--")) {
				const eventToDelete = event.target.id.split("--")[1];
				API.deleteEvent(eventToDelete).then(() => {
					API.getEvents().then(data => DOM.addEventsToDom(data));
				});
			}
		});
	},
	editEvent: () => {
		document.querySelector("#eventsOutput").addEventListener("click", event => {
			if (event.target.id.startsWith("edit--")) {
				const eventToEdit = event.target.id.split("--")[1];
				API.getEvent(eventToEdit).then(data => {
					document.querySelector("#eventId").value = data.id;
					document.querySelector("#eventDate").value = data.date;
					document.querySelector("#eventTitle").value = data.title;
					document.querySelector("#eventLocation").value = data.location;
				});
			}
		});
	}
};

export default eventEvents;

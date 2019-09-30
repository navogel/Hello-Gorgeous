//task SECTION

const stringId = sessionStorage.getItem("userId");
const currentUserId = parseInt(stringId);
const currentUserFriends = [];

//API Object
const API = {
	saveTask: taskObj => {
		return fetch("http://localhost:8088/tasks", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(taskObj)
		});
	},
	getTasks: () => {
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
					`http://localhost:8088/tasks/?userId=${currentUserId}${searchString}&_sort=dueDate&_order=asc&completed=no`
				).then(response => response.json());
			});
	},
	getFinishedTasks: () => {
		let searchString = "";
		currentUserFriends.forEach(id => {
			searchString += `&userId=${id}`;
		});
		return fetch(
			`http://localhost:8088/tasks/?userId=${currentUserId}${searchString}&_sort=dueDate&_order=asc&completed=yes`
		).then(response => response.json());
	},
	deleteTask: taskId => {
		return fetch(`http://localhost:8088/tasks/${taskId}`, {
			method: "DELETE"
		});
	},
	getTask: taskId => {
		return fetch(`http://localhost:8088/tasks/${taskId}`).then(response => response.json());
	},
	editTask: taskId => {
		const updatedObject = {
			title: document.querySelector("#taskTitle").value,
			dueDate: document.querySelector("#taskDueDate").value
		};
		return fetch(`http://localhost:8088/tasks/${taskId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(updatedObject)
		})
			.then(res => res.json())
			.then(() => {
				document.querySelector("#taskId").value = "";
				document.querySelector("#taskTitle").value = "";
				document.querySelector("#taskDueDate").value = "";
			});
	},
	completeTask: taskId => {
		const updatedObject = {
			completed: document.querySelector(".taskCompleted").value
		};
		return fetch(`http://localhost:8088/tasks/${taskId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(updatedObject)
		}).then(res => res.json());
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
	myTaskHTML: obj => {
		return `
			<div class="taskContainer">
				<div class="userImage">
					<img class="profileImg" src="/src/images/users/${obj.userId}.png">
				</div>
				<div class="myTasks">
					<h5>${obj.title}</h5>
					<p>Target Date: ${obj.dueDate} </p>
					<p>completed? 	<input type="checkbox" id="taskCompleted--${obj.id}" class="taskCompleted" value="yes"></p>
					<button class="edit-button" type="button" id="edit--${obj.id}">EDIT</button>
					<button class="delete-button" type="button" id="delete--${obj.id}">DELETE</button>
				</div>
			</div>
            `;
	},
	friendTaskHTML: obj => {
		return `
			<div class="friendsTaskContainer">
				<div class="friendsTasks">
					<h5>${obj.title}</h5>
					<p>Target Date: ${obj.dueDate} </p>
					<p>completed? ${obj.completed}</p>
				</div>
				<div class="userImage">
						<img class="profileImg" src="/src/images/users/${obj.userId}.png">
				</div>
			</div>
            `;
	},
	myFinishedTaskHTML: obj => {
		return `
            <div class="myTasks">
                <h5>${obj.title}</h5>
                <p>Target Date: ${obj.dueDate} </p>
                <p>completed?: ${obj.completed}</p>
                <button type="button" class="delete-button" id="delete--${obj.id}">DELETE</button>
            </div>
            `;
	},
	friendsFinishedTaskHTML: obj => {
		return `
            <div class="friendsTasks">
                <h5>${obj.title}</h5>
                <p>Target Date: ${obj.dueDate} </p>
                <p>completed?: ${obj.completed}</p>   
            </div>
            `;
	}
};

//dom object
const DOM = {
	addTasksToDom(tasks) {
		const taskContainer = document.querySelector("#tasksOutput");
		taskContainer.innerHTML = "";
		for (let i = 0; i < tasks.length; i++) {
			if (tasks[i].userId === currentUserId) {
				taskContainer.innerHTML += WEB.myTaskHTML(tasks[i]);
			} else {
				taskContainer.innerHTML += WEB.friendTaskHTML(tasks[i]);
			}
		}
	},
	addFinishedTasksToDom(tasks) {
		const taskContainer = document.querySelector("#tasksOutput");
		taskContainer.innerHTML = "";
		for (let i = 0; i < tasks.length; i++) {
			if (tasks[i].userId === parseInt(sessionStorage.getItem("userId"))) {
				taskContainer.innerHTML += WEB.myFinishedTaskHTML(tasks[i]);
			} else {
				taskContainer.innerHTML += WEB.friendsFinishedTaskHTML(tasks[i]);
			}
		}
	}
};

const taskEvents = {
	//populate the task dom on first load
	getAllTasks: () => {
		API.getTasks().then(data => DOM.addTasksToDom(data));
	},
	generateTasksOnClick: () => {
		window.addEventListener("click", event => {
			if (event.target.id === "tasks" && event.target.classList.contains("dropBtn")) {
				console.log("you clicked tasks");
				API.getTasks().then(data => DOM.addTasksToDom(data));
			}
		});
	},
	//task Listener for Submitting/editing
	submitEditTasks: () => {
		document.querySelector("#submitTask").addEventListener("click", event => {
			let hiddenId = document.querySelector("#taskId").value;
			if (hiddenId === "") {
				let hiddenId = document.querySelector("#taskId").name;
				const newTask = {
					userId: parseInt(sessionStorage.getItem("userId")),
					title: document.querySelector("#taskTitle").value,
					dueDate: document.querySelector("#taskDueDate").value,
					completed: "no"
				};
				if (sessionStorage.getItem("userId")) {
					API.saveTask(newTask).then(() => {
						API.getTasks().then(data => DOM.addTasksToDom(data));
					});
				}
				document.querySelector("#taskTitle").value = "";
				document.querySelector("#taskDueDate").value = "";
				// document.querySelector("#taskCompleted").value = "";
			} else {
				API.editTask(hiddenId).then(() => {
					API.getTasks().then(data => DOM.addTasksToDom(data));
				});
			}
		});
	},
	//delete task
	deleteTask: () => {
		document.querySelector("#tasksOutput").addEventListener("click", event => {
			if (event.target.id.startsWith("delete--")) {
				const taskToDelete = event.target.id.split("--")[1];
				API.deleteTask(taskToDelete).then(() => {
					API.getTasks().then(data => DOM.addTasksToDom(data));
				});
			}
		});
	},
	//when edit task button is pressed, populate task info into form
	editTask: () => {
		document.querySelector("#tasksOutput").addEventListener("click", event => {
			if (event.target.id.startsWith("edit--")) {
				const taskToEdit = event.target.id.split("--")[1];
				API.getTask(taskToEdit).then(data => {
					document.querySelector("#taskId").value = data.id;
					document.querySelector("#taskDueDate").value = data.dueDate;
					document.querySelector("#taskTitle").value = data.title;
					// document.querySelector("#taskCompleted").value = data.completed;
				});
			}
		});
	},
	//mark task as completed, remove from standard task view
	taskComplete: () => {
		document.querySelector("#tasksOutput").addEventListener("click", event => {
			if (event.target.id.startsWith("taskCompleted--")) {
				const taskToEdit = event.target.id.split("--")[1];
				API.completeTask(taskToEdit).then(data => {
					API.getTasks().then(data => DOM.addTasksToDom(data));
				});
			}
		});
	},
	//view finished tasks
	finishedTasks: () => {
		document.querySelector("#finishedTasks").addEventListener("click", event => {
			API.getFinishedTasks().then(data => DOM.addFinishedTasksToDom(data));
		});
	},
	//view standard tasks
	standardTasks: () => {
		document.querySelector("#unfinishedTasks").addEventListener("click", event => {
			API.getTasks().then(data => DOM.addTasksToDom(data));
		});
	}
};

export default taskEvents;

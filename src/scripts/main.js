import friendEvents from "./friends/eventListeners"
import authorization from "./auth/eventListeners"
import eventEvents from "./events/eventListeners"
import articleEvents from "./articles/eventListeners"
import taskEvents from "./tasks/eventListeners"
import messageEvents from "./messages/eventListeners"

/*
    Import all the tools into main.js that are needed to display
    the initial UI to the user. Either the login form should appear
    or the dashboard should be rendered.
*/

authorization();

console.log(
    "main.js sessionStorage.userId: ",
    sessionStorage.getItem("userId")
);

//event event listeners

eventEvents.generateEventsOnClick();
eventEvents.submitEditEvent();
eventEvents.deleteEvent();
eventEvents.editEvent();

//article event listeners
articleEvents.generateArticlesOnClick();

articleEvents.submitEditArticles();
articleEvents.deleteArticle();
articleEvents.editArticle();

//task event listeners

taskEvents.generateTasksOnClick();
taskEvents.submitEditTasks();
taskEvents.deleteTask();
taskEvents.editTask();
taskEvents.taskComplete();
taskEvents.finishedTasks();
taskEvents.standardTasks();

//JM-Chatlog
//**********************

//Friend request hover
document.querySelector("#hover-confirm-friend").style.display = "none";
document.querySelector("#submitFriend").addEventListener("click", function(event){
    friendEvents.addToFriendsList(document.querySelector("#friendID").value, sessionStorage.getItem("userId"))
    document.querySelector("#hover-confirm-friend").style.display = "none";
})
document.querySelector("#closeFriendHover").addEventListener("click", function(event){
    document.querySelector("#hover-confirm-friend").style.display = "none";
})

const chatObject = {
  returnMessagesArray: function (fetchedArray, session) { //Returns the friend array and ID of current user
        //Populates the fetch string with multiple querys.
        const mainUserNum = parseInt(session);
        document.querySelector("#chat-room").innerHTML = ""
        let fetchString = "http://localhost:8088/messages?_expand=user&_sort=date&_order=asc"
        return fetch(fetchString)
            .then(data => data.json())
            .then(parsedData => {
                document.querySelector("#chat-room").innerHTML += "" //Clears the inner html
                parsedData.forEach(element => {
                    if (mainUserNum === element.userId) { //If the userID matches the user's post...
                        document.querySelector("#chat-room").innerHTML += // Add the edit button with the DOM
                            `
                        <div id = "message-${element.id}" class = "message">
                        <span id = "userId-${element.userId}" class = "message-name">${element.user.userName}::</span>
                        <span id = "date-${element.id}" class = "message-date">${element.date}:</span>
                        <p id = "innermessage-${element.userId}" class = "message-value">${element.message}</p>
                        <button id = "edit-${element.id}" class = "edit-button">Edit</button>
                        </div>
                    `
                    }
                    else {
                        document.querySelector("#chat-room").innerHTML +=
                            `
                            <div id = "message-${element.id}" class = "message">
                            <span id = "userId-${element.userId}" class = "message-name">${element.user.userName}::</span>
                            <span id = "date-${element.id}" class = "message-date">${element.date}:</span>
                            <p id = "innermessage-${element.id}" class = "message-value">${element.message}</p>
                            </div>
                        `
                    }
                })
                return parsedData
            })
            .then(parsedData => {
                if(sessionStorage.getItem("userId") !== ""){
                parsedData.forEach(element => {
                    document.querySelector(`#message-${element.id} > .message-name`).addEventListener("click", function(event){
                        document.querySelector("#hover-confirm-friend").style.display = "block";
                        const splitUserID = document.querySelector(`#message-${element.id} > .message-name`).id.split("-")
                        document.querySelector("#friendID").value =  splitUserID[1];
                    })
                });
                const listOfEditButtons = document.querySelectorAll(".edit-button");
                listOfEditButtons.forEach(element => {
                    element.addEventListener("click", messageEvents.setEdit)
                });
                }
            })
    }
}

//Assign Submit button

if(sessionStorage.getItem("userId") !== ""){
    document.querySelector("#submitChat").disabled = false;
}

else{
    document.querySelector("#submitChat").disabled = true;
}

document.querySelector("#submitChat").addEventListener("click", function () {

    if (document.querySelector("#message-box").value === "") {
        alert("Please enter something.");
    }

    else {

        if (document.querySelector("#message-number").value === "0") {
            messageEvents.addChat(1)
                .then(data => { chatObject.returnMessagesArray(data, 1) })
        }
        else {
            console.log(document.querySelector("#message-number").value)
            messageEvents.putEdit(1)
                .then(data => {
                    document.querySelector("#message-number").value = "0"
                    document.querySelector("#edit-message").innerText = ""
                    document.querySelector("#submitChat").innerHTML = "Submit"
                    document.querySelector("#message-box").value = ""
                    chatObject.returnMessagesArray(data, sessionStorage.getItem("userId"))

                })
        }
    }
})



//Populates the chatlog and friend list
//****************************

var friendArray = []
document.querySelector("#submitSearch").addEventListener("click", function(){
    friendEvents.friendSearch(event, sessionStorage.getItem("userId"))
})
if(sessionStorage.getItem("userId") !== ""){
    console.log(sessionStorage.getItem("userId"))
    document.querySelector("#submitSearch").disabled = false;
friendEvents.returnFriendArray(sessionStorage.getItem("userId"))
    .then(data => {
        friendArray = data;
        chatObject.returnMessagesArray(friendArray, sessionStorage.getItem("userId"));
        friendEvents.fillFriendList(friendArray);
        return friendArray;
    })
    .then(data => {
        data.forEach(element => {
            document.querySelector(`#friendCell-${element.id}`).addEventListener("click", friendEvents.friendDelete)
        });
    });
}

else{
    chatObject.returnMessagesArray(friendArray, sessionStorage.getItem("userId"));
    document.querySelector("#submitSearch").disabled = true;
}

//End of James's stuff-----------------------------

//dropdown sections
window.addEventListener("click", event => {
    if (event.target.matches(".dropBtn")) {
        //turn off when clicked if open
        if (event.target.querySelector("#myDropdown").classList.contains("show")) {
            event.target.querySelector("#myDropdown").classList.toggle("show");
        } else {
            //cycle through all dropdown elements and close anything not clicked on
            var dropdowns = document.getElementsByClassName("dropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains("show")) {
                    openDropdown.classList.remove("show");
                }
            }
            //open clicked element
            event.target.querySelector("#myDropdown").classList.toggle("show");
        }
    }
});


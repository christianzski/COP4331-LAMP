function setTheme(event, theme) {
    const html = document.documentElement;
    const selector = document.getElementById("lightSwitch");
    if(theme != undefined && theme != null) {
        html.setAttribute("data-bs-theme", theme);
        if(theme == "dark") selector.setAttribute("checked", true);
    } else {
        let theme = html.getAttribute("data-bs-theme");

        let mode = selector.checked ? "dark" : "light";

        html.setAttribute("data-bs-theme", mode);
        setCookie([["theme", mode]]);
    }
};

function setCookie(list) {
	let expiry = 30;
	let date = new Date();
	date.setTime(date.getTime() + (expiry * 60 * 1000));

    for(item in list) {
        const value = (list[item][0] + "=" + list[item][1]);
	    document.cookie = value + "; expires=" + date.toUTCString();
    }
}

function getCookie(cookie) {
    return document.cookie.split("; ").find((row) => row.startsWith(cookie + "="))?.split("=")[1];
}

function post(url, json, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
		// If response is OK (200) and operation is completed
        if(this.readyState == 4 && this.status == 200) {
            callback(xhr.responseText);
        }
    }

    xhr.send(json);
}

let followBackground = false, hoveredBackground = false, hoveredLocation = [0, 0];

window.onload = function() {
    setTheme(null, getCookie("theme"));

    if(document.getElementById("userName")) {
	searchContacts(1);
        const name = getCookie("name");
        if(name != undefined) {
            document.getElementById("userName").innerText = getCookie("name");
            document.getElementById("welcome").innerHTML += ",";
        } else window.location.href = "/login.html";
    }

    document.getElementById("lightSwitch").addEventListener("change", setTheme);

    document.getElementById("addContact")?.addEventListener("click", function(event) {
        const form = document.getElementById("create");
        if(form.style.display == "block") {
            form.style.display = "none";
            document.getElementById("caretArrow").style.transform = "";
        } else {
            form.style.display = "block";
            document.getElementById("caretArrow").style.transform = "rotate(180deg)";
        }
    });

    function hoverBackground() {
        const bg = document.getElementById("bg");
        const width = Math.max(document.documentElement.clientWidth || 0,
                               window.innerWidth || 0) / 4.0;
        const height = Math.max(document.documentElement.clientHeight || 0,
                                window.innerHeight || 0) / 4.0;

        bg.style.backgroundPositionX = (-hoveredLocation[0] / 10 - width / 2.0) + "px";
        bg.style.backgroundPositionY = (-hoveredLocation[1] / 10 - height / 2.0) + "px";
    }

    document.getElementById("bg").addEventListener("transitionend", function(event) {
        if(event.propertyName == "background-size") {
            if(hoveredBackground) {
                followBackground = true;

                document.getElementById("bg").style.transition = "background-size 250ms ease 50ms, background-position-x 50ms, background-position-y 50ms";
            } else {
                document.getElementById("bg").style.transition = "";
            }
        }
    });

    document.getElementById("bg").addEventListener("transitionrun", function(event) {
        if(event.propertyName == "background-size") {
            followBackground = false;

            if(hoveredBackground) hoverBackground();
        }
    });

    document.getElementById("bg").addEventListener("mousemove", function(event) {
        hoveredBackground = true;
        hoveredLocation = [ event.clientX, event.clientY ];

        if(followBackground) hoverBackground();
    });

    document.getElementById("bg").addEventListener("mouseenter", function(event) {
        hoveredBackground = true;
        hoveredLocation = [ event.clientX, event.clientY ];
    });

    document.getElementById("bg").addEventListener("mouseleave", function() {
        followBackground = false;
        hoveredBackground = false;
        document.getElementById("bg").style.backgroundPositionX = "";
        document.getElementById("bg").style.backgroundPositionY = "";
        document.getElementById("bg").style.transition = "";
    });

    document.getElementById("login")?.addEventListener("submit", function(event) {
	    event.preventDefault();

        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;

        let json = JSON.stringify({"login": username, "password": password});
        post("/LAMPAPI/Login.php", json, function(response) {
            let json = JSON.parse(response);

		    if(!json["error"]) {
			    // Successful login: set cookie and reload webpage
                setCookie([["login", username], ["password", password], ["id", json["id"]],
                           ["name", json["firstName"] + " " + json["lastName"]]]);
                window.location.href = "/user.html";
		    } else {
			    document.getElementById("response").style.color = "red";
		    	document.getElementById("response").innerText = "Error : " + json["error"];
		    }
        });

	    return false;
    }, true);

    document.getElementById("signup")?.addEventListener("submit", function(event) {
        event.preventDefault();

        let userLogin = document.getElementById("username").value;
        let userPass = document.getElementById("password").value;
        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;

        let json = JSON.stringify({"userLogin": userLogin, "userPass": userPass, 
                                    "firstName": firstName, "lastName": lastName});

        post("/LAMPAPI/Register.php", json, function(response) {
            let json = JSON.parse(response);

            if (!json["error"]) {
                setCookie(["userLogin", userLogin], ["userPass", userPass], ["firstName", firstName],
                            ["lastName", lastName] );
                // Relocates the first page to the login page, should it go straight to the user page?
                window.location.href = "/login.html";
            } else {
                document.getElementById("response").style.color = "red";
                document.getElementById("response").innerText = "Error : " + json["error"]
            }
            return false;
        });
    }, true);

    document.getElementById("search")?.addEventListener("input", function(event) {
        event.preventDefault();

        searchContacts(1);

        return false;
    });

    document.getElementById("create")?.addEventListener("submit", function(event) {
        event.preventDefault();

        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let phone = document.getElementById("phone").value;
        let email = document.getElementById("email").value;

        let json = JSON.stringify({"FirstName": firstName, "LastName": lastName, "Phone": phone, "Email": email});
        post("/LAMPAPI/Add.php", json, function(response) {
            let json = JSON.parse(response);

            if(!json["error"]) {
                const error = document.getElementById("error");
                error.innerText = json["Status"];
                error.style.color = "green";
                error.style.display = "block";

                document.getElementById("addContact").click();
                searchContacts(1);
            } else {
                const error = document.getElementById("error");
                error.innerText = json["error"];
                error.style.color = "red";
                error.style.display = "block";
            }
        });

        return false;
    });
}

function searchContacts(page) {
    let username = getCookie("login");
    let password = getCookie("password");
    let search = document.getElementById("search").value;

    let json = JSON.stringify({"login": username, "password": password,
                               "search": search, "page": page});
    post("/LAMPAPI/Search.php", json, function(response) {
        let json = JSON.parse(response);

        let html = "";
        html += '<tr>';
        html += '<td>First Name</td>';
        html += '<td>Last Name</td>';
        html += '<td>Phone</td>';
        html += '<td>Email</td>';
        html += '</tr>';

        if(!json["error"]) {
            for(let i = 0; i < json["results"].length && i < 9; ++i) {
                const item = json["results"][i];

                const id = item["ID"];
                const name = item["FirstName"] + " " + item["LastName"];

                let container = "<tr id = 'result-" + id + "' class = 'result' data-name = '" + name + "'>";

                container += "<td>";
                container += ('<input disabled size = "' + item["FirstName"].length + '" class = "contact-input" id = "firstName-' + id + '" type = "text" value = "' + item["FirstName"] + '"/>');
                container += "</td>";

                container += "<td>";
                container += ('<input disabled size = "' + item["LastName"].length + '" class = "contact-input" id = "lastName-' + id + '" type = "text" value = "' + item["LastName"] + '"/>');
                container += "</td>";

                container += "<td>";
                container += ('<input disabled size = "' + item["Phone"].length + '" class = "contact-input" id = "phone-' + id + '" type = "text" value = "' + item["Phone"] + '"/>');
                container += "</td>";

                container += "<td>";
                container += ('<input disabled size = "' + item["Email"].length + '" class = "contact-input" id = "email-' + id + '" type = "text" value = "' + item["Email"] + '"/>');
                container += "</td>";

                container += "</tr>";

                container += "<tr id = 'option-row-" + id + "' class = 'options'>";
                container += "<td colspan='4'>";

                container += "<div class = 'd-flex'>";

                container += "<div class = 'justify-content-around w-100' id = 'options-" + id + "' style = 'display: flex;'>";
                container += "<a href = 'javascript:editContact(" + id + ")'>Edit</a>";
                container += "<a href = 'javascript:deleteContact(" + id + ");'>Delete</a>";
                container += "</div>";

                container += "<div class = 'justify-content-around w-100' id = 'updates-" + id + "' style = 'display: none;'>";
                container += "<a href = 'javascript:editContact(" + id + ")'>Cancel</a>";
                container += "<a href = 'javascript:updateContact(" + id + ");'>Update</a>";
                container += "</div>";
                container += "</div>";
                container += "</td>";
                container += "</tr>";

                html += container;
            }

            const next_page = json["results"].length >= 10;
            const previous_page = page > 1;
            if(next_page || previous_page) {
                html += "<tr id = 'page-row'>";
                html += "<td colspan = '4'>";
                if(next_page && previous_page) html += "<div class = 'd-flex justify-content-around'>";

                if(previous_page) {
                    html += "<button id = 'previous-page' class = 'float-start btn btn-primary'>Previous Page</button>";
                }

                if(next_page) {
                    html += "<button id = 'next-page' class = 'float-end btn btn-primary'>Next Page</button>";
                    if(previous_page) html += "</div>";
                }

                html += "</td>";
                html += "</tr>";
            }
        }

        document.getElementById("results").innerHTML = html;

        document.getElementById("previous-page")?.addEventListener("click", function() {
            searchContacts(page - 1);
        });

        document.getElementById("next-page")?.addEventListener("click", function() {
            searchContacts(page + 1);
        });
    });
};

function editContact(id) {
    const tag = document.getElementById("result-" + id);
    let labels = tag.getElementsByTagName("p");
    let inputs = tag.getElementsByTagName("input");

    for(let i = 0; i < inputs.length; ++i) {
        if(inputs[i].getAttribute("disabled") == null) {
            inputs[i].setAttribute("disabled", "");

            document.getElementById("option-row-" + id).style.display = "";

            document.getElementById("options-" + id).style.display = "flex";
            document.getElementById("updates-" + id).style.display = "none";
        } else  {
            inputs[i].removeAttribute("disabled");

            document.getElementById("option-row-" + id).style.display = "table-row";

            document.getElementById("options-" + id).style.display = "none";
            document.getElementById("updates-" + id).style.display = "flex";
        }
    }
}

function deleteContact(id) {
    if(confirm("Are you sure you wish to delete this contact?")) {
        let json = JSON.stringify({"ID": id});
        post("/LAMPAPI/Delete.php", json, function(response) {
            searchContacts(1);
        });
    }
}

function updateContact(id) {
    document.getElementById("result-" + id);
    const firstName = document.getElementById("firstName-" + id).value;
    const lastName = document.getElementById("lastName-" + id).value;
    const phone = document.getElementById("phone-" + id).value;
    const email = document.getElementById("email-" + id).value;

    let json = JSON.stringify({"ID": id, "FirstName": firstName, "LastName": lastName,
                               "Phone": phone, "Email": email});

    post("/LAMPAPI/Edit.php", json, function(response) {
        let json = JSON.parse(response);

        if(!json["error"]) {
            editContact(id);
            searchContacts(1);

            const error = document.getElementById("error");
            error.innerText = json["Status"];
            error.style.color = "green";
            error.style.display = "block";

            searchContacts(1);
        } else {
            const error = document.getElementById("error");
            error.innerText = json["error"];
            error.style.color = "red";
            error.style.display = "block";
        }
    });
}

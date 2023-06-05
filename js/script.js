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

window.onload = function() {
    setTheme(null, getCookie("theme"));

    if(document.getElementById("userName")) {
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

    document.getElementById("search")?.addEventListener("input", function(event) {
        event.preventDefault();

        searchContacts();

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
                document.getElementById("addContact").click();
                searchContacts();
            }
        });

        return false;
    });
}

function searchContacts() {
    let username = getCookie("login");
    let password = getCookie("password");
    let search = document.getElementById("search").value;

    let json = JSON.stringify({"login": username, "password": password, "search": search});
    post("/LAMPAPI/Search.php", json, function(response) {
        let json = JSON.parse(response);

        let html = "";
        if(!json["error"]) {
            for(let i = 0; i < json["results"].length; ++i) {
                const item = json["results"][i];

                const id = item["ID"];
                const name = item["FirstName"] + " " + item["LastName"];

                let container = "<div id = 'result-" + id + "' class = 'result' data-name = '" + name + "'>";
                container += "<div class = 'd-flex justify-content-between'>";

                container += '<span style = "flex: 1; position: relative;">'
                container += ('<p style = "width: 100%; padding: 6px;">' + item["FirstName"] + '</p>');
                container += ('<input class = "contact-input" id = "firstName-' + id + '" style = "display: none;" type = "text" value = "' + item["FirstName"] + '"/>');
                container += '</span>';

                container += '<span style = "flex: 1; position: relative;">'
                container += ('<p style = "width: 100%; padding: 6px;">' + item["LastName"] + '</p>');
                container += ('<input class = "contact-input" id = "lastName-' + id + '" style = "display: none;" type = "text" value = "' + item["LastName"] + '"/>');
                container += '</span>';

                container += '<span style = "flex: 1; position: relative;">'
                container += ('<p style = "width: 100%; padding: 6px;">' + item["Phone"] + '</p>');
                container += ('<input class = "contact-input" id = "phone-' + id + '" style = "display: none;" type = "text" value = "' + item["Phone"] + '"/>');
                container += '</span>';

                container += '<span style = "flex: 1; position: relative;">'
                container += ('<p style = "width: 100%; padding: 6px;">' + item["Email"] + '</p>');
                container += ('<input class = "contact-input" id = "email-' + id + '" style = "display: none;" type = "text" value = "' + item["Email"] + '"/>');
                container += '</span>';

                container += "</div>";

                container += "<div class = 'options justify-content-around'>";
                container += "<span class = 'justify-content-around' id = 'options-" + id + "' style = 'display: flex;'>";
                container += "<a href = 'javascript:editContact(" + id + ")'>Edit</a>";
                container += "<a href = 'javascript:deleteContact(" + id + ");'>Delete</a>";
                container += "</span>";
                container += "</div>"

                container += "<div class = 'justify-content-around' id = 'updates-" + id + "' style = 'display: none;'>";
                container += "<a href = 'javascript:editContact(" + id + ")'>Cancel</a>";
                container += "<a href = 'javascript:updateContact(" + id + ");'>Update</a>";
                container += "</div>";

                container += "</div>";
                container += "</div>";

                html += container;
            }
        }

        document.getElementById("results").innerHTML = html;
    });
};

function editContact(id) {
    const tag = document.getElementById("result-" + id);
    let labels = tag.getElementsByTagName("p");
    let inputs = tag.getElementsByTagName("input");



    for(let i = 0; i < inputs.length; ++i) {
        if(inputs[i].style.display == "block") {
            inputs[i].style.display = "none";

            document.getElementById("options-" + id).style.display = "flex";
            document.getElementById("updates-" + id).style.display = "none";
        } else  {
            inputs[i].style.display = "block";

            document.getElementById("options-" + id).style.display = "none";
            document.getElementById("updates-" + id).style.display = "flex";
        }
    }
}

function deleteContact(id) {
    if(confirm("Are you sure you wish to delete this contact?")) {
        let json = JSON.stringify({"ID": id});
        post("/LAMPAPI/Delete.php", json, function(response) {
            searchContacts();
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

    editContact(id);

    post("/LAMPAPI/Edit.php", json, function(response) {
        searchContacts();
    });
}

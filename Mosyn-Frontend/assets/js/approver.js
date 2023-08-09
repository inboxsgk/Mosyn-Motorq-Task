function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const requestList = document.getElementById("requestList");
const popup = document.getElementById("popup");
const workflowType = document.getElementById("workflowType");
const description = document.getElementById("description");
const attachments = document.getElementById("attachments");
const logoutButton = document.getElementById("logout-button");
const closeButton = document.getElementById("closeButton");
const approveButton = document.getElementById("approve-button");
const rejectButton = document.getElementById("reject-button");
const wf_cur_token = document.getElementById("wf_token");
//Logout button - function
logoutButton.addEventListener("click", () => {
    // Redirect to the desired page
    document.cookie = "id" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "app" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "./login.html"; // Replace with your target URL
});


var requestData;
async function getRequests(){
  const e_id = getCookie('id');
  const req_url = 'http://127.0.0.1:5000/api/aprViewPendingWf?id='+e_id;
  await fetch(req_url)
  .then(response => response.json())
    .then(data => {
        requestData = data; // Store the data in the variable
        requestData.forEach(request => {
          const listItem = document.createElement("li");
          listItem.innerHTML = `
            <h2>${request.title}</h2>
            <p>${request.dt} - ${request.email}</p>
          `;
          listItem.addEventListener("click", () => {
            showPopup(request);
          });
          requestList.appendChild(listItem);
        });
        console.log(requestData);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function loadfunc(){
  getRequests();
}

window.onload = loadfunc();


function showPopup(request) {
  wf_cur_token.textContent = request.wf_token;
  workflowType.textContent = request.workflow;
  description.textContent = request.description;
  attachments.innerHTML = request.attachments.map(attachment => `<p>${attachment}</p>`).join("");
  popup.style.display = "flex";
}

approveButton.addEventListener("click" ,() => {
  const tok = wf_cur_token.innerHTML;
  const e_id = getCookie('id');
  const req_url = 'http://127.0.0.1:5000/api/aprStatusUpdateWf?id='+e_id+'&new-status=approved&wf_token='+tok;
  fetch(req_url);
});

rejectButton.addEventListener("click" ,() => {
  const tok = wf_cur_token.innerHTML;
  const e_id = getCookie('id');
  const req_url = 'http://127.0.0.1:5000/api/aprStatusUpdateWf?id='+e_id+'&new-status=rejected&wf_token='+tok;
  fetch(req_url);
});


popup.addEventListener("click", (event) => {
    popup.style.display = "none";
});

closeButton.addEventListener("click", () => {
  popup.style.display = "none";
});


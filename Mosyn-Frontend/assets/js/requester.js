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
const approval_status = document.getElementById("statusText");
const logoutButton = document.getElementById("logout-button");
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
  const req_url = 'http://127.0.0.1:5000/api/reqViewWf?id='+e_id;
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





//View status
function showPopup(request) {
  workflowType.textContent = request.workflow;
  description.textContent = request.description;
  attachments.innerHTML = request.attachments.map(attachment => `<p>${attachment}</p>`).join("");
  approval_status.textContent = request.approval_status;
  popup.style.display = "flex";
}

popup.addEventListener("click", (event) => {
  if (event.target === popup) {
    popup.style.display = "none";
  }
});
const closeButton = document.getElementById("closeButton");

closeButton.addEventListener("click", () => {
  popup.style.display = "none";
});

popup.addEventListener("click", (event) => {
  if (event.target === popup) {
    popup.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function() {
    const createButton = document.getElementById("createRequestButton");
    const popup = document.getElementById("createRequestPopup");
    const workflowDropdown = document.getElementById("workflowTypeDropdown");
    const descriptionInput = document.getElementById("descriptionInput");
    const attachmentInput = document.getElementById("attachmentInput");
    const submitButton = document.getElementById("submitButton");
  
    // Show/hide popup
    createButton.addEventListener("click", () => {
      fetchWorkflowTypes();  
      popup.style.display = "block";

    });
  
    // Handle form submission
    submitButton.addEventListener("click", () => {
        const selectedWorkflowId = workflowDropdown.value;
        const description = descriptionInput.value;
        //const attachments = attachmentInput.files;
        const attachments = " ";

        // Send data to API and handle response
        submitRequest(selectedWorkflowId, description, attachments).then(response => {
            // Handle response
            popup.style.display = "none"; // Hide popup after submission
        });
    });
    const closeButton = document.getElementById("closeButton2");

    closeButton.addEventListener("click", () => {
      popup.style.display = "none";
    });
    
    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        popup.style.display = "none";
      }
    });  
    
    //Tested-Working
    async function fetchWorkflowTypes() {
      var url = 'http://127.0.0.1:5000/api/reqFetchWfTypes'; 
      workflowDropdown.innerHTML = "";
      const response = await fetch(url)
      .then(response => response.json())
          .then(data => {
              data.forEach(workflow => {
                  const option = document.createElement("option");
                  option.textContent = workflow;
                  workflowDropdown.appendChild(option);
              });
          })
          .catch(error => {
              console.error('Error fetching data:', error);
          });
    }
});
  
  //Tested-Working
  async function submitRequest(workflowId, description, attachments) {
    const e_id = getCookie('id');
    var url = 'http://127.0.0.1:5000/api/reqNewWf?id='+e_id+'&wf-type='+workflowId+'&description='+description+'&files='+attachments; 
    const response = await fetch(url);
    return response.success;
  }
  
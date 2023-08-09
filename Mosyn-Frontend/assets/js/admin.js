document.addEventListener("DOMContentLoaded", function() {
    const createWorkflowButton = document.getElementById("createWorkflowButton");
    const viewStatisticsButton = document.getElementById("viewStatisticsButton");
    const createWorkflowPopup = document.getElementById("createWorkflowPopup");
    const viewStatisticsPopup = document.getElementById("viewStatisticsPopup");
    const createWorkflowSubmitButton = document.getElementById("createWorkflowSubmitButton");
    const workflowNameInput = document.getElementById("workflowName");
    const approversInput = document.getElementById("approvers");
    const statisticsDataElement = document.getElementById("statisticsData");
    const closeButton = document.getElementById("closeButton");
    const s_closeButton = document.getElementById("statCloseButton");
    const requestList = document.getElementById("requestList");

    const logoutButton = document.getElementById("logout-button");
    //Logout button - function
    logoutButton.addEventListener("click", () => {
        document.cookie = "id" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "app" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "./login.html"; // Replace with your target URL
    });
    
    // Show/hide create workflow popup
    createWorkflowButton.addEventListener("click", () => {
        createWorkflowPopup.style.display = "block";
    });
    
    closeButton.addEventListener("click", () => {
        createWorkflowPopup.style.display = "none";
    });

    // Show/hide view statistics popup and fetch data
    s_closeButton.addEventListener("click", () => {
        viewStatisticsPopup.style.display = "none";
    });
    viewStatisticsButton.addEventListener("click", () => {
        fetchStatisticsData().then(data => {
            statisticsDataElement.textContent = JSON.stringify(data, null, 2);
            viewStatisticsPopup.style.display = "block";
        });
    });

    // Handle submission of create workflow form
    createWorkflowSubmitButton.addEventListener("click", () => {
        const workflowName = workflowNameInput.value;
        const approvers = approversInput.value;

        // Send data to API and handle response
        createWorkflow(workflowName, approvers, description).then(response => {
            // Handle response
            createWorkflowPopup.style.display = "none";
        });
    });
});

const requestData = [
    {
      title: "Request 1",
      date: "2023-08-09",
      email: "user1@example.com",
      workflow: "Workflow A",
      description: "Description for Request 1",
      attachments: ["Attachment 1", "Attachment 2"],
    },
    {
      title: "Request 2",
      date: "2023-08-10",
      email: "user2@example.com",
      workflow: "Workflow B",
      description: "Dear sir, As I'm suffering from fever, i'm unable to come to school",
      attachments: ["Attachment 3"],
    },
    // Add more request objects as needed
  ];
  
  requestData.forEach(request => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <h2>${request.title}</h2>
      <p>${request.date} - ${request.email}</p>
    `;
    listItem.addEventListener("click", () => {
      showPopup(request);
    });
    requestList.appendChild(listItem);
  });
  
  function showPopup(request) {
    workflowType.textContent = request.workflow;
    description.textContent = request.description;
    attachments.innerHTML = request.attachments.map(attachment => `<p>${attachment}</p>`).join("");
    popup.style.display = "flex";
  }
  
  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });
  



async function fetchStatisticsData() {
    // Fetch and return statistics data from API
}

async function createWorkflow(name, approvers) {
    // Send workflow data to API and return response
}





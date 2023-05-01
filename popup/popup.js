async function showError(error) {
  console.error(error);

  // try to get users from extension storage
  const users = await getUsersFromExtensionStorage();
  // show the not latest data info
  const notLatestDataDiv = document.querySelector("#not-latest-info");
  notLatestDataDiv.style.display = "flex";
  addUsersToTable(users);
}

async function getUsersFromExtensionStorage() {
  return JSON.parse((await browser.storage.local.get("users"))["users"] || []);
}

async function addUsersToTable(users) {
  // hide and show divs based on data
  const dataDiv = document.querySelector("#data-present");
  const noDataDiv = document.querySelector("#no-data-present");
  if (users.length === 0) {
    dataDiv.style.display = "none";
    noDataDiv.style.display = "block";
    return;
  }
  dataDiv.style.display = "block";
  noDataDiv.style.display = "none";

  // check if nicknames are present in extension storage
  const nicknames =
    (await browser.storage.local.get("nicknames"))["nicknames"] || {};

  // get the tbody element of the users list table
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  // add users to the table
  users.forEach((user, index) => {
    const tr = document.createElement("tr");
    tr.className =
      "bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600";
    const tdIndex = document.createElement("td");
    tdIndex.textContent = index + 1;
    tdIndex.classList.add("p-2");
    const tdUsername = document.createElement("td");
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = nicknames[`user ${user.userIndex}`] || user.name;
    inputField.addEventListener("change", async (event) => {
      nicknames[`user ${user.userIndex}`] = event.target.value;
      console.log(nicknames);
      await browser.storage.local.set({ nicknames });
    });
    tdUsername.appendChild(inputField);
    const tdAction = document.createElement("td");
    const link = document.createElement("a");
    link.href = `https://mail.proton.me/u/${user.userIndex}/inbox`;
    link.target = "_blank";
    link.textContent = "➡️";
    link.className = "text-xl";
    tdAction.appendChild(link);
    tr.appendChild(tdIndex);
    tr.appendChild(tdUsername);
    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  });
}

function initScripts() {
  async function storeUsersInLocalStorage(users) {
    await browser.storage.local.set({ users: JSON.stringify(users) });
    addUsersToTable(users);
  }

  browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === "usersInLocalStorage") {
      await storeUsersInLocalStorage(message.data);
    }
  });

  function getActiveTab() {
    return browser.tabs.query({ active: true, currentWindow: true });
  }

  function fetchUsersListInLocalStorage(tabs) {
    browser.tabs
      .sendMessage(tabs[0].id, { command: "fetchUsersListInLocalStorage" })
      .catch(showError);
  }

  getActiveTab().then(fetchUsersListInLocalStorage).catch(showError);
}

browser.tabs
  .executeScript({ file: "/content_script.js" })
  .then(initScripts)
  .catch(showError);

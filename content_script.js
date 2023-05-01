(function () {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  const fetchUsersFromLocalStorage = () => {
    const availableUsersInLocalStorage = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("ps-")) {
        availableUsersInLocalStorage.push({
          name: key,
          userIndex: parseInt(key.replace("ps-", "")),
        });
      }
    }
    return availableUsersInLocalStorage;
  };

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "fetchUsersListInLocalStorage") {
      if (window.location.href.indexOf("account.proton.me") !== -1) {
        const usersInLocalStorage = fetchUsersFromLocalStorage();
        browser.runtime.sendMessage({
          type: "usersInLocalStorage",
          data: usersInLocalStorage,
        });
      }
    }
  });
})();

const authToken = localStorage.getItem("userdetails");
if (authToken) {
  chrome.runtime.sendMessage({ type: "SAVE_TOKEN", token: authToken });
}
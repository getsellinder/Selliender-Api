chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SAVE_TOKEN") {
    chrome.storage.local.set({ authToken: msg.token });
  }
});

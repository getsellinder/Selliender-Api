const checkBtn = document.getElementById("checkBtn");
const message = document.getElementById("message");



function decodeJWTEmail(token) {
    console.log("token",token)
  try {
    const payloadBase64 = token.split(".")[1];
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - payloadBase64.length % 4) % 4);
    const payload = JSON.parse(atob(base64));
    console.log("payload",payload)
    return payload.email || null;
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
}

function checkLinkedInProfile(tab) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        const waitForName = (timeout = 5000) => {
          return new Promise((resolve) => {
            const interval = 200;
            let elapsed = 0;

            const check = () => {
              const selectors = ["h1", "div.text-heading-xlarge"];
              for (let sel of selectors) {
                const el = document.querySelector(sel);
                if (el && el.innerText.trim()) {
                  return resolve(el.innerText.trim());
                }
              }
              elapsed += interval;
              if (elapsed >= timeout) return resolve(null);
              setTimeout(check, interval);
            };
            check();
          });
        };
        return waitForName().then((name) => {
          if (!name) return { found: false };
          return { found: true, name };
        });
      }
    },
    (results) => {
      const res = results?.[0]?.result;
      message.innerText = res.found
        ? `Profile page of ${res.name}`
        : "LinkedIn Profile Page not found";
    }
  );
}


checkBtn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
    message.innerText = "Cannot run on this page";
    return;
  }

  // 1️⃣ Get userdetails from page
  chrome.scripting.executeScript(
    { target: { tabId: tab.id }, func: () => localStorage.getItem("userdetails") },
    (results) => {
      const token = results?.[0]?.result;
      if (!token) {
        message.innerText = "No auth token found in page localStorage";
        return;
      }

      const email = decodeJWTEmail(token);
      if (!email) {
        message.innerText = "Email not found in token";
        return;
      }

      console.log("Email from token:", email);

      // 2️⃣ Now check LinkedIn profile
      checkLinkedInProfile(tab);
    }
  );
});

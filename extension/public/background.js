// 1. Create the context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "check-job-link",
    title: "Check Job Link with Sentinel",
    contexts: ["link"] // Only show when right-clicking a hyperlink
  });
});

// 2. Listen for the click event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "check-job-link") {
    const linkUrl = info.linkUrl;
    console.log("Checking link via context menu:", linkUrl);

    // 3. Send to your Node.js Backend
    fetch('http://localhost:3000/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: linkUrl }),
    })
    .then(response => response.json())
    .then(data => {
      console.log("Job added to queue:", data);
      // Optional: Show a desktop notification to the user
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/logo.png',
        title: 'Sentinel Check Started',
        message: 'We are checking that link. Open the extension to see the result!'
      });
    })
    .catch(err => console.error("Error sending to backend:", err));
  }
});
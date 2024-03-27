chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    alert(message)
    // Do something with the message
    sendResponse({ farewell: "goodbye" });
  }
);

document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    if (currentTab.url && currentTab.url.includes('instagram.com')) {
      const element = document.getElementById('goto')
      if (element) {
        element.remove();
      }
    } else {
      const element = document.getElementById('analysis')
      if (element) {
        element.remove();
      }
    }
  });

  document.getElementById('analysis').addEventListener('click', function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (currentTab.url && currentTab.url.includes('instagram.com')) {
        alert('The user is on Instagram.');
        // Perform your logic here
      } else {
        alert('The user is not on Instagram.');
      }
    });

  })
})
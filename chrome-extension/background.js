chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.startsWith('https://www.instagram.com/')) {
    const queryParameters = tab.url.split('https://www.instagram.com/')[1]

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      queryParameters: queryParameters,
    })
  }
})
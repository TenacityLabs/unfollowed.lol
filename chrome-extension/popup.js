document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    if (currentTab.url && currentTab.url.includes('instagram.com')) {
      // remove goto element from the popup
      const element = document.getElementById('goto')
      if (element) {
        element.remove();
      }

      // check if we've already fetched user data
      chrome.storage.local.get('username', function (data) {
        const storedUsername = data.username
        if (storedUsername) {
          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            function: () => {
              const profileElements = document.querySelectorAll('.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz._a6hd');
              for (const element of profileElements) {
                if (element.href && element.textContent.trim() === 'Profile') {
                  const username = element.href.match(/https:\/\/www\.instagram\.com\/([^\/]+)\//)
                  return username ? username[1] : null
                }
              }
            }
          }, (res) => {
            const username = res[0].result
            if (username === storedUsername) {
              window.location.href = 'profile.html';
            }
            // TODO, fetch info if we haven't already fetched
          })
        }
      });
    } else {
      const element = document.getElementById('analysis')
      if (element) {
        element.remove();
      }
    }
  });

  document.getElementById('analysis').addEventListener('click', function () {
    chrome.storage.local.set({ username: "TEMP" }, function () {
      window.location.href = 'profile.html';
    });
  })
})
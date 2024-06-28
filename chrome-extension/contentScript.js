// Construct the URL to the web-accessible font file
const fontUrl = chrome.runtime.getURL("assets/fonts/red-hat-text/RedHatText-VariableFont_wght.ttf");

// Create a style element with the @font-face rule
const style = document.createElement('style');
style.innerHTML = `
@font-face {
    font-family: 'Red Hat Text';
    src: url('${fontUrl}') format('truetype');
}
`;
document.head.appendChild(style);
let my_username;
document.addEventListener('DOMContentLoaded', function () {
  chrome.scripting.executeScript({
    target: { tabId: currentTab.id },
    function: async () => {
      const profileElements = document.querySelectorAll('.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz._a6hd');
      for (const element of profileElements) {
        if (element.href && element.textContent.trim() === 'Profile') {
          const username = element.href.match(/https:\/\/www\.instagram\.com\/([^\/]+)\//)[1]
          return username
        }
      }
      return { err: 'Username not found' }
    }
  }, (res) => {
    if (res[0].result.err) {
      alert('An error as occured, please try again')
      return
    }
    my_username = res[0].result
  });
});

function handleButtonClick(event, my_username) {
  event.stopPropagation();

  const username = event.target.getAttribute('data-username');
  const buttons = document.getElementsByClassName('custom-ig-button')
  const self = username === my_username
  if (buttons.length !== 1) {
    alert('Unexpected error, cannot find processing user button')
    return
  }
  const button = buttons[0]
  if (button.textContent === 'View Analytics') {
    window.location.href = `https://unfollowed.lol/user/${username}`
    return
  }
  button.disabled = true
  button.textContent = 'Processing...'

  // Send the username to the background script
  chrome.runtime.sendMessage({ username: username, self: self }, async response => {
    const postData = { ...response, username: username };
    console.log(postData)

    try {
      if (postData.private_error) {
        button.style.display = 'none'
        alert('This user is private and you are not following them. Please follow them to get analytics.')
        return
      } else if (postData.famous) {
        button.style.display = 'none'
        alert('This user is too famous for us to process. Please try a different user.')
        return
      } else if (postData.username == '' || postData.username == null) {
        button.style.display = 'none'
        alert('Sorry, an unknown error occurred, please refresh and try again.')
        return
      }

      const apiUrl = 'https://api.unfollowed.lol:8000/receive';
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!fetchResponse.ok) {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }

      const data = await fetchResponse.json();

      button.textContent = 'View Analytics'
      button.disabled = false

      console.log('Response from Django API:', data);
    } catch (error) {
      button.textContent = 'Process User'
      button.disabled = false
      console.error('Error posting data to Django:', error);
    }
  });
}


// Function to inject buttons and set up event listeners
// TODO: This should check for valid routes, also, this should only work on actual usernames, not random <h2> elements
function injectButtonsAndListeners() {
  // Remove existing buttons to prevent duplicates
  const existingBtns = document.querySelectorAll('.custom-ig-button')
  if (existingBtns.length > 0) {
    return
  }

  // Find all <h2> elements (usernames) and inject buttons
  const sectionElements = document.querySelectorAll('section')
  const settingsElements = Array.from(sectionElements).filter(section => !section.querySelector('main'))
  if (settingsElements.length === 0) {
    return
  }
  let profileElement = settingsElements[1]
  while (profileElement.firstElementChild) {
    profileElement = profileElement.firstElementChild
  }
  if (profileElement.tagName !== 'SPAN') {
    return
  }
  const username = profileElement.textContent.trim()

  settingsElements.forEach(elem => {
    const button = document.createElement('button');
    button.textContent = 'Process User';
    button.setAttribute('data-username', username); // Store the username in the button
    button.addEventListener('click', function (event) {
      handleButtonClick(event, username);
    }); // Add click event listener
    button.classList.add('custom-ig-button'); // Add a class to identify buttons added by your extension
    button.classList.add('gradient-border');

    elem.parentNode.insertBefore(button, elem.nextSibling);
  })
}

// Observe changes in the DOM
const observer = new MutationObserver((mutations) => {
  // You may want to check for specific changes; for now, we re-run the script on any DOM change
  injectButtonsAndListeners();
});

// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: true };

// Start observing the target node for configured mutations
observer.observe(document.body, config);

// Initial injection on script load
injectButtonsAndListeners()
window.onload = injectButtonsAndListeners
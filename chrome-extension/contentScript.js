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

function handleButtonClick(event) {
  event.stopPropagation();

  const username = event.target.getAttribute('data-username');
  const buttons = document.getElementsByClassName('custom-ig-button')
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
  chrome.runtime.sendMessage({ username: username }, async response => {
    const postData = { ...response, username: username };
    console.log(postData)

    try {
      // TODO: Update this to put into .env or remember to switch during production
      // TODO: Use django api
      if (postData.private_error) {
        button.style.display = 'none'
        alert('This user is private and you are not following them. Please follow them to get analytics.')
        return
      } else if (postData.famous) {
        button.style.display = 'none'
        alert('This user is too famous for us to process. Please try a different user.')
        return
      }

      const apiUrl = 'http://127.0.0.1:8000/receive';
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
  let profileElement = settingsElements[0]
  while (profileElement.firstElementChild) {
    profileElement = profileElement.firstElementChild
  }
  if (profileElement.tagName !== 'H2' && profileElement.tagName !== 'H1') {
    return
  }
  const username = profileElement.textContent.trim()

  settingsElements.forEach(elem => {
    const button = document.createElement('button');
    button.textContent = 'Process User';
    button.setAttribute('data-username', username); // Store the username in the button
    button.addEventListener('click', handleButtonClick); // Add click event listener
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
// Construct the URL to the web-accessible font file
const fontUrl = chrome.runtime.getURL("assets/fonts/red-hat-text/RedHatText-VariableFont_wght.ttf");

// Create a style element with the @font-face rule
const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
@font-face {
    font-family: 'Red Hat Text';
    src: url('${fontUrl}') format('truetype');
}
`;
document.head.appendChild(style);

chrome.runtime.sendMessage({ username: 'lucas.shen21' }, function (response) {
  console.log(response)
})


// This function will be called when the button is clicked
function handleButtonClick(event) {
  event.stopPropagation()

  const username = event.target.getAttribute('data-username');
  console.log(username)
  // Send the username to the background script
  chrome.runtime.sendMessage({ username: username }, response => {
    console.log('Response from background:', response);
  });
}

// Function to inject buttons and set up event listeners
// TODO: This should check for valid routes, also, this should only work on actual usernames, not random <h2> elements
function injectButtonsAndListeners() {
  // Remove existing buttons to prevent duplicates
  if (document.getElementsByClassName('custom-ig-button').length > 0) {
    return
  }

  document.querySelectorAll('.custom-ig-button').forEach(button => button.remove());

  // Find all <h2> elements (usernames) and inject buttons
  const usernameElements = document.querySelectorAll('h2');
  let username = ''
  usernameElements.forEach(elem => {
    if (elem.textContent !== 'Follow') {
      username = elem.textContent
    }
  })

  const settingsElements = document.querySelectorAll('.x1q0g3np .x2lah0s .x8j4wrb');
  settingsElements.forEach(elem => {
    const button = document.createElement('button');
    button.textContent = 'Process User';
    button.setAttribute('data-username', username); // Store the username in the button
    button.addEventListener('click', handleButtonClick); // Add click event listener
    button.classList.add('custom-ig-button'); // Add a class to identify buttons added by your extension
    button.classList.add('gradient-border');

    const wrapper = document.createElement('div');
    wrapper.classList.add('gradient-border-wrapper'); // Class for the gradient border effect
    wrapper.appendChild(button); // Add the button inside the wrapper

    elem.parentNode.insertBefore(wrapper, elem.nextSibling);
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
injectButtonsAndListeners();


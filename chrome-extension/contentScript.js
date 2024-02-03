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
function injectButtonsAndListeners() {
  // Remove existing buttons to prevent duplicates
  if (document.getElementsByClassName('custom-ig-button').length > 0) {
    return
  }

  document.querySelectorAll('.custom-ig-button').forEach(button => button.remove());

  // Find all <h2> elements (usernames) and inject buttons
  const usernameElements = document.querySelectorAll('h2');
  usernameElements.forEach(elem => {
    const username = elem.textContent;

    const button = document.createElement('button');
    button.textContent = 'Process User';
    button.setAttribute('data-username', username); // Store the username in the button
    button.addEventListener('click', handleButtonClick); // Add click event listener
    button.classList.add('custom-ig-button'); // Add a class to identify buttons added by your extension
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
injectButtonsAndListeners();


console.log('CONTENT')
chrome.runtime.sendMessage({ username: 'lucas.shen21' }, function (response) {
  console.log(response)
})
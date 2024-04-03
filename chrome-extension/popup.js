document.addEventListener('DOMContentLoaded', function () {
  // const text = document.querySelector('.loader-text p')
  // text.innerHTML = text.innerText.split("").map((char, i) => `<b style="transform:rotate(${i * 6.8}deg)">${char}</b>`).join("")

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    document.getElementById('analysis').addEventListener('click', async function () {
      document.getElementById('goto').className = 'hidden'
      document.getElementById('analysis').className = 'hidden'
      document.getElementById('loading').className = 'action loading'
      centerTextAnimation();

      let username;
      await getUsername().then(name => {
        username = name;
      }).catch(error => {
        console.error('Error fetching username:', error);
      });

      // Send the username to the background script
      chrome.runtime.sendMessage({ username: username }, async response => {
        const postData = { ...response, username: username };
        console.log(postData)

        try {
          // TODO: Update this to put into .env or remember to switch during production
          // TODO: Use django api

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
      
          console.log('Response from Django API:', data);
      
          fetch(`http://127.0.0.1:8000/transactions/${username}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          }).then(data => {
            const link = document.createElement('button')
            link.innerHTML = 'View full analysis'
            link.setAttribute('class', 'profile-link')
            link.setAttribute('id', 'profile-link')
            link.addEventListener('click', function() {
              window.open(`https://www.unfollowed.lol/user/${username}/`, '_blank'); 
            });
          
            if (data.total_this_week == 0 || data.total_today == 0) {
            
              document.getElementById('unfollowers').innerHTML = (Math.round(postData.unfollowers.length / postData.followings.length * 100) || 0) + '%'
              document.getElementById('fans').innerHTML = (Math.round(postData.fans.length / postData.followers.length * 100) || 0) + '%'
              document.getElementById('nodata-profile').appendChild(link)
              document.body.className = 'profile-body'
              document.getElementById('nouser').className = 'hidden'
              document.getElementById('nodata-profile').className = 'profile'
          
            } else {
            
              data.today.forEach(user => {
                const transaction = document.createElement('div')
                action = user.action.toLowerCase();
                transaction.innerHTML = `<span class="username">@${user.from_user.username}</span> ${action} you`
                transaction.setAttribute('class', 'transaction')
                document.getElementById('today').appendChild(transaction)
              });

              data.this_week.forEach(user => {
                const transaction = document.createElement('div')
                action = user.action.toLowerCase();
                transaction.innerHTML = `<span class="username">@${user.from_user.username}</span> ${action} you`
                transaction.setAttribute('class', 'transaction')
                document.getElementById('this-week').appendChild(transaction)
              });

              document.body.className = 'profile-body'
              document.getElementById('nouser').className = 'hidden'
              document.getElementById('profile').appendChild(link)
              document.getElementById('profile').className = 'profile'
            }
          }).catch(error => {
            console.error('Error fetching data:', error);
          });

        } catch (error) {
          alert(`Error fetching: ${username}`)
          console.error('Error posting data to Django:', error);
        }
      });
    })

    if (currentTab.url && currentTab.url.includes('instagram.com')) {
      // remove goto element from the popup
      document.getElementById('goto').className = 'hidden'
      document.getElementById('analysis').className = 'action action-hovering'
      document.getElementById('loading').className = 'hidden'

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
              document.body.className = 'profile-body'
              document.getElementById('nouser').className = 'hidden'
              document.getElementById('profile').className = ''
            }
            // TODO, fetch info if we haven't already fetched
          })
        }
      });
    } else {
      document.getElementById('goto').className = 'action'
      document.getElementById('analysis').className = 'hidden'
      document.getElementById('loading').className = 'hidden'
    }
  });
})

function getUsername() {
  return new Promise((resolve, reject) => {
    chrome.cookies.get({ url: 'https://www.instagram.com', name: 'ds_user_id' }, function(cookie) {
      if (cookie) {
        const ds_user_id = cookie.value;
        fetch(`https://www.instagram.com/graphql/query/?query_hash=c9100bf9110dd6361671f113dd02e7d6&variables=%7B%22user_id%22:%22${ds_user_id}%22,%22include_chaining%22:false,%22include_reel%22:true,%22include_suggested_users%22:false,%22include_logged_out_extras%22:false,%22include_highlight_reels%22:false,%22include_related_profiles%22:false%7D`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            const username = data.data.user.reel.user.username;
            resolve(username);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            reject(error);
          });
      } else {
        console.log('User not logged in.');
        reject(new Error('User not logged in.'));
      }
    });
  });
}


async function centerTextAnimation() {
  const text = "Gathering fans and searching hard for unfollowers";
  const dots = ["", ".", "..", "..."];
  let i = 0;
  const textElement = document.getElementById('center-text')
  while (document.getElementById('loading').className !== 'hidden') {
    textElement.innerHTML = text + dots[i];
    i = (i + 1) % 4;
    await sleep(250);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

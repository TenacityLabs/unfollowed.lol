document.addEventListener('DOMContentLoaded', function () {
  // const text = document.querySelector('.loader-text p')
  // text.innerHTML = text.innerText.split("").map((char, i) => `<b style="transform:rotate(${i * 6.8}deg)">${char}</b>`).join("")

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    lottie.loadAnimation({
      container: document.getElementById('loading-animation'), // the dom element that will contain the animation
      renderer: 'svg', // Render type: 'canvas', 'html' or 'svg'
      loop: true, // If set to true, the animation will loop
      autoplay: true, // If set to true, the animation will start playing automatically
      path: './assets/loading.json' // the path to the animation json
    });

    document.getElementById('analysis').addEventListener('click', function () {
      document.getElementById('goto').className = 'hidden'
      document.getElementById('analysis').className = 'hidden'
      loading = document.getElementById('loading').className = 'action'

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
        const username = res[0].result

        chrome.runtime.sendMessage({ username: username }, response => {
          if (!response || !response.followers || !response.followings || !response.unfollowers || !response.fans) {
            alert('An error as occured, please try again')
            return
          }
          const { followers, followings, unfollowers, fans } = response
          console.log({ followers, followings, unfollowers, fans })

          // FIXME, remove the temp
          // chrome.storage.local.set({ username }, function () {
          chrome.storage.local.set({ username: "TEMP", followers, followings, unfollowers, fans }, function () {
            document.documentElement.className = 'profile-html'
            document.body.className = 'profile-body'
            document.getElementById('nouser').className = 'hidden'
            document.getElementById('profile').className = ''
          })
        });
      })
    })

    if (currentTab.url && currentTab.url.includes('instagram.com')) {
      // remove goto element from the popup
      document.getElementById('goto').className = 'hidden'
      document.getElementById('analysis').className = 'action'
      loading = document.getElementById('loading').className = 'hidden'

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
              document.documentElement.className = 'profile-html'
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
      loading = document.getElementById('loading').className = 'hidden'
    }
  });
})

async function userFollowing(username) {
  let followers = [{ username: "", full_name: "" }];
  let followings = [{ username: "", full_name: "" }];
  let unfollowers = [{ username: "", full_name: "" }];
  let fans = [{ username: "", full_name: "" }];

  followers = [];
  followings = [];
  unfollowers = [];
  fans = [];

  try {
    console.log(`Process started! Give it a couple of seconds`);

    const userQueryRes = await fetch(
      `https://www.instagram.com/web/search/topsearch/?query=${username}`
    );

    let userId
    const userQueryJson = await userQueryRes.json();
    for (let foundUser of userQueryJson.users) {
      if (foundUser.user.username === username) {
        userId = foundUser.user.pk
      }
    }

    let after = null;
    let has_next = true;

    while (has_next) {
      await fetch(
        `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=` +
        encodeURIComponent(
          JSON.stringify({
            id: userId,
            include_reel: true,
            fetch_mutual: true,
            first: 50,
            after: after,
          })
        )
      )
        .then((res) => res.json())
        .then((res) => {
          has_next = res.data.user.edge_followed_by.page_info.has_next_page;
          after = res.data.user.edge_followed_by.page_info.end_cursor;
          followers = followers.concat(
            res.data.user.edge_followed_by.edges.map(({ node }) => {
              return {
                username: node.username,
                full_name: node.full_name,
              };
            })
          );
        });
    }

    console.log({ followers });

    after = null;
    has_next = true;

    while (has_next) {
      await fetch(
        `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=` +
        encodeURIComponent(
          JSON.stringify({
            id: userId,
            include_reel: true,
            fetch_mutual: true,
            first: 50,
            after: after,
          })
        )
      )
        .then((res) => res.json())
        .then((res) => {
          has_next = res.data.user.edge_follow.page_info.has_next_page;
          after = res.data.user.edge_follow.page_info.end_cursor;
          followings = followings.concat(
            res.data.user.edge_follow.edges.map(({ node }) => {
              return {
                username: node.username,
                full_name: node.full_name,
              };
            })
          );
        });
    }

    console.log({ followings });

    unfollowers = followings.filter((following) => {
      return !followers.find(
        (follower) => follower.username === following.username
      );
    });

    console.log({ unfollowers });

    fans = followers.filter((follower) => {
      return !followings.find(
        (following) => following.username === follower.username
      );
    });

    return { followers, followings, unfollowers, fans }
  } catch (err) {
    console.log({ err });
    return { err }
  }

}
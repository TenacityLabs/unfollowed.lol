// chrome.runtime.onInstalled.addListener(() => {
//   console.log('hello world')
// })


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { username } = request

  userFollowing(username)
    .then(data => {
      const { followers, followings, dontFollowMeBack, iDontFollowBack } = data
      sendResponse({ followers, followings, dontFollowMeBack, iDontFollowBack })
    })
    .catch(error => {
      console.error('Error in userFollowing:', error);
      sendResponse({ error: error.message });
    });

  return true
})

async function userFollowing(username) {
  let followers = [{ username: "", full_name: "" }];
  let followings = [{ username: "", full_name: "" }];
  let dontFollowMeBack = [{ username: "", full_name: "" }];
  let iDontFollowBack = [{ username: "", full_name: "" }];

  followers = [];
  followings = [];
  dontFollowMeBack = [];
  iDontFollowBack = [];

  try {
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

    dontFollowMeBack = followings.filter((following) => {
      return !followers.find(
        (follower) => follower.username === following.username
      );
    });

    iDontFollowBack = followers.filter((follower) => {
      return !followings.find(
        (following) => following.username === follower.username
      );
    });

    return { followers, followings, dontFollowMeBack, iDontFollowBack }
  } catch (err) {
    console.log({ err });
    return { err }
  }

}

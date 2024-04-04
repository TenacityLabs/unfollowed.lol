// chrome.runtime.onInstalled.addListener(() => {
//   console.log('hello world')
// })


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { username } = request

  userFollowing(username)
    .then(data => {
      const { followers, followings, unfollowers, fans, insta_name, avatar_url } = data
      sendResponse({ followers, followings, unfollowers, fans, insta_name, avatar_url})
    })
    .catch(error => {
      console.error('Error in userFollowing:', error)
      sendResponse({ error: error.message })
    })

  return true
})

async function userFollowing(username) {
  let followers = [{ username: "", insta_name: "", avatar_url: ""}]
  let followings = [{ username: "", insta_name: "", avatar_url: ""}]
  let unfollowers = [{ username: "", insta_name: "", avatar_url: ""}]
  let fans = [{ username: "", insta_name: "", avatar_url: ""}]

  followers = []
  followings = []
  unfollowers = []
  fans = []

  try {
    const userQueryRes = await fetch(
      `https://www.instagram.com/web/search/topsearch/?query=${username}`
    )

    let userId
    let insta_name
    let avatar_url

    const userQueryJson = await userQueryRes.json()
    for (let foundUser of userQueryJson.users) {
      if (foundUser.user.username === username) {
        userId = foundUser.user.pk
        insta_name = foundUser.user.full_name
        avatar_url = foundUser.user.profile_pic_url
      }
    }

    let after = null
    let has_next = true

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
          has_next = res.data.user.edge_followed_by.page_info.has_next_page
          after = res.data.user.edge_followed_by.page_info.end_cursor
          followers = followers.concat(
            res.data.user.edge_followed_by.edges.map(({ node }) => {
              return {
                username: node.username,
                insta_name: node.full_name,
                avatar_url: node.profile_pic_url,
              };
            })
          );
        });
    }

    after = null
    has_next = true

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
                insta_name: node.full_name,
                avatar_url: node.profile_pic_url,
              }
            })
          )
        })
    }

    unfollowers = followings.filter((following) => {
      return !followers.find(
        (follower) => follower.username === following.username
      )
    })

    fans = followers.filter((follower) => {
      return !followings.find(
        (following) => following.username === follower.username
      )
    })

    return { followers, followings, unfollowers, fans, insta_name, avatar_url}
  } catch (err) {
    console.log({ err });
    return { err }
  }

}
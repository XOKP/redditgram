import fetch from "node-fetch";
import { getGifFromGfy } from "./scrapeGif";
export async function fetchPosts(subreddit, query) {
  let baseURL = `https://www.reddit.com/r/${subreddit}.json`;

  if (query) baseURL = baseURL.concat(query);

  console.log(baseURL);
  try {
    let result = await fetch(baseURL);
    result = await result.json();

    const posts = await parsePosts(result.data);

    return {
      posts,
      before: result.data.before,
      after: result.data.after,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function parsePosts(data) {
  let posts = data.children;

  const res = Promise.all(
    posts
      .filter((post) => isValid(post.data.url))
      .map((post) => formatPost(post))
  );

  return res;
}

function isValid(url) {
  if (
    url.includes(".jpg") ||
    url.includes(".gif") ||
    url.includes(".png") ||
    url.includes(".jpeg") ||
    url.includes("gfycat")
  ) {
    return true;
  }
  return false;
}

function checkType(url) {
  if (url.includes(".jpg") || url.includes(".png")) return "IMAGE";
  else return "VIDEO";
}

async function formatPost(post) {
  return {
    type: checkType(post.data.url),
    media: await cleanUrl(post.data.url),
    thumbnail: post.data.thumbnail,
    title: post.data.title,
  };
}

async function cleanUrl(url) {
  let res;
  //Get original imgur gif
  if (url.includes("imgur")) res = url.replace("gifv", "mp4");
  //Try to get original gfycat gif
  else if (url.includes("gfycat")) {
    res = getGifFromGfy(url);
  } else res = url.replace("gifv", "gif");

  return res;
}

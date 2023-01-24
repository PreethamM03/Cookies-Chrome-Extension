//import {database} from "./datastuff.js"; 
const form = document.getElementById("control-row");
const go = document.getElementById("go");
const input = document.getElementById("input");
const outputFeedback = document.getElementById("outputFeedback");
const wc = document.getElementById("wc");
const difficulty = document.getElementById("difficulty");
const policy = document.getElementById("policy");

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      input.value = url.hostname;
    } catch {}
  }

  input.focus();
})();

form.addEventListener("submit", sub);

async function sub(event) {
  event.preventDefault();

  clearoutputFeedback();

  let url = stringToUrl(input.value);
  
  if (!url) {
    setoutputFeedback("Invalid URL");
    return;
  }
  

  let outputFeedback = await deleteURLCookies(url.hostname);
  setoutputFeedback(outputFeedback);
  let content = database(url.hostname);
  let wc = content[0];
  let difficulty = content[1];
  let policy = content[2];
  setoutputFeedback(wc);
  setoutputFeedback(difficulty);
  setoutputFeedback(policy);

}

function stringToUrl(input) {
  try {
    return new URL(input);
  } catch {}
  try {
    return new URL("http://" + input);
  } catch {}
  return null;
}

async function deleteURLCookies(domain) {
  let cookiesDeleted = 0;
  try {
    const cookies = await chrome.cookies.getAll({ domain });

    if (cookies.length === 0) {
      return "No cookies found";
    }

    let storedcookies = cookies.map(del);
    await Promise.all(storedcookies);

    cookiesDeleted = storedcookies.length;
  } catch (error) {
    return `Please try again...an error occurred.`;
  }

  return `Deleted ${cookiesDeleted} cookie(s).`;
}

function del(cookie) {
  const pre = cookie.secure ? "https:" : "http:";

  const url = `${pre}//${cookie.domain}${cookie.path}`;

  return chrome.cookies.remove({
    url: url,
    name: cookie.name,
    storeId: cookie.storeId,
  });
}

function setoutputFeedback(m) {
  outputFeedback.textContent = m;
  outputFeedback.hidden = false;
}

function clearoutputFeedback() {
  outputFeedback.hidden = true;
  outputFeedback.textContent = "";
}

/**window.sqlite3InitModule().then(function(sqlite3){
  // The module is now loaded and the sqlite3 namespace
  // object was passed to this function.
  console.log("sqlite3:", sqlite3);
});

self.sqlite3 = sqlite3;**/


/**function database(my_url) {
    
    self.sqlite3 = sqlite3;
    const db = new sqlite3.Database('Desktop/Fall2022/CS_4501/Project/cookies/release_db_sqlite');
    
    const array_of_info =  db.get("SELECT length, flesch_ease, policy_url WHERE domain=$my_url");
	
    if (err) {
	return ":/";
    }
    return array_of_info;
};

**/

function database(url) {
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'Desktop/Fall2022/CS_4501/Project/cookies/release_db.sqlite', true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = e => {
	const uInt8Array = new Uint8Array(xhr.response);
	const db = new SQL.Database(uInt8Array);
	var content = [];
	content = db.exec("SELECT length, flesch_ease, policy_url  FROM policy_snapshots WHERE domain=${url}");
	return content;
	console.log(content);
};
    xhr.send();
    
}

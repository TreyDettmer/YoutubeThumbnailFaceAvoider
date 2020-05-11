

chrome.runtime.onMessage.addListener((msg, sender) => {
  if ((msg.from === 'content') && (msg.subject === 'showPopup')) {
    //content.js is informing us that the popup should be enabled for the current webpage
    chrome.pageAction.show(sender.tab.id);
  }
});

//If the url has changed we should inform the content script.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, "url changed");
  });


});

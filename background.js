chrome.runtime.onMessage.addListener((msg, sender) => {
  // First, validate the message's structure.
  if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
    // Enable the page-action for the requesting tab.
    console.log("tabID: " + sender.tab.id)
    chrome.pageAction.show(sender.tab.id);
    console.log("sent action to " + sender.tab)
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, "url changed");
  });
   

});

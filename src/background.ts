'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'sunbirdSaverLink',
    title: 'Create content',
    contexts: [ 'selection' ]
  });

  chrome.webNavigation.onCompleted.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
      console.log(id);
      chrome.pageAction.show(id);
    });
  }, { url: [{ urlMatches: '.*' }] });
});


// On click of context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.runtime.sendMessage({'message': 'all_urls_fetched', 'data': tab.url});
});


// when a new tab is loaded with new url
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log(tab.url);
    chrome.runtime.sendMessage({'message': 'all_urls_fetched', 'data': tab.url});
  });
});
// when current tab is changed to new url
chrome.tabs.onUpdated.addListener(function (tabId , info, tab) {
  if (info.status === 'complete') {
    if (tab && tab.url) {
      console.log(tab.url);
      chrome.runtime.sendMessage({'message': 'all_urls_fetched', 'data': tab.url});
    }
  }
});


chrome.browserAction.onClicked.addListener((tab)  =>  {
  console.log('asadadadd');

  alert('icon clicked');

});

// chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
//   if (request.message === 'get_data') {
//       sendResponse({value: 'toto'});
//   } else {
//       console.log('Message unknown');
//   }
// });


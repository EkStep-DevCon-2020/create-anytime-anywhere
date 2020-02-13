'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.webNavigation.onCompleted.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
      console.log(id);
      chrome.pageAction.show(id);
    });
  }, { url: [{ urlMatches: '.*' }] });
});


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'sunbirdSaverLink',
    title: 'Create content',
    contexts: [ 'selection' ]
  });
});
// On click of context menu
chrome.contextMenus.onClicked.addListener(() => {
  console.log('Clicked');
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
      chrome.runtime.sendMessage({'message': 'all_urls_fetched', 'data': tab.url});
    }
  }
});

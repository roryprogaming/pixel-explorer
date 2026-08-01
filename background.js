chrome.runtime.onInstalled.addListener(() => {
  console.log('Pixel Explorer installed!');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveGameState') {
    chrome.storage.local.set({ gameState: request.state }, () => {
      sendResponse({ saved: true });
    });
  }
});
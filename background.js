// Event listener for extension installation
chrome.runtime.onInstalled.addListener(function() {
  // Any initialization code you want to run on extension installation
});

// Function to get Auth token
function getAuthToken(callback) {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      callback(null);
    } else {
      callback(token);
    }
  });
}

// Listen for messages from popup.js or other parts of the extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "getAuthToken") {
      getAuthToken(token => sendResponse({token: token}));
      return true; // Indicates response is asynchronous
    }
  }
);

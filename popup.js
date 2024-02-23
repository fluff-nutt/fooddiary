// Global Variables
let documentId = "1gei1VQngRGoSXw9NSEVvag01-wsIfa8b1WMdkyFjbR4"; // Replace with your Google Sheets document ID

// Request token from background script
function requestAuthToken(callback) {
  chrome.runtime.sendMessage({action: "getAuthToken"}, function(response) {
    if (response && response.token) {
      callback(response.token);
    } else {
      console.error("Unable to get auth token");
      callback(null);
    }
  });
}

// Function to add entry to Google Sheets
function addEntryToSheet(foodItem, calories) {
  requestAuthToken(function(token) {
    if (!token) return; // Handle error or absence of token

    let currentDate = new Date();
    let monthYear = `${currentDate.toLocaleString('default', { month: 'long' })}_${currentDate.getFullYear()}`;

    checkIfSheetExists(token, monthYear, function(exists) {
      if (!exists) {
        createNewSheet(token, monthYear, function() {
          appendEntry(token, monthYear, currentDate, foodItem, calories);
        });
      } else {
        appendEntry(token, monthYear, currentDate, foodItem, calories);
      }
    });
  });
}

function checkIfSheetExists(token, sheetName, callback) {
  let request = new Request(`https://sheets.googleapis.com/v4/spreadsheets/${documentId}`, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token
    }
  });

  fetch(request).then(response => response.json()).then(data => {
    let exists = data.sheets.some(sheet => sheet.properties.title === sheetName);
    callback(exists);
  }).catch(error => console.error('Error:', error));
}

function createNewSheet(token, sheetName, callback) {
  let requestBody = {
    requests: [{
      addSheet: {
        properties: {
          title: sheetName
        }
      }
    }]
  };

  let init = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  };

  let request = new Request(`https://sheets.googleapis.com/v4/spreadsheets/${documentId}:batchUpdate`, init);

  fetch(request).then(response => response.json()).then(() => {
    callback();
  }).catch(error => console.error('Error:', error));
}

function appendEntry(token, sheetName, date, foodItem, calories) {
  let day = date.getDate();
  let range = `'${sheetName}'!A${day}:C${day}`;

  let values = [
    [`${day}`, `${foodItem}`, `${calories}`]
  ];

  let init = {
    method: 'POST',
    async: true,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: values,
      range: range,
      majorDimension: "ROWS"
    })
  };

  let request = new Request(`https://sheets.googleapis.com/v4/spreadsheets/${documentId}/values/${range}:append?valueInputOption=USER_ENTERED`, init);

  fetch(request).then(response => response.json()).then(jsonResponse => {
    console.log(jsonResponse);
  }).catch(error => console.error('Error:', error));
}

// Example form submission handling
document.getElementById('entryForm').addEventListener('submit', function(e) {
  e.preventDefault();
  let foodItem = document.getElementById('foodItem').value;
  let calories = document.getElementById('calories').value;
  addEntryToSheet(foodItem, calories);
});



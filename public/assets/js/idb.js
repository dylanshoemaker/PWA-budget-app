let db;

const request = indexedDB.open('budget', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('budget', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new_budget'], 'readwrite');
  const budgetObjectStore = transaction.objectStore('new_budget');
  budgetObjectStore.add(record);
};


function uploadBudget() {

  const transaction = db.transaction(['new_budget'], 'readwrite');


  const budgetObjectStore = transaction.objectStore('new_budget');


  const getAll = budgetObjectStore.getAll();


  getAll.onsuccess = function () {

    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(['new_budget'], 'readwrite');
          const budgetObjectStore = transaction.objectStore("new_budget");
          budgetObjectStore.clear();
          alert("All transactions have been submitted!");
        })
    }
  };
}

// listen for app coming back online
window.addEventListener('online', uploadBudget);

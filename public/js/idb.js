let db;
// Connecting to "budge_it_now" DB and setting to version 1
const request = indexedDB.open("budge_it_now", 1);

// Ensure that the database changes when updated or non-existent
request.onupgradeneeded = function (event) {
  // Reference to the database
  const db = event.target.result;
  // Object store (table) called "new_transaction" with an auto-incrementing "primary key"
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

// What happens upon successful creation of a the db with object store
request.onsuccess = function (event) {
  // Save reference to the db global variable
  db = event.target.result;
  // Check if the app is online through browser navigator object
  if (navigator.onLine) {
    uploadTransaction();
  }
};

// Handles reporting any error
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// Function to handle offline submits
function saveRecord(record) {
  // Open a new transaction with the db with read/write permissions
  const transaction = db.transaction(["new_transaction"], "readwrite");
  // Access object store
  const transactionObjectStore = transaction.objectStore("new_transaction");
  // Add record to the store
  transactionObjectStore.add(record);
  // Dev alert
  alert("Transaction submitted successfully!");
}

// Function to handle uploading stored transactions
function uploadTransaction() {
  // Open a transaction and get all data
  const transaction = db.transaction(["new_transaction"], "readwrite");
  const transactionObjectStore = transaction.objectStore("new_transaction");
  const getAll = transactionObjectStore.getAll();

  // If the transaction is successful
  getAll.onsuccess = function () {
    // Check for data
    if (getAll.result.length > 0) {
      // POST request
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // Open a transaction to clear the store
          const transaction = db.transaction(["new_transaction"], "readwrite");
          const transactionObjectStore =
            transaction.objectStore("new_transaction");
          transactionObjectStore.clear();
          // Dev alert
          alert("Saved transactions submitted!");
        })
        .catch((err) => console.log(err));
    }
  };
}

window.addEventListener("online", uploadTransaction);

// your code goes here
let db;

//create an indexDB instance with this name
const request = indexedDB.open("budgettrack", 1);

//upgrade instance when version number increases
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

//if there's data, set db to the result
request.onsuccess = function (event) {
    db = event.target.result;

    // check if app is online before reading from db
    if (navigator.onLine) {
        checkDB();
    }
};

//if there's an error, show what it is
request.onerror = function (event) {
    console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}

//after coming back online, check our saved transactions and add them to the database
function checkDB() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        console.log(getAll.result)
        if (getAll.result.length > 0) {
            console.log(getAll.result)
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    // delete records if successful
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
const runCollection = [];
const runsPresent = 0;

// will handle if a user wants to drag a file over
// will handle when a user drags a file
const dropArea = document.getElementById("dropArea");
dropArea.addEventListener("dragover", function(e){
  e.preventDefault();
});

// will handle when a user drops a file
dropArea.addEventListener("drop", function(e){
  e.preventDefault();
});


// will handle loading a file into the website
const inputFile = document.getElementById("fileInput");
//inputFile.addEventListener();


// will handle when a user clicks the "Log Run" button
const enterButton = document.getElementById("enterRun"); // the button that adds a run
enterButton.addEventListener("click",addRunManually); // listens for when the button is clicked

/**
 * This method takes care of adding the run information provided from the user to the table on the page.
 * this method has several steps to add a run listed below
 * 1. save input from user
 * 2. validates input from user
 * 3. 
 * 
 */
function addRunManually() {
  // sets variables
  let table = document.getElementById("runTable"); // the table the run will be added to
  let runAdded = false;
  let runToAdd = { // the run object that will be added to the table
    distance : 0,
    time : "",
    date : new Date(),
  };

  // saves input from user
  let runDistance = document.getElementById("distanceField").value;
  let runTime = document.getElementById("timeField").value;
  let runDate = document.getElementById("dateField").value;

  // validates input via another function
  let errorFound = inputChecker(runDistance, runTime, runDate);

  // now add input to Run Object and add to the run Collection
  if (errorFound == false) {
    runToAdd.distance = runDistance;
    runToAdd.runTime = runTime;
    runToAdd.runDate = runDate;
    runCollection.push(runToAdd);
    runAdded = true;
  }

  // remove any rows in the table that are error messages before adding the run to the table
  if (runAdded == true) {
    clearErrorMessages();
  }

  // sort the global variable RunCollection via their date value
  sortCollection();

  // now add run to table
  if (errorFound == false) {
    let rowToAdd = document.createElement("tr");
    let distanceTemp = document.createElement("td");
    let timeTemp = document.createElement("td");
    let dateTemp = document.createElement("td");

    let paceTemp = document.createElement("td");
    let pace = calculatePace(runDistance, runTime);

    distanceTemp.textContent = runDistance;
    timeTemp.textContent = runTime;
    dateTemp.textContent = runDate;
    paceTemp.textContent = pace;
    rowToAdd.appendChild(dateTemp);
    rowToAdd.appendChild(distanceTemp);
    rowToAdd.appendChild(timeTemp);
    rowToAdd.appendChild(paceTemp);
    if (table.rows.length > 1 && table.rows[1].innerText.trim().includes("No runs added")) {
      table.deleteRow(1);
      table.appendChild(rowToAdd);
    }
    else {
      table.appendChild(rowToAdd);
    }

    // clear user input from text boxes
    clearInput();
      
    // increment varaibles
    ++runsPresent;
  }

}

function inputChecker(runDistance, runTime, runDate) {
  let error = false;
  let myTable = document.getElementById("runTable");
  if (runTimeVerifer(runTime) == false) {
    if (myTable.rows[1].innerText.trim().includes("No runs added yet")) {
      document.getElementById("toReplace").innerHTML = "Error, the time for the run was not properly formatted";
    }
    else {
      let tableRow = document.createElement("tr");
      let tableContent = document.createElement("td");
      tableContent.textContent = "Error, the time for the run was not properly formatted";
      tableRow.appendChild(tableContent);
      let myTable = document.getElementById("runTable");
      myTable.appendChild(tableRow);
    }
    error = true;
  }

  if (runDistance <= 0) {
    if (error == true) {
      let tableRow = document.createElement("tr");
      let tableContent = document.createElement("td");
      tableContent.textContent = "Error, Run distance is negative or 0";
      tableRow.appendChild(tableContent);
      let myTable = document.getElementById("runTable");
      myTable.appendChild(tableRow);
    }
    else {
      document.getElementById("toReplace").innerHTML = "Error, Run distance is negative or 0";
      error = true;
    }
  }

  if (runDate.length == 0) {
    if (error == true) {
      let tableRow = document.createElement("tr");
      let tableContent = document.createElement("td");
      tableContent.textContent = "Error, no date for the run was provided";
      tableRow.appendChild(tableContent);
      let myTable = document.getElementById("runTable");
      myTable.appendChild(tableRow);
    }
    else {
      document.getElementById("toReplace").innerHTML = "Error, no date for the run was provided";
      error = true;
    }
  }

  return error;
}

function runTimeVerifer(toVerify) {
  // checks if field is left empty
  if (toVerify.trim() === "") {
    return false;
  }
  
  // checks if field is not properly formatted
  let timeParts = toVerify.split(":");
  if (timeParts.length != 3) {
    return false;
  }

  // will check the hour part
  let runHour = timeParts[0];
  if (parseInt(runHour) === NaN) {
    return false;
  }
  runHour = parseInt(runHour);
  if (runHour < 0) {
    return false;
  }

  // will check the minute part
  let runMinute = timeParts[1];
  if (parseInt(runMinute) === NaN) {
    return false;
  }
  runMinute = parseInt(runMinute);
  if (runMinute < 0 || runMinute >= 60) {
    return false;
  } 

  // will check the second part
  let runSeconds = timeParts[2];
  if (parseInt(runSeconds) === NaN) {
    return false;
  }
  runSeconds = parseInt(runSeconds);
  if (runSeconds < 0 || runSeconds >= 60) {
    return false;
  }

  return true; // if code gets passed all these checks than return true
}

function sortCollection() {
  runCollection.sort( (run1, run2) => {
    let date1 = run1.date;
    let date2 = run2.date;
    if (date1 > date2) {
      return 1;
    }
  
    if (date1 < date2) {
      return -1;
    } 
  
    return 0;
  });
}

function calculatePace(distance,time) {
  let timeParts = time.split(":"); // [hour], [minutes], [seconds]
  let pace;

  // these variables will save the whole and decimal parts of the pace
  let saveWholeNum;
  let saveFractionNum;
  let finalPace = "";

  // converts strings to numbers
  let hour = Number.parseInt(timeParts[0]);
  let minute = Number.parseInt(timeParts[1]);
  let second = Number.parseInt(timeParts[2]);

  // calculate pace
  let totalMinutes = hour * 60;
  totalMinutes = totalMinutes + minute;
  totalMinutes = totalMinutes + (second/60);
  
  pace = totalMinutes / distance;
  saveWholeNum = Number.parseInt(pace);
  saveFractionNum = pace - Number.parseInt(pace);
  saveFractionNum = saveFractionNum * 60;
  
  saveFractionNum = Math.round(saveFractionNum);
  saveFractionNum = Number.parseInt(saveFractionNum);

  saveFractionNum = "" + saveFractionNum;
  if (saveFractionNum.length == 1) {
    saveFractionNum = "0" + saveFractionNum;
  }

  finalPace = saveWholeNum + "";
  finalPace = finalPace + ":" + saveFractionNum;

  return finalPace;
}

function clearErrorMessages() {
  let table = document.getElementById("runTable");
  let myTableRows = Array.from(table.rows);
    // will iterate backwards as to not skip any rows when deleting them 
    for (let i = myTableRows.length - 1; i >= 0; --i) {
      let rowHasError = false;
      myTableCells = myTableRows[i].cells;
      for (let j = 0; j < myTableCells.length; ++j) {
        if (myTableCells[j].innerText.trim().includes("Error")) {
          rowHasError = true;
          break;
        }
      }
      if (rowHasError == true) {
        table.deleteRow(i);
      }
    }
}

function clearInput() {
  document.getElementById("distanceField").value = "";
  document.getElementById("timeField").value = "";
  document.getElementById("dateField").value = "";
}


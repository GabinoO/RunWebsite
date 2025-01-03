const runCollection = []; // this collection(array) of Run Objects is from [recent date --> least recent date]
let runsPresent = 0; // keeps track of the size

// will handle if a user wants to drag a file over
const dropArea = document.getElementById("dropArea");
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

// will handle when a user drops a file
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  handleFile(e.dataTransfer.files[0]);
});


/**
 * The method will load the file that the user wants to load and will 
 * (1) handle errors if the file is not a .csv file
 * (2) add the line in the csv file to the table containing Run information
 * (3) add and sort the array of run objects
 * @param {File} file the file that the user wants to load into the website
*/
function handleFile(file) {
  let fileReader;
  let table = document.getElementById("runTable");
  // if the passed in file is not of type .csv or a plain text file
  if (file.type !== "text/csv" && file.type !== "text/plain")  {
    // if the default text in the table is there than replace it --> else, than add an error message
    if (table.rows[1].innerText.trim().includes("No runs added yet")) {
      document.getElementById("toReplace").innerHTML = "Error, file is not a .csv or .txt file";
    }
    else {
      addErrorToTable("Error, file is not a .csv or .txt file");
      return;
    }
  }

  // else --> the file is valid; time to read it in
  else {
    fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.addEventListener("load", () => {
      let arrayOfLines = fileReader.result.split("\n");
      let currLineNumber = 0;
      // each line will be: [distance, time, date(optional, will default to today's date if not provided)]
      for (let i = 0; i < arrayOfLines.length; ++i) {
        ++currLineNumber;
        // validate the line
        if (verifyCSVLine(arrayOfLines[i]) == false) {
          addErrorToTable("Error, line number " + currLineNumber + " is not valid: " + arrayOfLines[i]);
          return;
        }
        else {
          clearErrorMessages();
          if (table.rows[1].innerText.trim().includes("No runs added yet")) {
            table.deleteRow(1);
          }
          addCSVToTable(arrayOfLines[i]);
          clearInput();
          addCSVToCollection(arrayOfLines[i]);
          sortCollection();
          ++runsPresent;
        }
      }
      
    });
  }
}


// will handle when a user clicks the "Log Run" button
const enterButton = document.getElementById("enterRun"); // the button that adds a run
enterButton.addEventListener("click",addRunManually); // listens for when the button is clicked

/**
 * This method takes care of adding the run information provided from the user to the table on the page.
 * this method has several steps to add a run listed below
 * 
 * (1) validates input from user
 * (2) adds / sorts the array of run objects
 * (3) adds the run to the table
 * (4) clears the input fields
 * 
 */
function addRunManually() {
  // sets variables
  let table = document.getElementById("runTable"); // the table the run will be added to
  let runAdded = false;
  let runToAdd = { // the run object that will be added to the table
    distance : 0,
    time : "",
    pace : "",
    date : new Date(),
  };
  let wordTemp;

  // saves input from user
  let runDistance = document.getElementById("distanceField").value;
  let runTime = document.getElementById("timeField").value;
  let runDate = document.getElementById("dateField").value;

  // validates input via another function
  let errorFound = verifyUserInput(runDistance, runTime, runDate);

  // remove any rows in the table that are error messages before adding the run to the table
  if (runAdded == true) {
    clearErrorMessages();
  }

  // now add run to table
  if (errorFound == false) {
    let rowToAdd = document.createElement("tr");
    let distanceElement = document.createElement("td");
    let timeElement = document.createElement("td");
    let dateElement = document.createElement("td");

    let paceElement = document.createElement("td");
    let runPace = calculatePace(runDistance, runTime);

    distanceElement.textContent = runDistance;
    timeElement.textContent = runTime;
    dateElement.textContent = runDate;
    paceElement.textContent = runPace;
    rowToAdd.appendChild(dateElement);
    rowToAdd.appendChild(distanceElement);
    rowToAdd.appendChild(timeElement);
    rowToAdd.appendChild(paceElement);

    if (table.rows.length > 1 && table.rows[1].innerText.trim().includes("No runs added")) { // if default text is present
      table.deleteRow(1);
      table.appendChild(rowToAdd);
    }
    else {
      table.appendChild(rowToAdd);
    }

    // clear user input from text boxes
    clearInput();

    // now add input to Run Object and add to the run Collection
    if (errorFound == false) {
      runToAdd.distance = Number(runDistance);
      runToAdd.time = runTime;
      runToAdd.pace = runPace;
      runToAdd.date = new Date(dateInputFormatter(runDate));
      runCollection.push(runToAdd);
      runAdded = true;
    }

    // sort the global variable RunCollection via their date value
    sortCollection();
      
    // increment varaibles
    ++runsPresent;
  }
}


// will handle when the sortButton is clicked
const sortButton = document.getElementById("sortButton");
sortButton.addEventListener("click",sortTableRuns);

/**
 * This function sorts the runs that are inside the runTable by date
 */
function sortTableRuns() {
  clearTable("runTable");
  for (let i = 0; i < runCollection.length; ++i) {
    addRunToTable("runTable",runCollection[i]);
  }
}


const recentButton = document.getElementById("recentButton");
recentButton.addEventListener("click",showRecentRun);

/**
 * this function reveals the hidden table to showcase the most recent 10 runs in the runCollection
 */
function showRecentRun() {
  // if not runs have been added than just return
  if (runsPresent == 0) {
    return;
  }

  document.getElementById("informationTable").style.display = "table"; // makes the table visible
  document.getElementById("informationHeader").innerText = "Most Recent 10 Runs"; // adds a header to the table

  clearTable("informationTable");
  let rowsToAdd = 0;
  // will display 10 rows if there are more than 10 runs in the collection, otherwise display all runs in the collection
  if (runsPresent < 10) {
    rowsToAdd = runsPresent;
  }
  else {
    rowsToAdd = 10;
  }

  for (let i = 0; i < runsPresent; ++i) {
    addRunToTable("informationTable",runCollection[i]);
  }

}


/**
 * This method verifies that the inputs of the user are correct, if not to create a table row containing an error
 * message to the table
 * @param {Number} runDistance number representing the ditance of the run
 * @param {String} runTime string representing the time the run took
 * @param {String} runDate string representing the date of the run
 * @returns true if the user inputs are properly formatted, false otherwise
 */
function verifyUserInput(runDistance, runTime, runDate) {
  let error = false;
  let myTable = document.getElementById("runTable");
  if (verifyRunTime(runTime) == false) {
    if (myTable.rows[1].innerText.trim().includes("No runs added yet")) {
      document.getElementById("toReplace").innerHTML = "Error, the time for the run was not properly formatted";
    }
    else {
      addErrorToTable("Error, the time for the run was not properly formatted");
    }
    error = true;
  }

  if (runDistance <= 0) {
    if (error == true) {
      addErrorToTable("Error, Run distance is negative or 0");
    }
    else {
      document.getElementById("toReplace").innerHTML = "Error, Run distance is negative or 0";
      error = true;
    }
  }

  if (runDate.length == 0) {
    if (error == true) {
      addErrorToTable("Error, no date for the run was provided");
    }
    else {
      document.getElementById("toReplace").innerHTML = "Error, no date for the run was provided";
      error = true;
    }
  }

  return error;
}


/**
 * Verifies that the format that the user passed in the time text box is of format hh:mm:ss
 * @param {String} toVerify 
 * @returns true if the string representing the time is properly formatted, false otherwise
 */
function verifyRunTime(toVerify) {
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


/**
 * Will validate the line of text in a CSV File to make sure it is structured 
 * as a csv file should be and that is has the order of distance, time, (optional date)
 * @param {String} line a line in the CSV file
 * @returns true if the passed in line of the CSV file is properly formatted, false otherwise
 */
function verifyCSVLine(line) {
  let commaCount = 0;
  let lineParts;
  for (let i = 0; i < line.length; ++i) {
    if(line.charAt(i) == ",") {
      ++commaCount;
    }
  }

  // must have either 1 comma (distance, time) or 2 commas (distance,time,date)
  if (commaCount != 1 && commaCount != 2) {
    return false;
  }

  lineParts = line.split(",");
  // first test the distance
  if (Number.isInteger(lineParts[0]) == NaN) {
    return false;
  }
  // now test time
  if (!verifyRunTime(lineParts[1])) {
    return false;
  }

  // if the line does not contain the optional date field
  if (lineParts.length == 2) {
    return true;
  }

  // if the line contains the optional date field
  if (lineParts.length == 3) {
    if (verifyRunDate(lineParts[2]) == false ) {
      return false;
    }
  }

  return true; // if all tests pass, return true

}


/**
 * This function verifes that the passed in date has the following formate yyyy/mm/dd
 * @param {String} date 
 * @returns true if the date is properly formatted, false otherwise
 */
function verifyRunDate(date) {
  slashCount = 0;
  let dateParts;
  let yearPart;
  let monthPart;
  let dayPart;
  // should contain only 2 colons
  for (let i = 0; i < date.length; ++i) {
    if (date.charAt(i) == "/") {
      ++slashCount;
    }
  }
  if (slashCount != 2) {
    return false;
  }

  dateParts = date.split("/");
  // checks if the hour, minute, or seconds is a number
  if (Number.isInteger(dateParts[0].trim()) == NaN || Number.isInteger(dateParts[1].trim()) == NaN || 
    Number.isInteger(dateParts[2].trim()) == NaN) {
    return false;
  }

  // parses the strings to ints to check if they fall outside the hour and minute and seconds range
  yearPart = Number.parseInt(dateParts[0].trim());
  monthPart = Number.parseInt(dateParts[1].trim());
  dayPart = Number.parseInt(dateParts[2].trim());

  if (yearPart < 0) {
    return false;
  }

  if (monthPart < 0 || monthPart > 12) {
    return false
  }
  
  if (dayPart <= 0 || dayPart > 31) {
    return false;
  }

  return true; // if all tests pass, return true

}


/**
 * Sorts the array of run Objects based on their respective date. from [recent --> least recent]
 * @returns positive if run1 is less than run2, negative if run2 is less than run2 and 0 is both are 
 * the same date
 */
function sortCollection() {
  runCollection.sort( (run1, run2) => {
    let date1 = run1.date;
    let date2 = run2.date;
    if (date1 > date2) {
      return -1;
    }
  
    if (date1 < date2) {
      return 1;
    } 
  
    return 0;
  });
}


/**
 * This function calculates the pace of a run in minutes per mile based on the users passed in distance and time of 
 * the run
 * @param {Number} distance a number representing amount of miles
 * @param {String} time a string formatted hh:mm:ss 
 * @returns a string in mm:ss format that represents the pace of minutes per mile of a run
 */
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

  // calculate pace:
  // (1) add up total minutes of the time
  let totalMinutes = hour * 60;
  totalMinutes = totalMinutes + minute;
  totalMinutes = totalMinutes + (second/60);
  
  // (2) calculate the pace by time / distance
  pace = totalMinutes / distance;

  // (3) save the whole number and convert the decimal part to seconds
  saveWholeNum = Number.parseInt(pace);
  saveFractionNum = pace - Number.parseInt(pace);
  saveFractionNum = saveFractionNum * 60;
  
  saveFractionNum = Math.round(saveFractionNum);
  saveFractionNum = Number.parseInt(saveFractionNum);

  saveFractionNum = "" + saveFractionNum;

  // (4) adds a 0 in front of single digit number for style --> 6:2 to 6:02
  if (saveFractionNum.length == 1) {
    saveFractionNum = "0" + saveFractionNum;
  }

  finalPace = saveWholeNum + "";
  finalPace = finalPace + ":" + saveFractionNum;

  return finalPace;
}


/**
 * This method compares the pace of two runs to see which is faster than the other
 * @param {String} pace1 the pace of run1
 * @param {String} pace2 the pace of run2
 * @returns positive if pace1 is faster than pace2, negative if pace1 is slower than pace2 or 0 if both are the same
 */
function comparePace(pace1, pace2) {
  let pace1Parts = pace1.split(":");
  let pace2Parts = pace2.split(":");
  let pace1Minutes = Number(pace1Parts[0]);
  let pace2Minutes = Number(pace2Parts[0]);
  if (pace1Minutes - pace2Minutes !== 0) { // if the minutes of the pace are not the same
    return pace2Minutes-pace1Minutes; // return the difference
  }

  if (pace1Minutes - pace2Minutes == 0) { // if the paces are the same --> compare the seconds
    let pace1Seconds = Number(pace1Parts[1]);
    let pace2Seconds = Number(pace2Parts[1]);
    if (pace1Seconds - pace2Seconds !== 0) {
      return pace2Seconds - pace1Seconds;
    }
  }
  return 0; // if code makes it here than both paces are the same
}


/**
 * This method clears all rows except the headers from the specified table using the parameter that represents the id 
 * of a specific table 
 */
function clearTable(id) {
  let table = document.getElementById(id);
  let myTableRows = Array.from(table.rows);
    // will iterate backwards as to not skip any rows when deleting them 
    for (let i = myTableRows.length - 1; i > 0; --i) {
        table.deleteRow(i);
    }
}

/**
 * Clears all the rows in the table that have an error message
 */
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

/**
 * clears all the input that was typed into the text boxes for the next run to be added
 */
function clearInput() {
  document.getElementById("distanceField").value = "";
  document.getElementById("timeField").value = "";
  document.getElementById("dateField").value = "";
}


/**
 * will make a table row containing the desired message and add it to the runTable
 * @param {String} message the desired message to be added as a row in the table
 */
function addErrorToTable(message) {
  let tableRow = document.createElement("tr");
  let tableContent = document.createElement("td");
  tableContent.textContent = message;
  tableRow.appendChild(tableContent);
  let myTable = document.getElementById("runTable");
  myTable.appendChild(tableRow);
}


/**
 * This method adds the line in a csv file to the table
 * DISCLAIMER: This method is only ran after verifiers to ensure the line is properly formatted
 * @param {String} line 
 */
function addCSVToTable(line) {
  runParts = line.split(",");
  let distanceElement;
  let timeElement;
  let dateElement;
  let date;
  let paceElement;
  myTable = document.getElementById("runTable");
  tableRow = document.createElement("tr");


  // distance
  distanceElement = document.createElement("td");
  distanceElement.textContent = runParts[0];

  // time
  timeElement = document.createElement("td");
  timeElement.textContent = runParts[1];

  // pace
  paceElement = document.createElement("td");
  distanceNumber = Number(runParts[0]);
  time = runParts[1];
  paceElement.textContent = calculatePace(distanceNumber,time);

  // does not contain optional date 
  if (runParts.length == 2) {
    dateElement = document.createElement("td");
    date = new Date();
    date = formatDate(date);
    dateElement.textContent = date;
  }

  // contains optional date
  else if (runParts.length == 3) {
    dateElement = document.createElement("td");
    dateElement.textContent = runParts[2];
  }

  // put all td and tr into the table
  tableRow.appendChild(dateElement);
  tableRow.appendChild(distanceElement);
  tableRow.appendChild(timeElement);
  tableRow.appendChild(paceElement);
  myTable.appendChild(tableRow);
}


/**
 * this function adds the passed in run object as a row in the runTable
 * @param {Object} run 
 * @param {String} tableID the html id to know which table to add the row to
 */
function addRunToTable(tableID,run) {
  let table = document.getElementById(tableID);
  let rowToAdd = document.createElement("tr");
  // creates td for all properties in a Run Object
  let dateElement = document.createElement("td");
  let distanceElement = document.createElement("td");
  let timeElement = document.createElement("td");
  let paceElement = document.createElement("td");

  // add textContext to the elements from the Run Object Properties
  let formattedDate = formatDate(run.date); // formats the date first
  dateElement.textContent = formattedDate;
  distanceElement.textContent = run.distance;
  timeElement.textContent = run.time;
  paceElement.textContent = run.pace;

  rowToAdd.appendChild(dateElement);
  rowToAdd.appendChild(distanceElement);
  rowToAdd.appendChild(timeElement);
  rowToAdd.appendChild(paceElement);
  table.appendChild(rowToAdd);


}


/**
 * makes a Run Object from a line in the csv file and puts it inside the field variable RunCollection
 * @param {String} line 
 */
function addCSVToCollection(line) {
  let runParts = line.split(",");
  let runToAdd = { // the run object that will be added to the collection
    distance : 0,
    time : "",
    date : new Date(),
  };

  if (runParts.length == 2) {
    runToAdd.distance = Number(runParts[0]);
    runToAdd.time = runParts[1];
    runToAdd.pace = calculatePace(Number(runParts[0]), runParts[1]);
    runToAdd.date = new Date();
    runCollection.push(runToAdd);
  }
  else if (runParts.length == 3) {
    runToAdd.distance = Number(runParts[0]);
    runToAdd.time = runParts[1];
    runToAdd.pace = calculatePace(Number(runParts[0]), runParts[1]);
    runToAdd.date = new Date(runParts[2]);
    runCollection.push(runToAdd);
  }
}


/**
 * This function formats the date object into a string formatted yyyy/mm/dd
 * @param {Date} dateObject 
 * @returns a string formatted yyyy/mm/dd
 */
function formatDate(dateObject) {
  let toReturn = "";
  let month = dateObject.getMonth() + 1;
  toReturn = dateObject.getFullYear();
  toReturn = toReturn + "/" + month;
  toReturn = toReturn + "/" + dateObject.getDate();
  return toReturn;
}


/**
 * This function is similar to formateDate() but it takes the input when a run is manually entered that is the form
 * mm/dd/yyyy and converts it to dd/mm/yyyy. This is done so the returned formatted string can be passed into 
 * the Date Object constructor
 * @param {String} date 
 */
function dateInputFormatter(date) {
  let dateParts = date.split("-");
  return dateParts[0] + "/" + dateParts[1] + "/" + dateParts[2];
}







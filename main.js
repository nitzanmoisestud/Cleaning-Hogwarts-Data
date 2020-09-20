"use strict";
window.addEventListener("load", start);

//  Empty global students array that will be filled in prepareObjects function

let allStudents = [];
let expelledStudents = [];
let hasBeenHacked = false;
let inquisitorialSquad = [];
const houses = ["Slytherin", "Hufflepuff", "Ravenclaw", "Gryffindor"];

// Global settings for filter and sort functions

const settings = {
  filterBy: "All",
  sortBy: "firstName",
  sortDir: "asc",
  filterName: "All",
};
const sounds = {
  falling: new Audio("sounds/falling.mp3"),
  sad: new Audio("sounds/sad.mp3"),
  angry: new Audio("sounds/angry.mp3"),
};
const Student = {
  firstName: "",
  lastName: "",
  middleName: null,
  nickName: null,
  image: "",
  house: "",
  isExpelled: false,
  isMember: false,
  isPrefect: false,
  bloodStatus: "",
};

const filterInputs = document.querySelectorAll(".filter");

// Start function begins the application by calling load Json and setting up click and input evenents to filter sort and search buttons/input

function start() {
  filterInputs.forEach((input) => {
    input.addEventListener("click", selectFilter);
  });
  const sortBtns = document.querySelectorAll("[data-action='sort']");
  sortBtns.forEach((btn) => {
    btn.addEventListener("click", selectSort);
  });
  const removeBtn = modal.querySelector(".remove");
  removeBtn.addEventListener("click", handleRemove);
  const setPrefectBtn = modal.querySelector(".set-prefect");
  setPrefectBtn.addEventListener("click", handelPrefectEvent);
  const inqSquadBtn = modal.querySelector(".inq-squad");
  inqSquadBtn.addEventListener("click", handelInqSquadEvent);
  document.addEventListener("keypress", logKey);
  loadJSON();
  const searchInput = document.querySelector(".search");
  searchInput.addEventListener("input", displaySearch);
}

// Key function to start hacking by presing H key
function logKey(e) {
  if ((e.code === "KeyH") & (hasBeenHacked === false)) {
    hackTheSystem();
  }
}

// Search function

function displaySearch(event) {
  console.log(event.target.value);
  let searchedList = allStudents.filter((student) =>
    student.firstName.toLowerCase().includes(event.target.value)
  );

  displayList(searchedList);
}
function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  // sortList(sortBy, sortDir);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}
function sortList(list) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }
  let sortedList = list.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  console.log(sortedList, "in sort");

  return sortedList;
}

//  Filter functions

function selectFilter(event) {
  filterInputs.forEach((input) => {
    input.style.background = "none";
    if (input.value !== event.target.value) {
      input.checked = false;
    }
  });

  if (settings.filterBy === "All") {
    displayList(allStudents);
  }

  setFilter(event);
}
function filterList() {
  let filteredStudents = allStudents.filter((student) => {
    if (settings.filterName === "house") {
      return student.house === settings.filterBy;
    } else if (settings.filterBy === "All") {
      return allStudents;
    }
  });
  if (settings.filterBy === "Expelled") {
    filteredStudents = expelledStudents;
  }
  return filteredStudents;
}
function setFilter(event) {
  settings.filterBy = event.target.value;
  settings.filterName = event.target.name;
  buildList();
}

function loadJSON() {
  fetch("https://petlatkea.dk/2020/hogwarts/students.json")
    .then((response) => response.json())
    .then((data) => prepareObjects(data));
}

// Reciving data from fetch function

function prepareObjects(jsonData) {
  allStudents = jsonData.map(preapareObject);
  displayCounters(allStudents);
  loadBloodStatus();

  displayList(allStudents);
}

// Cleaning students object before deplaying

function preapareObject(jsonObject) {
  const student = Object.create(Student);

  const splitedNames = jsonObject.fullname.trim().split(/[-|  ]/);

  let newSplitedNames = [];
  splitedNames.forEach((name, i) => {
    const string = '"';
    let newName;
    if (name.includes(`${string}`)) {
      name.replace(/[""]/g, "");

      let cleanedName = name.replace(/[""]/g, "");
      let firstChar = cleanedName.charAt(0);
      let rest = cleanedName.substring(1, cleanedName.length);

      newName = firstChar.toUpperCase() + rest.toLowerCase();
      student.nickName = newName;
      student.middleName = null;

      newSplitedNames.push(newName);
    } else {
      let firstChar = name.charAt(0);
      let rest = name.substring(1, name.length);
      newName = firstChar.toUpperCase() + rest.toLowerCase();
      newSplitedNames.push(newName);
      if ((0 < i) & (i < splitedNames.length - 1)) {
        student.middleName = newName;
      }
    }
  });
  let cleanedHouse = jsonObject.house.trim();
  let houseFirstChar = cleanedHouse.charAt(0);
  let restOfHouse = cleanedHouse.substring(1, cleanedHouse.length);
  let newHouse = houseFirstChar.toUpperCase() + restOfHouse.toLowerCase();

  student.firstName = newSplitedNames[0];
  student.house = newHouse;
  if (newSplitedNames.length > 1) {
    student.lastName = newSplitedNames[newSplitedNames.length - 1];
  } else {
    student.lastName = null;
  }
  if ((newSplitedNames.length >= 1) & (newSplitedNames.length <= 2)) {
    student.middleName = null;
    student.nickName = null;
  }
  if ((student.middlename !== null) & !student.nickName) {
    student.nickName = null;
  }

  // creating an image name

  const lastNameForImage = newSplitedNames[
    newSplitedNames.length - 1
  ].toLowerCase();
  const firstCharForImage = newSplitedNames[0].charAt(0).toLowerCase();
  student.image = lastNameForImage.concat("_", firstCharForImage) + ".png";

  student.isExpelled = false;

  student.isMember = false;
  student.isPrefect = false;
  student.isPureBlood = false;
  student.hacker = false;
  return student;
}

// Joining filter list and sorting list together

function buildList() {
  const currentList = filterList(allStudents);

  const sortedList = sortList(currentList);

  displayList(sortedList);
}

// Displaying students

function displayList(cleanedStudents) {
  let counter = 0;

  document.querySelector(".students").innerHTML = "";
  cleanedStudents.forEach(function (student, index) {
    let template = document.querySelector("template").content;

    let aCopy = template.cloneNode(true);
    aCopy.querySelector(".firstname").textContent = student.firstName;
    if (student.lastName) {
      aCopy.querySelector(".lastname").textContent = student.lastName;
    }

    aCopy.querySelector(".house").textContent = student.house;
    //  Change unique file names for images

    let currentElement = allStudents[counter];
    for (let j = index; j < allStudents.length - 1; j++) {
      let nextElement = allStudents[j + 1];
      if (currentElement.lastName === nextElement.lastName) {
        const matchNamesImagePath =
          student.lastName.toLowerCase() +
          "_" +
          student.firstName.toLowerCase() +
          ".png";
        currentElement.image = matchNamesImagePath;
        nextElement.image = matchNamesImagePath;
      } else {
      }
    }
    counter++;
    if (student.lastName) {
      aCopy.querySelector(".image > img").src = `images/${student.image}`;
    }
    aCopy.querySelector(".student").addEventListener("click", () => {
      showModalDetails(student);
    });
    let parent = document.querySelector(".students");
    parent.appendChild(aCopy);
  });
}

//  Modal rendering and controllind appearence

const modalContent = document.querySelector(".modal-content");

function showModalDetails(student) {
  houses.forEach((theme) => {
    modalContent.classList.remove(theme);
  });
  modal.querySelector(".firstname").textContent = student.firstName;
  modal.querySelector(".lastname").textContent = student.lastName;
  if (student.middleName) {
    modal.querySelector(".middlename").textContent = student.middleName;
  }
  if (student.nickName) {
    modal.querySelector(".nickname").textContent = student.nickName;
  }
  modal.querySelector("img").src = `/images/${student.image}`;
  modal.querySelector(".house").textContent = student.house;
  if (student.isPureBlood) {
    modal.querySelector(".blood-status").textContent = "Pure Blood";
  } else {
    modal.querySelector(".blood-status").textContent = "Half Blood";
  }
  if (student.isExpelled) {
    modal.querySelector(".expelled").textContent = "Expelled";
  } else {
    modal.querySelector(".expelled").textContent = "Not expelled";
  }
  if (student.isPrefect) {
    modal.querySelector(".prefect").textContent = "Yes";
  } else {
    modal.querySelector(".prefect").textContent = "No";
  }
  if (student.isMember) {
    modal.querySelector(".member").textContent = "Yes";
  } else {
    modal.querySelector(".member").textContent = "No";
  }
  modal.querySelector(".details").classList.add(`${student.firstName}`);

  const removeBtn = modal.querySelector(".remove");
  removeBtn.dataset.studentName = student.firstName;
  const prefectBtn = modal.querySelector(".set-prefect");
  prefectBtn.dataset.studentName = student.firstName;
  const inqBtn = modal.querySelector(".inq-squad");
  inqBtn.dataset.studentName = student.firstName;

  modalContent.classList.add(student.house);
  modal.classList.remove("hide");
}

const modal = document.querySelector(".modal-background");
const exitBtn = document.querySelector(".exit");

exitBtn.addEventListener("click", closeModal);
function closeModal() {
  modal.classList.add("hide");
}

//  Counting numbers of students for each filter group

function displayCounters(data) {
  document.querySelector(".all-number").textContent = allStudents.length;
  houses.forEach((house) => {
    document.querySelector(
      `.${house}-number`
    ).textContent = countHousesStudents(data, house);
  });

  document.querySelector(".Expelled-number").textContent =
    expelledStudents.length;
}

function countHousesStudents(students, house) {
  let houseArray = students.filter((student) => {
    return student.house === house;
  });
  return houseArray.length;
}

// Fetching blood status data

function loadBloodStatus() {
  fetch("https://petlatkea.dk/2020/hogwarts/families.json")
    .then((response) => response.json())
    .then((data) => cleanBloodList(data));
}
function cleanBloodList(data) {
  allStudents.forEach((student) => {
    if (
      data.half.includes(student.lastName) &
      data.pure.includes(student.lastName)
    ) {
      data.half.splice(data.half.indexOf(student.lastName), 1);
    }
  });
  setBloodStatus(data);
}
function setBloodStatus(list) {
  allStudents.forEach((student) => {
    if (list.half.includes(student.lastName)) {
      student.isPureBlood = false;
    } else {
      student.isPureBlood = true;
    }
  });
}

// Expelled students functions

function handleRemove(event) {
  let studentName = event.target.dataset.studentName;
  removeStudent(studentName);
}

function removeStudent(studentName) {
  const studentObj = getStudent(studentName);
  if (studentObj.hacker === true) {
    sendHackerMessage();
  } else {
    document
      .querySelector(`.modal-background`)
      .classList.add("expel-animation");

    removeStudentFromList(studentName);
  }
}
function sendHackerMessage() {
  sounds.angry.play();
  prompt("What are you doing? hacker cannot be expelled!");
  displayList(allStudents);
  displayCounters(allStudents);
  closeModal();
}
function removeStudentFromList(studentName) {
  sounds.sad.play();
  allStudents = allStudents.filter((student) => {
    if ((student.firstName === studentName) & !student.hacker) {
      student.isExpelled = true;
      expelledStudents.push(student);
    }

    return student.firstName !== studentName;
  });
  setTimeout(() => {
    displayList(allStudents);
    displayCounters(allStudents);
    closeModal();
    document
      .querySelector(`.modal-background`)
      .classList.remove("expel-animation");
  }, 3000);
}

// Set prefects functions

function handelPrefectEvent(event) {
  let studentName = event.target.dataset.studentName;
  let studetnObj = getStudent(studentName);
  checkIfStudentPrefect(studetnObj);
}
function checkIfStudentPrefect(studetnObj) {
  if (studetnObj.isPrefect) {
    removePrefect(studetnObj);
  } else {
    checkPrefectsList(studetnObj);
  }
}

function getStudent(studentName) {
  let student = allStudents.filter(
    (student) => student.firstName === studentName
  );

  student = student.pop();
  return student;
}

function checkPrefectsList(studetnObj) {
  const prefects = allStudents.filter((student) => student.isPrefect);
  let counter = 0;
  prefects.forEach((prefect) => {
    if (prefect.house === studetnObj.house) {
      counter++;
      console.log(counter, prefect);
    } else {
      setPrefect(studetnObj);
    }
  });
  console.log(counter);

  if (counter < 2) {
    setPrefect(studetnObj);
  } else {
    console.log("more than two tudent are prefects", counter);
    prompt(
      "Only two students from each house can be selected prefects. Remove other prefect from the same house first"
    );
  }
}

function setPrefect(studentObj) {
  allStudents.forEach((student) => {
    if (studentObj.firstName === student.firstName) {
      console.log(student);
      student.isPrefect = true;
    }
  });
  displayList(allStudents);
  closeModal();
  showModalDetails(studentObj);
}

function removePrefect(studentObj) {
  allStudents.forEach((student) => {
    if (studentObj.firstName === student.firstName) {
      console.log(student);
      student.isPrefect = false;
    }
  });
  displayList(allStudents);
  closeModal();
  showModalDetails(studentObj);
}
// Add/Remove member to InqSquad and check blood status

function handelInqSquadEvent(event) {
  const studentName = event.target.dataset.studentName;
  let studentObj = getStudent(studentName);
  checkMember(studentObj);
}
function checkMember(studentObj) {
  if (studentObj.isMember) {
    removeFromInqSquad(studentObj);
  } else {
    checkBlooStatus(studentObj);
  }
}

function checkBlooStatus(studentObj) {
  if (studentObj.isPureBlood || studentObj.house === "Slytherin") {
    addToInqSquad(studentObj);
  } else {
    prompt("Student can't join the Inquisitorial Squad");
  }
}

function addToInqSquad(studentObj) {
  if (hasBeenHacked) {
    setTimeout(removeFromInqSquad, 2000, studentObj);
  }
  allStudents.forEach((student) => {
    if (studentObj.firstName === student.firstName) {
      console.log(student);
      student.isMember = true;
      inquisitorialSquad.push(student);
    }
  });
  displayList(allStudents);
  closeModal();
  showModalDetails(studentObj);
}

function removeFromInqSquad(studentObj) {
  allStudents.forEach((student) => {
    if (studentObj.firstName === student.firstName) {
      student.isMember = false;
      inquisitorialSquad = inquisitorialSquad.filter((el) => {
        el === studentObj;
      });
    }
  });
  displayList(allStudents);
  prompt(`${studentObj.firstName} has been removed from the Inquisitorial Squad
`);
  closeModal();
  showModalDetails(studentObj);
}

// Hacking

function hackTheSystem() {
  const mySelf = createHackerObj();
  hasBeenHacked = true;
  makeHackingAnimation();
  allStudents.unshift(mySelf);
  displayList(allStudents);
  mixBloodStatus();
}
function createHackerObj() {
  const mySelf = Object.create(Student);
  mySelf.lastName = "Moise";
  mySelf.firstName = "Nitzan";
  mySelf.image = "hacker.jpg";
  mySelf.house = "Gryffindor";
  mySelf.isExpelled = false;
  mySelf.isMember = false;
  mySelf.isPrefect = false;
  mySelf.isPureBlood = true;
  mySelf.hacker = true;

  return mySelf;
}
function makeHackingAnimation() {
  prompt("System is hacked!!!");
  sounds.falling.play();
  document.querySelector("body").classList.add("hacked");
  setTimeout(() => {
    document.querySelector("body").classList.remove("hacked");
  }, 6000);
}
function mixBloodStatus() {
  const bloodStatuses = [true, false];

  allStudents.forEach((student) => {
    if (student.isPureBlood & !student.hacker) {
      student.isPureBlood = bloodStatuses[Math.floor(Math.random() * 2)];
    } else {
      student.isPureBlood = true;
    }
  });
}

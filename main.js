"use strict";
window.addEventListener("load", start);

//  Empty global students array that will be filled in prepareObjects function

let allStudents = [];
let expelledStudents = [];
let notExpelledStudents = [];
// Global settings for filter and sort functions

const settings = {
  filterBy: "All",
  sortBy: "firstName",
  sortDir: "asc",
  filterName: "All",
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
  loadJSON();
  const searchInput = document.querySelector(".search");
  searchInput.addEventListener("input", displaySearch);
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
    // loadJSON();
    displayList(allStudents);
  }

  setFilter(event);
}
function filterList() {
  let filteredStudents = allStudents.filter((student) => {
    if (settings.filterName === "house") {
      return student.house === settings.filterBy;
    } else if (settings.filterBy === "All") {
      return student;
    }
  });
  if (settings.filterBy === "Expelled") {
    filteredStudents = expelledStudents;
  } else if (settings.filterBy === "Not-expelled") {
    filteredStudents = notExpelledStudents;
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
  console.log(jsonData);

  allStudents = jsonData.map(preapareObject);
  notExpelledStudents = allStudents;
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

  // creating an image name

  const lastNameForImage = (student.lastName = newSplitedNames[
    newSplitedNames.length - 1
  ].toLowerCase());
  const firstCharForImage = newSplitedNames[0].charAt(0).toLowerCase();
  student.image = lastNameForImage.concat("_", firstCharForImage) + ".png";

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

  student.isExpelled = false;

  student.isMember = false;
  student.isPrefect = false;
  student.isPureBlood = false;
  return student;
}

// Joining filter list and sorting list together

function buildList(event) {
  const currentList = filterList(allStudents);

  const sortedList = sortList(currentList);

  displayList(sortedList);
}

// Displaying students

function displayList(cleanedStudents) {
  document.querySelector(".students").innerHTML = "";
  cleanedStudents.forEach(function (student) {
    let template = document.querySelector("template").content;

    let aCopy = template.cloneNode(true);
    aCopy.querySelector(".firstname").textContent = student.firstName;
    if (student.lastName) {
      aCopy.querySelector(".lastname").textContent = student.lastName;
    }

    aCopy.querySelector(".house").textContent = student.house;
    aCopy.querySelector(".image > img").src = `/images/${student.image}`;

    aCopy.querySelector(".student").addEventListener("click", () => {
      console.log("click", student);

      showModalDetails(student);
    });
    let parent = document.querySelector(".students");
    parent.appendChild(aCopy);
  });
}

//  Modal rendering and controllind appearence

const modalContent = document.querySelector(".modal-content");
const themes = ["Slytherin", "Hufflepuff", "Ravenclaw", "Gryffindor"];

function showModalDetails(student) {
  themes.forEach((theme) => {
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
  const removeBtn = modal.querySelector(".remove");
  removeBtn.id = student.firstName;

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
  document.querySelector(".all-number").textContent = countAllStudents();
  document.querySelector(
    ".Slytherin-number"
  ).textContent = countSlytherinStudents(data);
  document.querySelector(
    ".Ravenclaw-number"
  ).textContent = countRavenclawStudents(data);
  document.querySelector(
    ".Hufflepuff-number"
  ).textContent = countHufflepuffStudents(data);
  document.querySelector(
    ".Gryffindor-number"
  ).textContent = countGryffindorStudents(data);
  document.querySelector(
    ".Expelled-number"
  ).textContent = countExpelledStudents();
  document.querySelector(
    ".Not-expelled-number"
  ).textContent = countNotExpelledStudents();
}
function countAllStudents() {
  return allStudents.length;
}
function countSlytherinStudents(students) {
  let counter = 0;

  students.forEach((student) => {
    if (student.house === "Slytherin") {
      counter++;
    }
  });

  return counter;
}
function countRavenclawStudents(students) {
  let counter = 0;

  students.forEach((student) => {
    if (student.house === "Ravenclaw") {
      counter++;
    }
  });

  return counter;
}
function countHufflepuffStudents(students) {
  let counter = 0;

  students.forEach((student) => {
    if (student.house === "Hufflepuff") {
      counter++;
    }
  });

  return counter;
}
function countGryffindorStudents(students) {
  let counter = 0;

  students.forEach((student) => {
    if (student.house === "Gryffindor") {
      counter++;
    }
  });

  return counter;
}
function countExpelledStudents() {
  return expelledStudents.length;
}
function countNotExpelledStudents() {
  return notExpelledStudents.length;
}

// Frtching blood status data

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
  console.log(event.target.id);
  let studentName = event.target.id;
  removeStudent(studentName);
}

function removeStudent(studentName) {
  console.log(allStudents.length);

  notExpelledStudents = allStudents.filter((student) => {
    if (student.firstName === studentName) {
      student.isExpelled = true;
      expelledStudents.push(student);
    }
    return student.firstName !== studentName;
  });
  // displayList(allStudents);
  displayCounters(allStudents);
  closeModal();
  console.log(notExpelledStudents);
}

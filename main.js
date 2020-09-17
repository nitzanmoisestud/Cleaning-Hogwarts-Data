"use strict";
window.addEventListener("load", start);

let allStudents = [];

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
function start() {
  filterInputs.forEach((input) => {
    input.addEventListener("click", selectFilter);
  });
  const sortBtns = document.querySelectorAll("[data-action='sort']");
  sortBtns.forEach((btn) => {
    btn.addEventListener("click", selectSort);
  });
  loadJSON();
  const searchInput = document.querySelector(".search");
  searchInput.addEventListener("input", displaySearch);
}

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

function selectFilter(event) {
  filterInputs.forEach((input) => {
    input.style.background = "none";
    if (input.value !== event.target.value) {
      input.checked = false;
    }
  });

  if (settings.filterBy === "All") {
    loadJSON();
  }

  setFilter(event);
}
function filterList() {
  let filteredStudents = allStudents.filter((student) => {
    if (settings.filterName === "house") {
      return student.house === settings.filterBy;
    } else if (settings.filterName === "Expelled") {
      if (settings.filterBy === "Expelled") {
        return student.expelled;
      } else {
        return !student.expelled;
      }
    } else {
      return student;
    }
  });

  // displayList(filteredStudents);
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
    .then((student) => prepareObjects(student));
}

function prepareObjects(jsonData) {
  allStudents = jsonData.map(preapareObject);
  displayCounters(allStudents);

  displayList(allStudents);
}

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

  return student;
}

function buildList(event) {
  const currentList = filterList(allStudents);

  const sortedList = sortList(currentList);

  displayList(sortedList);
}

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
  modal.querySelector(".blood-status").textContent = student.bloodStatus;
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

  modalContent.classList.add(student.house);
  modal.classList.remove("hide");
}

const modal = document.querySelector(".modal-background");
const exitBtn = document.querySelector(".exit");

exitBtn.addEventListener("click", () => {
  modal.classList.add("hide");
});

function displayCounters(data) {
  document.querySelector(".all-number").textContent = countAllStudents(data);
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
  ).textContent = countExpelledStudents(data, true);
  document.querySelector(
    ".Not-expelled-number"
  ).textContent = countExpelledStudents(data, false);
}
function countAllStudents(students) {
  let counter = 0;
  for (let index = 0; index < students.length; index++) {
    counter++;
  }

  return counter;
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
function countExpelledStudents(students, isExpelled) {
  let counter = 0;

  students.forEach((student) => {
    if (student.isExpelled === isExpelled) {
      counter++;
    }
  });

  return counter;
}

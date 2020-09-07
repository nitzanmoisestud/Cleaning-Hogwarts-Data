"use strict";
window.addEventListener("load", init);

const allStudents = [];

function init() {
  fetch("https://petlatkea.dk/2020/hogwarts/students.json")
    .then((response) => response.json())
    .then((data) => cleanData(data));
}

function cleanData(jsonData) {
  const Student = {
    firstName: "",
    lastName: "",
    middleName: null,
    nickName: null,
    image: "",
    house: "",
  };
  jsonData.forEach((jsonObject) => {
    let newStudent = Object.create(Student);
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
        newStudent.nickName = newName;
        newStudent.middleName = null;

        newSplitedNames.push(newName);
      } else {
        let firstChar = name.charAt(0);
        let rest = name.substring(1, name.length);
        newName = firstChar.toUpperCase() + rest.toLowerCase();
        newSplitedNames.push(newName);
        if ((0 < i) & (i < splitedNames.length - 1)) {
          newStudent.middleName = newName;
        }
      }
    });
    let cleanedHouse = jsonObject.house.trim();
    let houseFirstChar = cleanedHouse.charAt(0);
    let restOfHouse = cleanedHouse.substring(1, cleanedHouse.length);
    let newHouse = houseFirstChar.toUpperCase() + restOfHouse.toLowerCase();

    // creating an image name

    const lastNameForImage = (newStudent.lastName = newSplitedNames[
      newSplitedNames.length - 1
    ].toLowerCase());
    const firstCharForImage = newSplitedNames[0].charAt(0).toLowerCase();
    newStudent.image = lastNameForImage.concat("_", firstCharForImage) + ".png";

    newStudent.name = newSplitedNames[0];
    newStudent.house = newHouse;
    if (newSplitedNames.length > 1) {
      newStudent.lastName = newSplitedNames[newSplitedNames.length - 1];
    } else {
      newStudent.lastName = null;
    }
    if ((newSplitedNames.length >= 1) & (newSplitedNames.length <= 2)) {
      newStudent.middleName = null;
      newStudent.nickName = null;
    }
    if (newStudent.middlename !== null) {
      newStudent.nickName = null;
    }

    allStudents.push(newStudent);
  });

  displayList(allStudents);
}

function displayList(allStudents) {
  console.table(allStudents);
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, get, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://we-are-the-champions-6b0ec-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementListInDB = ref(database, "endorsementList");


const endorsementInput = document.getElementById("endorsement-desc");
const endorsementFrom = document.getElementById("endorsement-from");
const endorsementTo = document.getElementById("endorsement-to");
const publishBtn = document.getElementById("publish-btn");
const endorsementList = document.getElementById("endorsement-list");
let refKeys = [];

get(endorsementListInDB)
  .then((snapshot) => {
    if (snapshot.exists()) {
      refKeys = Object.keys(snapshot.val());
    }
  })
  .catch((error) => {
    console.error('Error retireving data', error);
  });



publishBtn.addEventListener("click", function () {

  let inputValue = endorsementInput.value;
  let inputFrom = endorsementFrom.value;
  let inputTo = endorsementTo.value;

  const inputObj = {

    from: inputFrom,
    value: inputValue,
    to: inputTo,
    image: 'heart',
    likes: 0
  }

  refKeys.push(push(endorsementListInDB, inputObj).key);

  clearInputFields();

});


function clearInputFields() {

  endorsementInput.value = "";
  endorsementFrom.value = "";
  endorsementTo.value = "";
}

function clearEndorsementList() {

  endorsementList.innerHTML = "";

}

onValue(endorsementListInDB, function (snapshot) {

  if (snapshot.exists()) {

    let endorsementListArray = Object.entries(snapshot.val());
    clearInputFields();
    clearEndorsementList();
    for (let listItem of endorsementListArray) {
      appendItemToList(listItem[1]);
    }
  }
});

function appendItemToList(listObj) {


  endorsementList.innerHTML +=
    ` 
      <li>
        <p class="to-endorsement">To ${listObj.to}</p>
        <p class="endorsement-msg">${listObj.value}</p>
        <div class="footer">
          <p class="from-endorsement">From ${listObj.from}</p>
          <div class="hearts">
            <img id='likes' src="assets/${listObj.image}.png">
            <p id='like-count'>${listObj.likes}</p>
          </div>
        </div>
      </li>
    `

}

document.addEventListener("click", function (e) {

  const targetEl = e.target.closest('#likes');

  if (targetEl) {
    const listItemNumber = Array.from(endorsementList.children).indexOf(targetEl.parentNode.parentNode.parentNode);
    const itemRef = ref(database, `endorsementList/${refKeys[listItemNumber]}`);

    get(itemRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const inputObj = snapshot.val();
          updateUIAndDB(inputObj, itemRef);
        }
      })
      .catch((error) => {
        console.error('Error retireving data', error);
      });


  }

});

function updateUIAndDB(inputObj, itemRef) {

  if (!inputObj.likes) {
    inputObj.image = 'heart-liked';
    inputObj.likes = 1;
  } else {

    inputObj.image = 'heart';
    inputObj.likes = 0;
  }

  update(itemRef, inputObj)
    .then(() => {

      console.log("update succesfull")
    })
    .catch((error) => {
      console.error("Error updating", error);
    })


}

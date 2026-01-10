import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ---------- FIREBASE ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyDCBD2gVIg9v-KqYaMFZeu_grgs3yKYfPs",
  authDomain: "fir-chat-f8d55.firebaseapp.com",
  projectId: "fir-chat-f8d55",
  storageBucket: "fir-chat-f8d55.appspot.com",
  messagingSenderId: "792896094694",
  appId: "1:792896094694:web:dd373e5d7d2fc9ae1d5627"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------- DOM ---------- */
const authBox = document.getElementById("auth");
const appBox = document.getElementById("app");
const chatList = document.getElementById("chatList");
const menu = document.getElementById("menu");

/* ---------- STATE ---------- */
let currentUser = null;
let currentProfile = null;

/* ---------- AUTH ---------- */
window.login = async ()=>{
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try{
    await signInWithEmailAndPassword(auth,email,password);
  }catch{
    const res = await createUserWithEmailAndPassword(auth,email,password);
    await createProfile(res.user);
  }
};

onAuthStateChanged(auth, async user=>{
  if(!user) return;
  currentUser = user;
  authBox.style.display="none";
  appBox.style.display="flex";
  await loadProfile();
  loadContacts();
});

/* ---------- PROFILE ---------- */
async function createProfile(user){
  const username = user.email.split("@")[0];
  const userId = username.slice(0,4).toUpperCase()+"-"+Math.floor(10000+Math.random()*90000);

  await setDoc(doc(db,"users",user.uid),{
    username,
    userId
  });
}

async function loadProfile(){
  const snap = await getDoc(doc(db,"users",currentUser.uid));
  currentProfile = snap.data();
}

/* ---------- CONTACTS ---------- */
function loadContacts(){
  const ref = collection(db,"contacts",currentUser.uid,"list");
  onSnapshot(ref,snap=>{
    chatList.innerHTML="";
    snap.forEach(d=>{
      const c = d.data();
      const div = document.createElement("div");
      div.className="chat";
      div.innerHTML = `
        <div class="avatar">${(c.name||c.userId)[0]}</div>
        <div class="name">${c.name||c.userId}</div>
      `;
      chatList.appendChild(div);
    });
  });
}

/* ---------- SEARCH ---------- */
window.searchContacts = txt=>{
  document.querySelectorAll(".chat").forEach(c=>{
    c.style.display = c.innerText.toLowerCase().includes(txt.toLowerCase())
      ? "flex" : "none";
  });
};

/* ---------- MENU ---------- */
window.toggleMenu = e=>{
  menu.style.display = menu.style.display==="flex" ? "none" : "flex";
};

window.addContact = async ()=>{
  const uid = prompt("Enter User ID");
  if(!uid) return;
  await addDoc(collection(db,"contacts",currentUser.uid,"list"),{
    userId: uid
  });
};

window.showUserId = ()=>{
  alert("Your User ID:\n"+currentProfile.userId);
};

window.newGroup = ()=>alert("New group (coming soon)");
window.settings = ()=>alert("Settings (coming soon)");

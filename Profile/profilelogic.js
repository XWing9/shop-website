let userData = null;

window.onload = async function() {
    // Get user ID from localStorage
    const userId = parseInt(localStorage.getItem("userId"))

    if (!userId) {
        // Redirect to login page if no user ID is found
        window.location.href = "/login.html";
        console.log("user not found")
    } else {
        // Load the user data from the JSON file using the userId
        const response = await fetch("/get-user-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        userData = await response.json();

        if (response.ok) {
            generateMainProfile(userData)
            generateFriends(userData)
            generateSettings(userData)
        } else {
            alert(userData.error);
        }
    }
};

function goHome() {
    toggleDisplay("mainProfileBlock", true);
    toggleDisplay("mainProfileInfo", true);
    toggleDisplay("friendsProfileBlock", false);
    toggleDisplay("friendsProfileInfo", false);
    toggleDisplay("settingsProfileBlock",false)
    toggleDisplay("settingsProfileInfo",false)
}

function goToFriends() {
    toggleDisplay("mainProfileBlock", false);
    toggleDisplay("mainProfileInfo", false);
    toggleDisplay("friendsProfileBlock", true);
    toggleDisplay("friendsProfileInfo", true);
    toggleDisplay("settingsProfileBlock",false)
    toggleDisplay("settingsProfileInfo",false)
}

function goToSettings(){
    toggleDisplay("mainProfileBlock", false);
    toggleDisplay("mainProfileInfo", false);
    toggleDisplay("friendsProfileBlock", false);
    toggleDisplay("friendsProfileInfo", false);
    toggleDisplay("settingsProfileBlock",true)
    toggleDisplay("settingsProfileInfo",true)
}

function toggleDisplay(id, show) {
    document.getElementById(id).style.display = show ? "block" : "none";
}

function generateMainProfile(userData){
    
    document.getElementById("headerran").textContent = userData.username;

    //user info
    document.getElementById("currentCurency").innerHTML = `Current currency: ${userData.currency}€`;

    document.getElementById("gamescontainer").innerHTML = ""
    loadOwnedGames(userData.ownedGames);

    document.getElementById("wischlistcontainer").innerHTML = ""
    loadWischlist(userData.wishlist)
}

async function loadOwnedGames(ownedGames) {
    try{
        const response = await fetch("/getGameInfo")

        if (!response.ok) {
            throw new Error("Failed to fetch game data");
        }
        
        const gameData = await response.json();

        console.log(gameData)
        const ownedGamesContainer = document.getElementById("imagesOfOwnedGames")
        ownedGamesContainer.innerHTML = generateOwnedGamesContainer(gameData,ownedGames)

    }catch(error){
        console.log(error)
    }
}

function generateOwnedGamesContainer(gameData,ownedGames){
    return ownedGames.map(gameName =>{

        const game = gameData.find(g => g.name === gameName);

        if (!game) return "";

        return `
            <img src="${game.image}" alt="${game.name}" class="game-image">
        `
    }).join("");
}

function loadWischlist(wishlist) {
    const wischlistdiv = document.getElementById("wischlistcontainer");
    wischlistdiv.innerHTML = ""; // optional: clear old content

    wishlist.forEach(item => {
        wischlistdiv.innerHTML += `
            <div class="wishlist-item">${item}</div>
        `;
    });
}

async function generateFriends(userData){
    const friendslist = document.getElementById("friendslist")
    friendslist.innerHTML = ""
    userData.friends.forEach(name =>{
        friendslist.innerHTML += `
            ${name}
        `
    })

    const currentfriendsrequests = document.getElementById("friendrequestsbody")
    currentfriendsrequests.innerHTML = ""
    //adden von pendelden user requests

    const otherusers = document.getElementById("otherusersbody")
    otherusers.innerHTML = ""
    //fetch um alle user zu holen und zu displayen mit basic info dazu
}

function generateSettings(userData){

}

function updateCurrency() {
    const username = localStorage.getItem("user")
    const amount = parseInt(document.getElementById("amount").value);

    fetch("/update-currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, amount })
    })
    .then(response => response.text()).then(console.log)
    .then(data => {
        window.location.reload()
    })
    .catch(error => console.error("Error:", error));
    
}

function clearstorage(){
    localStorage.clear()
}

async function logout(){
    try{
        const response = await fetch("/logout", {
            method: "POST"
        })

        const data = await response.json()

        window.location.href = "../Main.html";
    }catch(error){
        console.error("error:", error)
    }
}

function toggleMinWidth() {
    const profileSlider = document.querySelector(".profileslider");
    const arrowturn = document.querySelector(".sidebarArrow")

    arrowturn.classList.toggle("rotate")
    // Toggle min-width between 0vw and 5vw
    if (profileSlider.style.minWidth === "4vw") {
        profileSlider.style.minWidth = "0vw"; // Collapse
    } else {
        profileSlider.style.minWidth = "4vw"; // Expand
    }
}
window.onload = async function () {
    console.log("Successfully loaded");

    const savedScrollY = sessionStorage.getItem('scrollY');
    
    try {

        const userRes = await fetch("/currentuser");
        const userCheck = await userRes.json();

        let userData = null;

        //doing something when user is not logged in
        if (userCheck.loggedIn) {
            const userDataRes = await fetch("/get-user-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userCheck.user.id })
            });
            userData = await userDataRes.json();
        } else {
            console.log("User not logged in");
        }

        const response = await fetch("/getGameInfo");  // No need for POST or headers

        if (!response.ok) {
            throw new Error("Failed to fetch game data");
        }

        const data = await response.json();

        console.log("Successfully fetched data:", data);

        const gameList = document.getElementById("gamecards");
        gameList.innerHTML = generateHtml(data,userData)
        
        const shopInfo = document.getElementById("shopInfo")
        shopInfo.innerHTML = generateShopInfo(userData)

        if (savedScrollY !== null) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollY));
                sessionStorage.removeItem('scrollY');
            }, 50); // small delay ensures rendering
        }

    } catch (error) {
        console.error("Error fetching game data:", error);
    }
};

function generateHtml(data,userData) {
    console.log("Fetched userData:", userData);
    return data.map(game =>{
        const ownsGame = userData?.ownedGames?.includes(game.name);
        const onWishlist = userData?.wishlist?.includes(game.name);
        return `
            <div class="gamecard">
                <div class="gamepicture">
                    <img src = "${game.image}" class = "gameimage"/>
                </div>
                <div class="gameinfo">
                    <h4 class ="GameTitel">${game.name}</h4>

                    <p>${game.description}</p>

                    <strong>${game.price}</strong> 
                    
                    ${
                        !ownsGame 
                            ? `
                                <button onclick="buygame('${game.name}','${game.price}')" id="gamebuying" class="Button" data-game="${game.name}">BUY!</button>
                                ${
                                    !onWishlist
                                        ? `<button onclick="addgametowischlist('${game.name}')" id="gamebuying" class="Button2" data-game="${game.name}">Put on wishlist!</button>`
                                        : `<em class = "statetext">Already on wishlist</em>`
                                }
                            `
                            : `<em class = "statetext">Already owned</em>`
                    }
                    <div class="extraGameInfo">
                        <button onclick="generateExtraGameInfo('${game.name}','${game.size}','${game.genre}','${game.average_playtime}','${game.release_date}')" id="moreGameInfo" class="moreinfobutton" data-game="${game.name}">
                            ExtraInfo <span class="arrow">▲</span>
                        </button>
                    </div>

                    
                </div>
                <div class="extra-info-content" id="extra-info-${game.name}" style="display:none;">
                        <!-- Extra game details will be inserted here dynamically -->
                </div>
            </div>
        `;
    }).join("");
}

async function generateExtraGameInfo(gameName,gameSize, gameGenre, gamePlaytime, gameRealeasedate) {
    console.log(gameName,gameSize,gameGenre,gamePlaytime,gameRealeasedate);

    const button = event.target;
    button.classList.toggle('open'); // For rotating the arrow

    const infocontainer = document.getElementById(`extra-info-${gameName}`)

    if (infocontainer.style.display === "none" || infocontainer.style.display === "") {
        infocontainer.style.display = "block";
        infocontainer.innerHTML = `
            <p>Size: ${gameSize}</p>
            <p>Genre: ${gameGenre}</p>
            <p>Average Playtime: ${gamePlaytime}</p>
            <p>Release Date: ${gameRealeasedate}</p>
        `; 
    }else {
        infocontainer.style.display = "none"
    } 
}

function generateShopInfo(user){
    if (!user) return `<p>Not logged in</p>`;

    return `
        <div>
            <p>Current user: <strong>${user.username}</strong></p>
            <p>Current currncy: <strong>${user.currency}€</strong></p>
            <a href="../Main.html">Home</a>
        </div>
    `;
}

async function buygame(gameName, gamePrice) {
    gamePrice = parseFloat(gamePrice.replace("€", "").trim())
    try {
        const userRes = await fetch("/currentuser");
        const userCheck = await userRes.json();

        if (!userCheck.loggedIn) {
            sessionStorage.setItem("redirectFrom", "shop");
            window.location.href = "../login.html";
            return;
        }

        const userDataRes = await fetch("/get-user-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userCheck.user.id })
        });

        const userData = await userDataRes.json();

        console.log("according data:", userData.currency, gamePrice)

        if (userData.currency >= gamePrice) {
            const response = await fetch("/buyinggame", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userCheck.user.id,
                    gameName,
                    gamePrice
                })
            });

            const data = await response.json();
            console.log(data.message);

            // Save scroll and reload
            const scrollY = window.scrollY;
            sessionStorage.setItem('scrollY', scrollY);
            window.location.reload();
        } else {
            alert("Not enough currency!");
        }

    } catch (error) {
        console.error("Error buying game:", error);
    }
}

async function addgametowischlist(gameName){

    try{
        const userRes = await fetch("/currentuser");
        const userCheck = await userRes.json();

        //doing something when user is not logged in
        if (userCheck.loggedIn) {
            //fetch um das game actually auf die wishlist zu setzten
            const response = await fetch("/addWischlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userCheck.user.id,
                    gameName: gameName
                })
            });
            const data = await response.json();

            //automaticly reload page at the current y pos
            const scrollY = window.scrollY;
            sessionStorage.setItem('scrollY', scrollY);
            window.location.reload();
        } else {
            sessionStorage.setItem("redirectFrom", "shop");
            window.location.href = "../login.html";
        }
    } catch(error){
        console.error("Error fetching game data:", error);
    }
    
    console.log("added game to wischlist")
}
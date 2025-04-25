window.onload = async function () {
    const username = localStorage.getItem("user");
    if (username) {
        document.getElementById("usernamePlaceholder").textContent = username;
    }

    try{
        const userRes = await fetch("/currentuser");
        const userCheck = await userRes.json();

        let userData = null;

        if (userCheck.loggedIn) {
            const userDataRes = await fetch("/get-user-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userCheck.user.id })
            });

            if (!userDataRes.ok) {
                throw new Error("Failed to fetch user data from backend");
            }
            
            userData = await userDataRes.json();
        } else {
            sessionStorage.setItem("redirectFrom", "shop");
            window.location.href = "../login.html";
            return
        }

        const mainbodyHtml = document.getElementById("mainBody")
        mainbodyHtml.innerHTML = generateMainBodyHtml(userData)
    }catch(error){
        console.log(error)
    }
    // <img src="${game.image}" class="cardImage"/>
}

function generateMainBodyHtml(userData){
    return userData.ownedGames.map(gameName => {
        return `
            <div class="gameCard">
                
                <h5 class="gametitle">${gameName}</h5>
            </div>
        `;
    }).join("");
}
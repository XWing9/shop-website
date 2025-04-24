const express = require("express");
const fs = require("fs");
const path = require("path"); // Import path module
const app = express();
const session = require("express-session");
const { stringify } = require("querystring");
const PORT = 5500;

// Middleware to parse JSON requests
app.use(express.json());

app.use(session({
    secret: 'FairyTail', // just a string to sign the session ID cookie
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day (in ms)
    }
}));

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, "../"))); 

// Route to serve Main.html as the default page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Main.html"));
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const filePath = path.join(__dirname, "../Data/data.json");

    let jsonData;
    try {
        jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
        return res.status(500).json({ error: "Error reading JSON file" });
    }

    const user = jsonData.users.find(user => user.username === username);

    // Check if user exists and password matches
    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    //saves user id to session to use later on
    req.session.user = {
        id: user.id,
        username: user.username
    };

    // Send the user ID along with the username and currency
    res.json({
        message: "Login succesful!",
        userId: user.id,
        username: user.username
    });
});

app.get("/currentuser", (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie("connect.sid"); // optional: delete cookie
        res.json({ message: "Logged out" });
    });
});

// Route to update currency
app.post("/update-currency", (req, res) => {
    const { username, amount } = req.body;

    // Define the correct path to the JSON file
    const filePath = path.join(__dirname, "../Data/data.json");

    // Read the JSON file
    let jsonData;
    try {
        jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
        return res.status(500).json({ error: "Error reading JSON file" });
    }

    // Find the user
    const user = jsonData.users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Update currency
    user.currency += amount;

    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    res.json({ message: "Currency updated!", newCurrency: user.currency });
});
app.get("/getallusers", (req, res) => {
    // Adjust the path if needed
    const filePath = path.join(__dirname, "../Data/data.json");

    try {
        // Read the JSON file as a string
        const rawData = fs.readFileSync(filePath, "utf8");

        // Parse the JSON string into an array
        const jsonData = JSON.parse(rawData);

        res.json(jsonData);

    } catch (err) {
        console.error("Error reading JSON file:", err);
        res.status(500).json({ error: "Error reading JSON file" });
    }
});

app.post("/get-user-data", (req, res) => {
    const { userId } = req.body;
    // Define the correct path to the JSON file
    const filePath = path.join(__dirname, "../Data/data.json");

    // Read the JSON file
    let jsonData;
    try {
        jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
        return res.status(500).json({ error: "Error reading JSON file" });
    }

    // Find the user by ID
    const user = jsonData.users.find(user => user.id === userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Send the user data back to the frontend
    res.json({
        username: user.username,
        currency: user.currency,
        userId: user.id,
        ownedGames: user.ownedGames,
        wishlist: user.Wishlist,
        friends: user.friends
    });
});

app.post("/addWischlist",(req, res) =>{
    const { userId, gameName } = req.body;
    // Define the correct path to the JSON file
    const filePath = path.join(__dirname, "../Data/data.json");

    // Read the JSON file
    let jsonData;
    try {
        jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
        return res.status(500).json({ error: "Error reading JSON file" });
    }

    const user = jsonData.users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    if (!user.Wishlist.includes(gameName)) {
        user.Wishlist.push(gameName);
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    res.json({ message: "Game added to wishlist!" });
})

//add that the game that gets bough gets removed from the wischlist
app.post("/buyinggame",(req, res) =>{
    const { userId, gameName,gamePrice } = req.body;
    // Define the correct path to the JSON file
    const filePath = path.join(__dirname, "../Data/data.json");

    // Read the JSON file
    let jsonData;
    try {
        jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
        return res.status(500).json({ error: "Error reading JSON file" });
    }

    const user = jsonData.users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const price = parseFloat(gamePrice); 

    if (!user.ownedGames.includes(gameName)) {
        user.ownedGames.push(gameName);
        user.currency = Math.round((user.currency - price)* 100)/100
        //search other name on wischlist and remove it
        const index = user.Wishlist.indexOf(gameName);
        if (index !== -1) {
            user.Wishlist.splice(index, 1); // remove 1 item at the found index
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    res.json({ message: "Game bought!" });
})

app.get("/getGameInfo", (req, res) => {
    // Adjust the path if needed
    const filePath = path.join(__dirname, "../Data/gamecatalog.json");

    try {
        // Read the JSON file as a string
        const rawData = fs.readFileSync(filePath, "utf8");

        // Parse the JSON string into an array
        const jsonData = JSON.parse(rawData);

        res.json(jsonData);

    } catch (err) {
        console.error("Error reading JSON file:", err);
        res.status(500).json({ error: "Error reading JSON file" });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
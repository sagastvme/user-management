import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import { nanoid } from "nanoid";

import {
    getHashByRefreshToken,
    deleteHashByRefreshToken,
    deleteAllHashesBySub,
    getAllHasheshBySub,
} from "./repositories/refreshTokenRepository.js";

import {
    getUserByUsername,
    insertUser,
} from "./repositories/userRepository.js";

import { validPassword, hashPassword } from "./helpers/cryptoUtils.js";
import { generateJwtAndRefreshToken } from "./helpers/jwtUtils.js";
import { sanitizeInputs } from "./helpers/validationUtils.js";
import { getIPv4, getUserAgent } from "./helpers/requestUtils.js";
import { asyncHandler, isValidServer, requiredFields } from "./middleware/middleware.js";



const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("trust proxy", true);

// ✅ Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
    console.error("Error caught by middleware:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

const port = process.env.NODE_SERVER_PORT;


//Cosas por hacer: 
//implement key rotation and implement auto rotation with keys mongo collection and cache for getpublickeys endpoint

//endpoint para public keys 
//meter una cache
//add logs for every action taken

//session max age, every 14 day re log in 
//update isvalidserver so it handles spas well right now it only handles server side requests 
//pensar algo para que esto se pueda usar con spa -> whitelist domain y pkce 
//permitir registrar varios clientes para usar este servicio e identificar si son spa o no 
//cuando se cree el contenedor por primera vez hacer un script que cree el .env automaticamente 
//crear dockerfile con la bbdd el server node mover las variables a ese env 
//generar claves nuevas para cada servidor creado 
//cors 
//swagger para la documentacion de la api 
//opciones si quiere que el username sea el email un username aparte y otras opciones como requisitos de contrasenas etc 
//crear el html para usar para el proyecto segun los campos que elija para el user 
//make nice ui for user to deal with everything 
//hacer tests 
//anadir el jsdoc o como se llame 

//ENDPOINTS: 
//change-password 
//forgot-pw 
//change username 
//get-all-sessions 
//middleware en proyecto personal


// ----------------- ROUTES ----------------- //

app.post(
    "/close_session",
    isValidServer,
    requiredFields(["refreshTokens"]),
    asyncHandler(async (req, res) => {
        const { refreshTokens } = req.body;
        let sessions = await deleteSessionById(refreshTokens);
        return res.status(200).json({ sessions });
    })
);

app.get(
    "/sessions",
    isValidServer,
    asyncHandler(async (req, res) => {
        const refreshToken = req.get("x-refresh-token");
        const refreshTokenFromDb = await getHashByRefreshToken(refreshToken);
        const { sub } = refreshTokenFromDb;
        let sessions = getAllHasheshBySub(sub);
        return res.status(200).json({ sessions });
    })
);

app.post(
    "/refresh",
    isValidServer,
    requiredFields(["refreshToken", "deviceId"]),
    asyncHandler(async (req, res) => {
        const { refreshToken, deviceId } = req.body;
        let ip = getIPv4(req);
        let userAgent = getUserAgent(req);

        const hashedToken = await getHashByRefreshToken(refreshToken);
        if (!hashedToken) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        if (deviceId !== hashedToken?.deviceId) {
            await deleteAllHashesBySub(hashedToken?.sub);
            return res.status(401).json({ error: "Invalid device id" });
        }

        const {
            jwt,
            refreshToken: newRefresh,
            deviceId: newDeviceId,
        } = await generateJwtAndRefreshToken(hashedToken.sub, ip, userAgent);

        await deleteHashByRefreshToken(refreshToken);
        return res.status(200).json({ jwt, refreshToken: newRefresh, deviceId: newDeviceId });
    })
);

app.post(
    "/logout",
    isValidServer,
    requiredFields(["refreshToken"]),
    asyncHandler(async (req, res) => {
        let { refreshToken } = req.body;
        await deleteHashByRefreshToken(refreshToken);
        return res.status(200).json({ message: "Logged out" });
    })
);

app.post(
    "/login",
    isValidServer,
    requiredFields(["username", "password"]),
    asyncHandler(async (req, res) => {
        let { username, password } = req.body;
        let ip = getIPv4(req);
        let userAgent = getUserAgent(req);

        // sanitize
        const sanitized = sanitizeInputs({ username, password });
        const { username: cleanUsername, password: cleanPassword } = sanitized;

        let userFound = await getUserByUsername(cleanUsername);
        if (!userFound) {
            return res.status(400).json({ error: "No user with that username" });
        }

        let passwordHashed = userFound["password"];
        let sub = userFound["sub"];
        const correctPassword = await validPassword(cleanPassword, passwordHashed);
        if (!correctPassword) {
            return res.status(400).json({ error: "Wrong password" });
        }

        console.log("✅ user logged in");

        let { jwt, refreshToken, deviceId } = await generateJwtAndRefreshToken(
            sub,
            ip,
            userAgent
        );

        return res
            .status(201)
            .json({ message: "User logged in", jwt, refreshToken, deviceId });
    })
);

app.post(
    "/register",
    isValidServer,
    requiredFields(["username", "password"]),
    asyncHandler(async (req, res) => {
        const { username, password } = req.body;
        let ip = getIPv4(req);
        let userAgent = getUserAgent(req);

        const sanitized = sanitizeInputs({ username, password });
        const { username: cleanUsername, password: cleanPassword } = sanitized;

        const hashedPassword = await hashPassword(cleanPassword);
        const sub = `user_${nanoid()}`;

        await insertUser(cleanUsername, hashedPassword, sub);
        console.log("✅ New user created:", { cleanUsername, sub });

        const { jwt, refreshToken, deviceId } = await generateJwtAndRefreshToken(
            sub,
            ip,
            userAgent
        );

        return res.status(201).json({
            sub,
            username: cleanUsername,
            jwt,
            refreshToken,
            deviceId,
        });
    })
);

app.get("/.well-known/jwks.json", (req, res) => {
    //get keys from mongo
});

app.get("/", (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    res.sendFile(path.join(__dirname, "index.html"));
});

// ----------------- SERVER ----------------- //
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

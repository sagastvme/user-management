// Core modules
import path from 'path';
import { fileURLToPath } from 'url'; // para __dirname

// External modules
import express from 'express';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import {
    getHashByRefreshToken,
    deleteHashByRefreshToken
} from './repositories/refreshTokenRepository.js';

import {
    getUserByUsername,
    insertUser
} from './repositories/userRepository.js';

// Helpers
import { hashRefreshToken } from './helpers/cryptoUtils.js';
import { generateJwtAndRefreshToken } from './helpers/jwtUtils.js';
import { hashString } from './helpers/cryptoUtils.js'; // 👈 lo usas en register
import { sanitizeInputs } from './helpers/validationUtils.js';
import { getIPv4, getUserAgent } from './helpers/requestUtils.js';
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('trust proxy', true);



const port = 3000
const pw_pepper = 'holaestoayudaanoserhackeado'
//Cosas por hacer: 
//session max age, every 14 day re log in 
//table with warnings?
//check deviceId when refreshing access token 
//if an old token that has been used already is received delete all tokens for that user
// add a setupscript for the mongodb so it has a ttl 
//anadir el jsdoc o como se llame
// multiples sesiohnes a la vez 
// cerrar sesiones en los dispositivos
// cerrar sesion en x dispositivos 
// add try catch a todo lo que tenga que ver con bd
//mover variables al .env 
//crear dockerfile con la bbdd el server node mover las variables a ese env 
//generar claves nuevas para cada servidor creado
//meter una cache
//cors 
//swagger para la documentacion de la api 
//opciones si quiere que el username sea el email un username aparte y otras opciones como requisitos de contrasenas etc 
//crear middleware
//crear el html para usar para el proyecto segun los campos que elija para el user 
//hacer tests
//add logs for every action taken 
//ttl for database refreshtoken 



//ENDPOINTS:
//change-password
//forgot-pw
//change username
//get-all-sessions
//middleware en proyecto personal 


app.post('/refresh', async (req, res) => {
    const { refreshToken, deviceId } = req.body;
    let ip = getIPv4(req)
    let userAgent = getUserAgent(req);

    if (!refreshToken) {
        return res.status(400).json({ error: 'No refresh token sent' });
    }
    const hashedToken = await getHashByRefreshToken(refreshToken);

    if (!hashedToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
    //add something to check if its the same device and ip as the original one 
    const { jwt, refreshToken: newRefresh, deviceId: newDeviceId } = await generateJwtAndRefreshToken(hashedToken.sub, ip, userAgent);
    await deleteHashByRefreshToken(refreshToken)
    return res.status(200).json({ jwt, refreshToken: newRefresh, deviceId: newDeviceId });
});


app.post('/logout', async (req, res) => {
    let { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'No refresh token sent' });
    const hashed = hashRefreshToken(refreshToken);
    await deleteHashByRefreshToken(refreshToken)
    return res.status(200).json({ message: 'Logged out' });
})

app.post('/login', async (req, res) => {
    let { username, password } = req.body
    let ip = getIPv4(req)
    let userAgent = getUserAgent(req);

    if (!username || !password) {
        return res.status(400).json({ error: 'Didnt receive username and password' }); // Código 400: Bad Request
    }
    //sanitize 


    let userFound = await getUserByUsername(username)
    if (!userFound) {
        return res.status(400).json({ error: 'No user with that username' }); // Código 400: Bad Request
    }

    let passwordHashed = userFound['password']
    let sub = userFound['sub'];
    const correctPassword = await bcrypt.compare(password + pw_pepper, passwordHashed);

    if (!correctPassword) {
        return res.status(400).json({ error: 'Wrong password' }); // Código 400: Bad Request
    }
    console.log('you are logged in')


    let { jwt, refreshToken, deviceId } = await generateJwtAndRefreshToken(sub, ip, userAgent);

    return res.status(201).json({ message: 'User logged in and jwt created ', jwt, refreshToken, deviceId }); // Código 201: Created

})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    let ip = getIPv4(req)
    let userAgent = getUserAgent(req);

    //TODO have a way of extracting the fields that the user wants 
    try {
        // Sanitize input
        const sanitized = sanitizeInputs({ username, password });
        const { username: cleanUsername, password: cleanPassword } = sanitized;

        // Hash password
        const hashedPassword = await hashString(cleanPassword);
        const sub = `user_${nanoid()}`;

        await insertUser(cleanUsername, hashedPassword, sub);
        console.log('✅ New user created:', { cleanUsername, sub });

        // Generate tokens
        const { jwt, refreshToken, deviceId } = await generateJwtAndRefreshToken(sub, ip, userAgent);

        return res.status(201).json({
            sub,
            username: cleanUsername,
            jwt,
            refreshToken,
            deviceId
        });

    } catch (err) {
        const isDup = err.code === 11000;
        const DUPLICATE_MSG = 'Username is already taken';

        console.error(isDup ? DUPLICATE_MSG : '❌ Error in /register:', err);

        return res.status(isDup ? 409 : 400).json({
            error: isDup ? DUPLICATE_MSG : err.message
        });
    }


});



app.get('/', (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    res.sendFile(path.join(__dirname, 'index.html'))
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



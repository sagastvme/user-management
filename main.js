import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import { nanoid } from 'nanoid';
import {
    getHashByRefreshToken,
    deleteHashByRefreshToken,
    deleteAllHashesBySub
} from './repositories/refreshTokenRepository.js';

import {
    getUserByUsername,
    insertUser
} from './repositories/userRepository.js';

import { hashString, validPassword } from './helpers/cryptoUtils.js';
import { generateJwtAndRefreshToken } from './helpers/jwtUtils.js';
import { hashPassword } from './helpers/cryptoUtils.js';
import { sanitizeInputs } from './helpers/validationUtils.js';
import { getIPv4, getUserAgent } from './helpers/requestUtils.js';
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('trust proxy', true);



const port = process.env.NODE_SERVER_PORT
//Cosas por hacer: 
//session max age, every 14 day re log in 
//table with warnings?
//if an old token that has been used already is received delete all tokens for that user
//anadir el jsdoc o como se llame
// multiples sesiohnes a la vez 
//endpoint para public keys 
// cerrar sesiones en los dispositivos
// cerrar sesion en x dispositivos 
//cuando se cree el contenedor por primera vez hacer un script que cree el .env automaticamente
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
//como autenticar que el servidor bueno es el que esta llamando a esta api,
// con api keys 
//se generan manualmente con un script que lo introduce en una coleccion de mongo 
//cada vez que se pida una accion hay que revisar que esa api key exista 
//hay que hacer un script para desactive esa api key y genere una nueva 
//si intentan usar una revocada auditarlo en un log 


//ENDPOINTS:
//change-password
//forgot-pw
//change username
//get-all-sessions
//middleware en proyecto personal 

function isValidServer(req, res, next) {
    const validKeys = ['1', '2'];
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'No API key provided' });
    }

    if (!validKeys.includes(apiKey)) {
        return res.status(403).json({ error: 'Invalid API key' });
    }

    next();
}

app.post('/refresh', isValidServer, async (req, res) => {
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

    if (deviceId !== hashedToken?.deviceId) {
        await deleteAllHashesBySub(hashedToken?.sub)
        return res.status(401).json({ error: 'Invalid device id' });
    }


    const { jwt, refreshToken: newRefresh, deviceId: newDeviceId } = await generateJwtAndRefreshToken(hashedToken.sub, ip, userAgent);
    await deleteHashByRefreshToken(refreshToken)
    return res.status(200).json({ jwt, refreshToken: newRefresh, deviceId: newDeviceId });
});


app.post('/logout', isValidServer, async (req, res) => {
    let { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'No refresh token sent' });
    await deleteHashByRefreshToken(refreshToken)
    return res.status(200).json({ message: 'Logged out' });
})

app.post('/login', isValidServer, async (req, res) => {
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
    const correctPassword = await validPassword(password, passwordHashed)
    if (!correctPassword) {
        return res.status(400).json({ error: 'Wrong password' }); // Código 400: Bad Request
    }
    console.log('you are logged in')


    let { jwt, refreshToken, deviceId } = await generateJwtAndRefreshToken(sub, ip, userAgent);

    return res.status(201).json({ message: 'User logged in and jwt created ', jwt, refreshToken, deviceId }); // Código 201: Created

})

app.post('/register', isValidServer, async (req, res) => {
    const { username, password } = req.body;
    let ip = getIPv4(req)
    let userAgent = getUserAgent(req);

    //TODO have a way of extracting the fields that the user wants 
    try {
        // Sanitize input
        const sanitized = sanitizeInputs({ username, password });
        const { username: cleanUsername, password: cleanPassword } = sanitized;

        // Hash password
        const hashedPassword = await hashPassword(cleanPassword);
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



const voiceBiometric = require('../services/voiceBiometricService');
const userService = require('../services/userService');
const uuid = require('uuid');
const multer = require('multer');
const fs = require('fs');
const ffmpeg = require("fluent-ffmpeg");

const generateGuid = () => {
    return uuid.v4();
};

const upload = multer({
    storage: multer.memoryStorage()
});

const postLogin = async (req, res, file) => {
    try {

        const username = req.body.username;
        const audio = req.file.buffer.toString('base64');
        const guid = generateGuid();
        const fileName = `./public/uploads/${username}_${guid}.webm`;
        fs.writeFileSync(`${fileName}`, audio, 'base64');
        console.log('Audio saved');

        let audioBase64 = await convertAudio(fileName);
        if (!audioBase64) {
            console.error("Error converting audio to Opus");
        }

        const { document_id, phone_number } = await userService.getUser(username);
        console.log("Authentication with document Id:", document_id);

        const response = await voiceBiometric.performAuthentication(document_id, phone_number, audioBase64);

        console.log(`RESPONSE: ${response}`);

        if (response.success) {
            const token = jwt.sign({ username: 'nomeDoUsuario' }, process.env.JWT_SECRET, { expiresIn: '15m' });
            console.log(`JWToken: ${token}`);

            res.cookie('jwt', token, { httpOnly: true });
            res.redirect('/account');
        } else {
            res.redirect('/login?error=authentication_failed');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/login?error=unexpected_error');
    }
};

async function performAuthentication(document_id, phone_number, audio) {
    return await axios.post('https://sandbox-voice-api.minds.digital/v2.1/authentication', {
        document: {
            value: document_id
        },
        external_id: document_id,
        phone_number: phone_number,
        show_details: true,
        source: 'API',
        extension: 'ogg',
        audio: audio
    }).config(
        config => {
            const token = 'Bearer ' + process.env.TOKEN;
            config.headers.Authorization = token;
        }
    );
}

async function convertAudio(fileName) {
    return new Promise((resolve, reject) => {
        ffmpeg(fileName)
            .audioCodec('pcm_s16le')
            .audioFrequency(16000)
            .audioChannels(1)
            .toFormat('wav')
            .on("error", (err) => {
                console.log("An error occurred: " + err.message);
                reject(err);
            })
            .on("end", () => {
                console.log("Conversion succeeded!");
                resolve(fs.readFileSync(fileName.replace(".webm", ".wav"), "base64"));
            })
            .save(fileName.toString().replace(".webm", ".wav"));
    });
}

function convertToOpus(fileName) {
    return new Promise((resolve, reject) => {
        ffmpeg(fileName)
            .outputOptions(["-ac 1", "-ab 16k", "-vn"])
            .toFormat("opus")
            .on("error", (err) => {
                console.log("An error occurred: " + err.message);
                reject(err);
            })
            .on("end", () => {
                console.log("Conversion succeeded!");
                resolve(fs.readFileSync(fileName.replace(".webm", ".ogg"), "base64"));
            })
            .save(fileName.replace(".webm", ".ogg"));
    });
}

module.exports = {
    postLogin,
    upload
};
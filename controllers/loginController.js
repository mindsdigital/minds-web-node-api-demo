const voiceBiometricService = require("../services/voiceBiometricService");
const userService = require("../services/userService");
const uuid = require("uuid");
const multer = require("multer");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const jwt = require("jsonwebtoken");

const generateGuid = () => {
  return uuid.v4();
};

const upload = multer({
  storage: multer.memoryStorage(),
});

const postLogin = async (req, res, file) => {
  try {
    const username = req.body.username;
    const { document_id, phone_number } = await userService.getUser(username);
    console.log("Authentication with document Id:", document_id);

    const voiceEnrolled = await voiceBiometricService.verifyEnrollment(document_id);
    console.log("Voice enrollment status:", voiceEnrolled.status);
    console.log("Voice enrollment certified:", voiceEnrolled.certified);
    console.log("Voice enrollment enrolled:", voiceEnrolled.enrolled);
    console.log("Voice enrollment certified:", voiceEnrolled.certified);

    if (voiceEnrolled.status=='ok' && !voiceEnrolled.enrolled) {
      console.log("Voice enrollment not found");
      res.redirect(`/enroll/${username}`);
      return;
    }

    const audio = req.file.buffer.toString("base64");
    const guid = generateGuid();
    const fileName = `./public/uploads/${username}_${guid}.webm`;
    fs.writeFileSync(`${fileName}`, audio, "base64");
    console.log("Audio saved");

    let audioBase64 = await convertAudio(fileName);
    fs.writeFileSync(`${fileName.replace("webm","txt")}`, audioBase64);
    if (!audioBase64) {
      console.error("Error converting audio to Opus");
    }

    
    const response = await voiceBiometricService.performAuthentication(
      document_id,
      phone_number,
      guid,
      audioBase64
    );

    if (!response.data) {
      console.log("Authentication failed");
      return;
    }

    console.log("Authentication response:", response.data.recommended_action);

    switch (response.data.result.recommended_action) {
      case "accept":
        console.log("Authentication accepted");
        const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });
        console.log(`JWToken: ${token}`);
  
        res.cookie("jwt", token, { httpOnly: true });
        res.redirect(`/account/${username}`);  
        return;
      case "reject":
        console.log("Authentication rejected");
        res.redirect("/login?error=reject");
        return;
      case "accept_with_risk":
        console.log("Authentication low confidence");
        res.redirect(`/account/${username}?=lowconfidence`);
        return;
      default:
        res.redirect("/login?error=unexpected_error");
    }

  } catch (error) {
    console.error(error);
    res.redirect("/login?error=unexpected_error");
  }
};

async function convertAudio(fileName) {
  return new Promise((resolve, reject) => {
    ffmpeg(fileName)
      .audioCodec("pcm_s16le")
      .audioFrequency(16000)
      .audioChannels(1)
      .toFormat("wav")
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
  upload,
};

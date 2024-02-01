const axios = require("axios").default;
const TOKEN = process.env.TOKEN;
const MINDS_API = "https://sandbox-voice-api.minds.digital/v2.1";

const verifyEnrollment = async (document_id) => {
  console.log("Checking if document is already enrolled");
  var options = {
    method: 'GET',
    url: `${MINDS_API}/enrollment/verify`,
    params: { cpf: document_id },
    headers: { Authorization: `Bearer ${TOKEN}` }
  };

  axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });
}

const performAuthentication = async (document_id, phone_number, audioBase64) => {
  console.log("Performing authentication");

  var options = {
    method: "POST",
    url: `${MINDS_API}/authentication`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    data: {
      audio: audioBase64,
      document: {
        value: document_id,
      },
      extension: 'ogg',
      external_id: document_id,
      phone_number: phone_number,
      show_details: true,
    },
  };

  return axios
    .request(options)
    .then(function (response) {
      if (response.data) {
        console.log(response.data);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
};

const voiceEnrollment = async (document_id, phone_number, audioBase64) => {
  console.log("Verifying authentication");
  console.log("Document ID:", document_id);
  console.log("Phone number:", phone_number);
  console.log("Audio base64:", audioBase64);

  var options = {
    method: "POST",
    url: `${MINDS_API}/authentication`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    data: {
      audio: audioBase64,
      document: {
        value: document_id,
      },
      extension: 'ogg',
      external_id: document_id,
      phone_number: phone_number,
      show_details: true,
    },
  };

  return axios
    .request(options)
    .then(function (response) {
      if (response.data) {
        console.log(response.data);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
};

module.exports = {
  verifyEnrollment,
  performAuthentication,
  voiceEnrollment
};
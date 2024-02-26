require('dotenv').config();
const axios = require("axios").default;
const MINDS_API = process.env.MINDS_API;

const verifyEnrollment = async (document_id) => {
  console.log(`Checking if document [${document_id}] is already enrolled`);
  
  var options = {
    method: "GET",
    url: `${MINDS_API}/enrollment/verify`,
    params: { cpf: document_id },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TOKEN}`,
    },
  };

  return axios
    .request(options)
    .then(function (response) {
      if (response.data) {
        console.log(response.data);
        return response.data;
      }
    })
    .catch(function (error) {
      console.error(error);
    });
};

const performAuthentication = async (document_id, phone_number, guid, audioBase64) => {
  console.log("Performing authentication");

  var options = {
    method: "POST",
    url: `${MINDS_API}/authentication`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TOKEN}`,
    },
    data: {
      document: {
        value: document_id,
      },
      extension: "wav",
      external_id: guid,

      phone_number: phone_number,
      source_name: "API",
      show_details: true,
      audio: audioBase64
    },
  };

  return axios
    .request(options)
    .then(function (response) {
      if (response) {
        console.log(response);
        return response;
      }
    })
    .catch(function (error) {
      console.error(error);
      return error;
    });
};

const voiceEnrollment = async (document_id, phone_number, audioBase64) => {
  console.log("Verifying authentication");

  var options = {
    method: "POST",
    url: `${MINDS_API}/authentication`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TOKEN}`,
    },
    data: {
      audio: audioBase64,
      document: {
        value: document_id,
      },
      extension: "ogg",
      external_id: document_id,
      phone_number: phone_number,
      show_details: true,
      certification: false,
      insert_on_quarantine: false
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

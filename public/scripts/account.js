const RECORDING_LIMIT = 15; // do not exceed 30 seconds.

const btnTransfer = document.getElementById("transferOption");
const btnCancelTransfer = document.getElementById("cancelTranferBtn");
const modalContainer = document.getElementById("modalContainer");
const modal = document.getElementById("modal");

let mediaRecorder;
let audioChunks = [];
let seconds = 0;
let intervalId;
let isRecording = false;
let stream;

var usernameInput;
var audioPlayer = document.getElementById("audioPlayer");
var startRecordingButton = document.getElementById("startRecording");
var stopRecordingButton = document.getElementById("stopRecording");
var loginButton = document.getElementById("startRecording");

startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
stopRecordingButton.hidden = true;
audioPlayer.hidden = true;

openModal = () => {
    modalContainer.style.display = "block";
    modal.style.display = "block";
};

closeModal = () => {
    modalContainer.style.display = "none";
    modal.style.display = "none";
};

btnCancelTransfer.addEventListener("click", closeModal());

makeTransfer = async () => {

  const userTo = document.getElementById("userTo").value;
  const amount = document.getElementById("amountTransfer").value;

  amoutDecimal = removeMascaraReais(amount);

  if (amoutDecimal > 1000) {
    return alert("O valor da transferência precisa de autenticação");
  }

  console.log(userTo, amount);
  const formData = new FormData();

  formData.append("userTo", userTo);
  formData.append("amount", amount);

  if (amount.length === 0 || userTo.length === 0) {
    return alert("Por favor, preencha os campos de usuário e valor");
  }

  if (amount <= 0) {
    return alert("Por favor, insira um valor maior que zero");
  }

  let userConfirmation;
  if (amoutDecimal > 1000) {
    userConfirmation = confirm(
      "Precisaremos proceder com a validação da sua biometria para a transferência"
    );
    if (!userConfirmation) {
      return alert("A transferência foi cancelada");
    }
  }

  // Fix: Set headers to indicate form data is being sent
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (amoutDecimal > 1000) {
    await authenticateUser();
  }

  try {
    const response = await fetch(`http://localhost:3000/transferFunds/`, {
      method: "POST",
      // Pass form data and headers
      body: new URLSearchParams({
        userFrom: userFrom,
        userTo: userTo,
        amount: amoutDecimal,
      }),

      headers: headers,
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else if (response.status === 404) {
      return null;
    } else {
      throw new Error(`Failed to check transfer. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error transfering", error);
    return null;
  } finally {
    closeModal();
  }
};

/**
 * startRecording initiates audio recording for voice authentication.
 * It first validates the username input and checks if the user has voice biometrics registered.
 * If valid, it gets microphone access, starts a MediaRecorder, handles data events to collect audio chunks,
 * starts a timer, and sets up stop behavior to process the recording.
 */
async function startRecording() {
  const usernameValue = username.value.trim();

  if (usernameValue.length === 0) {
    return alert("Por favor, preencha o campo username!");
  }

  const userData = await checkUsernameExists(usernameValue);

  if (!userData) {
    return alert("O username não possui biometria cadastrada");
  }

  logInBrowser(`User Data: ${JSON.stringify(userData)}`);

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    timestamp.hidden = false;
    audioPlayer.hidden = false;

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    startTimer();
    logInBrowser(`Started recording at ${new Date()}`);

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/ogg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      audioPlayer.src = audioUrl;
      stopRecordingButton.disabled = true;
      isRecording = false;
      logInBrowser(`Stopped recording at ${new Date()}`);
      proceedWithAuthentication();
      resetRecording();
    };

    mediaRecorder.start();
    startRecordingButton.hidden = true;
    stopRecordingButton.hidden = true;
    stopRecordingButton.disabled = false;
    isRecording = true;
  } catch (error) {
    logInBrowser(error);
  }
}

/**
 * Stops the media recording and timer.
 * Checks if recording is in progress, and if so, stops the mediaRecorder
 * and clears the timer interval. Also updates the UI by hiding start
 * and stop recording buttons.
 */
function stopRecording() {
  event.preventDefault();
  logInBrowser(`stopRecording : Stopped timer at ${new Date()}`);

  if (isRecording) {
    mediaRecorder.stop();
    clearInterval(intervalId);
    startRecordingButton.hidden = true;
    stopRecordingButton.hidden = true;
    isRecording = false;
    stream.getTracks().forEach(track => track.stop());
  }
}

/**
 * Starts a timer that runs every second, logging the elapsed time.
 * Stops the timer if it reaches the RECORDING_LIMIT.
 */
async function startTimer() {
  logInBrowser(`startTimer : Started timer at ${new Date()}`);
  intervalId = setInterval(async () => {
    seconds++;
    logInBrowser(`Time: ${formatTime(seconds)}`);

    if (seconds >= RECORDING_LIMIT) {
      clearInterval(intervalId);
      mediaRecorder.stop();
      logInBrowser("Time's up!");
    }
  }, 1000);
}

/**
 * Checks if a given username exists by making a request to the server.
 *
 * @param {string} username - The username to check for existence.
 *
 * @returns {Object|null} - The user object if found, null if not found.
 * Throws an error on request failure.
 */
async function checkUsernameExists(username) {
  try {
    const response = await fetch(`http://localhost:3000/users/${username}`);
    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else if (response.status === 404) {
      return null;
    } else {
      throw new Error(
        `Failed to check username existence. Status: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error checking username existence:", error);
    stream.getTracks().forEach(track => track.stop());
    return null;
  }
}

/**
 * Authenticates the user by sending username and audio recording to the server.
 *
 * Sends a POST request to the /login endpoint with username and audio recording.
 * Checks response status to determine if login succeeded or failed.
 */
async function proceedWithAuthentication() {
  event.preventDefault();

  const username = usernameInput.value;

  const audioBlob = new Blob(audioChunks, { type: "audio/ogg" });
  const formData = new FormData();

  formData.append("username", username);
  formData.append("audio", audioBlob);

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      body: formData,
    });
    
    if (response.ok) {
      window.location.href = response.url;      
    } else {
      console.log("Falha no response");
    }
  } catch (error) {
    console.error("Erro durante o login:", error);
    stream.getTracks().forEach(track => track.stop());
    //window.location.href = `/login?error=unexpected_error`;
  }
}

/**
 * Handles user login authentication.
 *
 * Attaches click handler to login button that sends username and recorded
 * audio to /login endpoint. Checks response status to handle success or failure.
 * Resets recording after login attempt.
 */
loginButton.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = usernameInput.value;

  const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
  const formData = new FormData();

  formData.append("username", username);
  formData.append("audio", audioBlob);

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // TODO: Tratar o login bem-sucedido, redirecionamento, etc.
      console.log("Login bem-sucedido");
    } else {
      // TODO: Tratar a falha no login
      console.error("Falha no login");
    }
  } catch (error) {
    console.error("Erro durante o login:", error);
  }
});

function resetRecording() {
  seconds = 0;
  audioChunks = [];
}

/**
 * Formats a number as currency by removing non-digit characters,
 * padding with zeros, inserting decimal point, and formatting
 * with Intl.NumberFormat to display as currency.
 */
const mascaraReais = (event) => {
  const onlyDigits = event.target.value
    .split("")
    .filter((s) => /\d/.test(s))
    .join("")
    .padStart(3, "0");
  const digitsFloat = onlyDigits.slice(0, -2) + "." + onlyDigits.slice(-2);
  event.target.value = maskCurrency(digitsFloat);
};

const removeMascaraReais = (reais) => {
  const onlyDigits = reais
    .split("")
    .filter((s) => /\d/.test(s))
    .join("")
    .padStart(3, "0");
  return onlyDigits.slice(0, -2) + "." + onlyDigits.slice(-2);
};

/**
 * Formats a number as currency using Intl.NumberFormat.
 * @param {number} valor - The number to format.
 * @param {string} [locale='pt-BR'] - The locale to use.
 * @param {string} [currency='BRL'] - The currency to use.
 * @returns {string} The formatted currency string.
 */
const maskCurrency = (valor, locale = "pt-BR", currency = "BRL") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(valor);
};

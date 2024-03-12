const RECORDING_LIMIT = 15; // do not exceed 30 seconds.
const transferLimit = 1000;

const btnTransfer = document.getElementById("transferOption");
const btnCancelTransfer = document.getElementById("cancelTranferBtn");
const modalContainer = document.getElementById("modalContainer");
const confirmationContainer = document.getElementById("confirmationContainer");
const modal = document.getElementById("modal");

let mediaRecorder;
let audioChunks = [];
let seconds = 0;
let intervalId;
let isRecording = false;
let stream;

// var audioPlayer = document.getElementById("audioPlayer");
var timestamp = document.getElementById("timeStamp");
var startRecordingButton = document.getElementById("startRecording");
var stopRecordingButton = document.getElementById("stopRecording");
var loginButton = document.getElementById("startRecording");
let transferBtn = document.getElementById("transferBtn");
let audioWaveLottie = document.getElementById("audioWaveLottie");
var errorFavorite = document.getElementById("errorFavorite");
var errorValue = document.getElementById("errorValue");
const userToInput = document.getElementById("userTo");
const amountInput = document.getElementById("amountTransfer");
let errorsMessage = document.getElementById("errorsMessage")
let errorSpan = document.getElementById("error")

startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
stopRecordingButton.hidden = true;

timestamp.hidden = true;
confirmationContainer.style.display = "none";

openModal = () => {
    modalContainer.style.display = "block";
    modal.style.display = "block";
    transferBtn.disabled = false;
};

closeModal = () => {
    stopRecording();
    cleanModal();
    location.reload();
};

cleanModal = () =>{
  modalContainer.style.display = "none";
  modal.style.display = "none";
  confirmationContainer.style.display = "none";

  errorFavorite.style.display = "none";
  errorValue.style.display = "none";
  errorsMessage.style.display = "none";

  transferBtn.disabled = false;

  userToInput.classList.remove("error-input");
  amountInput.classList.remove("error-input");

  amountInput.value = '';
  userToInput.selectedIndex = 0;
}

btnCancelTransfer.addEventListener("click", closeModal);

verifyAmount = () => {
  const amount = document.getElementById("amountTransfer").value;
  const amountDecimal = removeMascaraReais(amount);

  if (amountDecimal >= transferLimit) {
    // unhide transfer button
    confirmationContainer.style.display = "block";
    return;
  }
  confirmationContainer.style.display = "none"; 
}

makeTransfer = async () => {
  errorFavorite.style.display = "none";
  errorValue.style.display = "none";
  userToInput.classList.remove("error-input");
  amountInput.classList.remove("error-input");
  amountInput.classList.remove("error-input");

  errorsMessage.style.display = "none";

  const userTo = document.getElementById("userTo").value;
  const amount = document.getElementById("amountTransfer").value;

  amoutDecimal = removeMascaraReais(amount);
  if (amoutDecimal >= transferLimit) {
    confirmationContainer.style.display = "block";
    return;
  }

  console.log(userTo, amount);
  const formData = new FormData();

  formData.append("userTo", userTo);
  formData.append("amount", amount);

  if (userTo.length === 0) {
    userToInput.classList.add("error-input");
    errorFavorite.style.display = "block";
    return;
  }

  if (amount.length === 0 || amount <= 0) {
    amountInput.classList.add("error-input");
    errorValue.style.display = "block";
    return;
  }

  // Fix: Set headers to indicate form data is being sent
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  try {
    const response = await fetch(`http://localhost:3000/transferFunds/`, {
      method: "POST",
      // Pass form data and headers
      body: new URLSearchParams({
        userFrom: null,
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
  const amount = document.getElementById("amountTransfer").value;
  amoutDecimal = removeMascaraReais(amount);
  if (amoutDecimal < transferLimit) {
    makeTransfer();
    return;
  }

  errorsMessage.style.display = "none";
  timestamp.style.display = "block";
  transferBtn.disabled = true;

  const usernameValue = window.location.pathname.split('/')[2];
  const userData = await checkUsernameExists(usernameValue);

  if (!userData) {
    return alert("O username não possui biometria cadastrada");
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    timestamp.hidden = false;
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    startTimer();
    audioWaveLottie.classList.add("active");

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/ogg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      stopRecordingButton.hidden = true;
      isRecording = false;
      proceedWithAuthentication();
      resetRecording();
      transferBtn.disabled = false;
    };

    mediaRecorder.start();
    startRecordingButton.hidden = true;
    stopRecordingButton.hidden = true;
    isRecording = true;
  } catch (error) {
    console.error("Error checking voice biometrics:", error);
    return null;
  }
}

/**
 * Stops the media recording and timer.
 * Checks if recording is in progress, and if so, stops the mediaRecorder
 * and clears the timer interval. Also updates the UI by hiding start
 * and stop recording buttons.
 */
function stopRecording() {
  // event.preventDefault();

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
  intervalId = setInterval(async () => {
    seconds++;
    formatTime(seconds);
    if (seconds >= RECORDING_LIMIT) {
      clearInterval(intervalId);
      mediaRecorder.stop();
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

  const username = window.location.pathname.split('/')[2];

  const audioBlob = new Blob(audioChunks, { type: "audio/ogg" });
  const formData = new FormData();

  formData.append("username", username);
  formData.append("audio", audioBlob);

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      body: formData,
    });
    
    const res = await response.json();
    
    if (res.success && (res.result.recommended_action === "accept" || res.result.recommended_action === "accept_with_risk")) {
      closeModal();
    } else if (res.success && res.result.recommended_action === "reject" ){
      errorsMessage.style.display = "grid";
      if (res.result.reasons[0] === "spoof"){
        errorSpan.innerHTML = "Aparentemente esse áudio não é legítimo e é um possível spoof de voz."
      }
      if (res.result.reasons[0] === "voice_different"){
        errorSpan.innerHTML = "A voz que você está utilizando para autenticação é diferente da voz registrada. Por favor, tente novamente."
      }
      if (res.result.reasons[0] === "phone_flag" || res.result.reasons[0] === "voice_flag"){
        errorSpan.innerHTML = "Identificamos que essa voz/telefone está com um bloqueio em nossa base de dados."
      }
    } else {
      alert("Falha no response");
    }

    startRecordingButton.hidden = false;
    audioWaveLottie.classList.remove("active");
    timestamp.style.display = "none";

  } catch (error) {
    errorsMessage.style.display = "grid";
    errorSpan.innerHTML = "Ops! A autenticação falhou. Preciso que fale um pouco mais devagar. Por favor, grave o áudio novamente.";
    
    stream.getTracks().forEach(track => track.stop());

    startRecordingButton.hidden = false;
    audioWaveLottie.classList.remove("active");
    timestamp.style.display = "none";
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

function formatTime(seconds) {
  if (seconds > 4) {
      stopRecordingButton.hidden = false;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  const formattedTime = `${hours}:${minutes}:${remainingSeconds}`;
  timestamp.innerText = "Time: " + formattedTime;
  return formattedTime;
}

const mudancaValor = (value) => {
  value = removeMascaraReais(value);

  if(value < transferLimit){
    transferBtn.disabled = false;
    confirmationContainer.style.display = "none";
  } else{
    transferBtn.disabled = true;
    confirmationContainer.style.display = "block";
  }
}
/**
 * Initiates audio recording for voice authentication after validating username and checking for existing voice biometrics.
 * Gets microphone access via mediaDevices API, sets up MediaRecorder to collect audio chunks,
 * starts a timer, and configures stop behavior to process the recording.
 */

const RECORDING_LIMIT = 15; // do not exceed 30 seconds.
let mediaRecorder;
let audioChunks = [];
let seconds = 0;
let intervalId;
let isRecording = false;
let stream;

var usernameInput = document.getElementById("username");
// var audioPlayer = document.getElementById("audioPlayer");
var startRecordingButton = document.getElementById("startRecording");
var stopRecordingButton = document.getElementById("stopRecording");
var checkboxLogs = document.getElementById("ckbLogs");
var timestamp = document.getElementById("timeStamp");
let audioWaveLottie = document.getElementById("audioWaveLottie");
var loginButton = document.getElementById("submit");
var logs = document.getElementById("logs");
var errorLabel = document.getElementById("errorUsername");
let errorsMessage = document.getElementById("errorsMessage")
let errorSpan = document.getElementById("error")

startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
checkboxLogs.addEventListener("change", toggleLogs);
let logContent = logs.innerText;
stopRecordingButton.hidden = true;
// audioPlayer.hidden = true;
timestamp.hidden = true;

/**
 * startRecording initiates audio recording for voice authentication.
 * It first validates the username input and checks if the user has voice biometrics registered.
 * If valid, it gets microphone access, starts a MediaRecorder, handles data events to collect audio chunks,
 * starts a timer, and sets up stop behavior to process the recording.
 */
async function startRecording() {
  usernameInput.classList.remove("error-input");
  errorLabel.style.display = "none";
  errorsMessage.style.display = "none";

  const usernameValue = username.value.trim();

  if (usernameValue.length === 0) {
    usernameInput.classList.add("error-input");
    errorLabel.style.display = "block";
    return
  }

  const userData = await checkUsernameExists(usernameValue);

  if (!userData) {
    usernameInput.classList.add("error-input");
    errorLabel.style.display = "block";
    return
  }

  logInBrowser(`User Data: ${JSON.stringify(userData)}`);

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    audioWaveLottie.classList.add("active");
    timestamp.style.display = "block";
    // audioPlayer.hidden = false;

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

      // audioPlayer.src = audioUrl;
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
      usernameInput.classList.add("error-input");
      errorLabel.style.display = "block";
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

    const res = await response.json();

    if (res.success && (res.result.recommended_action === "accept" || res.result.recommended_action === "accept_with_risk")) {
      window.location.href = `http://localhost:3000/account/${username}`;

    } else if(res.success && res.result.recommended_action === "reject" ){
      errorsMessage.style.display = "grid";
      if(res.result.reasons[0] === "spoof"){
        errorSpan.innerHTML = "Aparentemente esse áudio não é legítimo e é um possível spoof de voz."
      }
      if(res.result.reasons[0] === "voice_different"){
        errorSpan.innerHTML = "A voz que você está utilizando para autenticação é diferente da voz registrada. Por favor, tente novamente."
      }
      if(res.result.reasons[0] === "phone_flag" || res.result.reasons[0] === "voice_flag"){
        errorSpan.innerHTML = "Identificamos que essa voz/telefone está com um bloqueio em nossa base de dados."
      }
    } else {
      errorSpan.innerHTML = "Ops! A autenticação falhou. Preciso que fale um pouco mais devagar. Por favor, grave o áudio novamente."
    }

    startRecordingButton.hidden = false;
    audioWaveLottie.classList.remove("active");
    timestamp.style.display = "block";

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

function toggleLogs() {
    if (checkboxLogs.checked) {
        logs.hidden = false;
    } else {
        logs.hidden = true;
    }
}

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

function logInBrowser(message) {
    logContent += `- ${new Date()}: ${message}` + '\r\n' + '\r\n';
    logs.value = logContent;
    logs.scrollTop = logs.scrollHeight;
}
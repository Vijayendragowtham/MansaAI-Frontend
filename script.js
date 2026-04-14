const API_URL = "http://127.0.0.1:8000/predict";

let mediaRecorder;
let audioChunks = [];
let recordedBlob = null;


/* -----------------------------
UPLOAD AUDIO ANALYSIS
----------------------------- */

async function analyzeEmotion() {

    const fileInput = document.getElementById("audioFile");

    if (!fileInput.files.length) {
        alert("Please upload an audio file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        displayResult("uploadResult", data);

    } catch (error) {

        console.error(error);
        alert("Upload analysis failed.");

    }

}


/* -----------------------------
LIVE RECORDING
----------------------------- */

async function startRecording() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);

        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.start();

        document.getElementById("liveResult").innerHTML =
            "🎤 Recording... speak now.";

    } catch (error) {

        console.error(error);
        alert("Microphone access failed.");

    }

}


function stopRecording() {

    if (!mediaRecorder) {
        alert("Recording has not started.");
        return;
    }

    mediaRecorder.stop();

    mediaRecorder.onstop = () => {

        recordedBlob = new Blob(audioChunks, { type: "audio/webm" });

        document.getElementById("liveResult").innerHTML =
            "✅ Recording complete. Click 'Analyze Recording'.";

    };

}


/* -----------------------------
ANALYZE LIVE RECORDING
----------------------------- */

async function analyzeRecording() {

    if (!recordedBlob) {
        alert("Please record audio first.");
        return;
    }

    const formData = new FormData();
    formData.append("file", recordedBlob, "recording.webm");

    try {

        document.getElementById("liveResult").innerHTML =
            "🧠 Analyzing emotion...";

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        displayResult("liveResult", data);

    } catch (error) {

        console.error(error);
        alert("Recording analysis failed.");

    }

}


/* -----------------------------
DISPLAY RESULT
----------------------------- */

function displayResult(elementId, data) {

    const box = document.getElementById(elementId);

    if (data.error) {

        box.innerHTML = "<b>Error:</b> " + data.error;
        return;

    }

    box.innerHTML =
        "<h3>Emotion Result</h3>" +
        "<b>Emotion:</b> " + data.emotion + "<br>" +
        "<b>Confidence:</b> " + data.confidence.toFixed(3) + "<br>" +
        "<b>Mental State:</b> " + data.mental_state + "<br>" +
        "<b>Risk Level:</b> " + data.risk_level + "<br>" +
        "<b>Suggestion:</b> " + data.suggestion;

}
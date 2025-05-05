// script.js
// Load Firebase modules first
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase configuration & initialization
const firebaseConfig = {
  apiKey: "AIzaSyCGfJstbn9eObkHWtCbFE1NzYZA62JSxRg",
  authDomain: "plantdoc9635.firebaseapp.com",
  projectId: "plantdoc9635",
  storageBucket: "plantdoc9635.appspot.com",
  messagingSenderId: "1080581409053",
  appId: "1:1080581409053:web:2394d2575ff075dcdf79f4"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Main DOM logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements for detection
  const fileInput = document.getElementById('file-input');
  const uploadBtn = document.getElementById('upload-btn');
  const cameraBtn = document.getElementById('camera-btn');
  const previewArea = document.getElementById('preview-area');
  const uploadArea = document.getElementById('upload-area');
  const resultArea = document.getElementById('result-area');
  const imagePreview = document.getElementById('image-preview');
  const predictBtn = document.getElementById('btn-predict');
  const analyzeAnotherBtn = document.getElementById('analyze-another');
  const loader = document.querySelector('.loader');
  let currentImageData = null;

  // File upload
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      imagePreview.src = e.target.result;
      currentImageData = e.target.result;
      previewArea.classList.remove('hidden');
      uploadArea.classList.add('hidden');
      resultArea.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });

  // Camera capture
  cameraBtn.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = stream;

      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50';
      overlay.appendChild(video);

      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capture';
      captureBtn.className = 'mt-4 bg-green-500 text-white px-6 py-3 rounded-lg';
      overlay.appendChild(captureBtn);

      document.body.appendChild(overlay);

      captureBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        currentImageData = dataUrl;
        imagePreview.src = dataUrl;
        previewArea.classList.remove('hidden');
        uploadArea.classList.add('hidden');
        resultArea.classList.add('hidden');
        stream.getTracks().forEach(t => t.stop());
        overlay.remove();
      });
    } catch (err) {
      alert('Camera error: ' + err.message);
    }
  });

  // Predict
  predictBtn.addEventListener('click', () => {
    if (!currentImageData && !fileInput.files.length) {
      return alert('Please select or capture an image first.');
    }
    loader.classList.remove('hidden');
    previewArea.classList.add('hidden');

    const formData = new FormData();
    if (fileInput.files.length) {
      formData.append('file', fileInput.files[0]);
    } else {
      formData.append('image_data', currentImageData);
    }

    fetch('/predict', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        loader.classList.add('hidden');
        if (data.error) throw new Error(data.error);
        document.getElementById('disease-class').textContent = data.class;
        document.getElementById('confidence-value').textContent = data.confidence + '%';
        document.getElementById('confidence-level').style.width = data.confidence + '%';
        document.getElementById('healthy-percent').textContent = data.all_predictions.Healthy + '%';
        document.getElementById('powdery-percent').textContent = data.all_predictions['Powdery Mildew'] + '%';
        document.getElementById('rust-percent').textContent = data.all_predictions.Rust + '%';
        resultArea.classList.remove('hidden');
      })
      .catch(err => {
        loader.classList.add('hidden');
        previewArea.classList.remove('hidden');
        alert('Prediction error: ' + err.message);
      });
  });

  // Reset
  analyzeAnotherBtn.addEventListener('click', () => {
    fileInput.value = '';
    imagePreview.src = '#';
    currentImageData = null;
    uploadArea.classList.remove('hidden');
    previewArea.classList.add('hidden');
    resultArea.classList.add('hidden');
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  }));

  // Login form (if present)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful! Welcome ' + user.email);
        window.location.href = 'index.html';
      } catch (err) {
        alert('Login failed: ' + err.message);
      }
    });
  }
});

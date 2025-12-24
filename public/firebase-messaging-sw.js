// public/firebase-messaging-sw.js

// Import the required Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// 1. Initialize Firebase with your project config
const firebaseConfig = {
  // Use your actual Firebase configuration values here
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);

// 2. Get a reference to the messaging service
const messaging = firebase.messaging();

// 3. Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/favicon.ico',
    // data: payload.data // Include custom data if needed
  };

  // Show the notification using the browser's ServiceWorker registration
  self.registration.showNotification(notificationTitle, notificationOptions);
});
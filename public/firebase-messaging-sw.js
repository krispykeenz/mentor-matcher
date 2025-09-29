/* Firebase Cloud Messaging service worker */
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

const config = {
  apiKey: 'AIzaSyCNpPquOEWUag8e8e8PJctbnXkPq6l-CqY',
  authDomain: 'mentor-matching-3efb8.firebaseapp.com',
  projectId: 'mentor-matching-3efb8',
  storageBucket: 'mentor-matching-3efb8.firebasestorage.app',
  messagingSenderId: '452066198701',
  appId: '1:452066198701:web:a437b324ab10fde9baf224',
};

const app = initializeApp(config);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, ({ notification }) => {
  self.registration.showNotification(notification?.title ?? 'MentorMatch SA', {
    body: notification?.body ?? '',
    icon: '/icons/icon-192.png',
  });
});


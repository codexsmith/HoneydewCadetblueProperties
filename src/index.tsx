import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App';
import { firebaseConfig } from './database/FirebaseService'; 
import { getFirestore } from 'firebase/firestore';
import { FirebaseAppProvider, FirestoreProvider } from 'reactfire';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig} suspense={true}>
      {/* <FirestoreProvider sdk={getFirestore()}> */}
        <App />
      {/* </FirestoreProvider> */}
    </FirebaseAppProvider>
  </React.StrictMode>
)
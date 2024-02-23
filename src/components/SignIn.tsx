// src/components/SignIn.tsx
import React from 'react';
import { useAuth } from 'reactfire';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const SignIn: React.FC = () => {
  const auth = useAuth();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Handle successful sign-in.
      // The user is automatically handled by the Firebase Auth state observer.
    } catch (error) {
      // Handle errors here, such as displaying a notification.
      console.error(error);
    }
  };

  return (
    <button onClick={handleSignIn}>Sign in with Google</button>
  );
};


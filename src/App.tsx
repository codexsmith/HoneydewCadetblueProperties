import React from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
// import { KanbanProvider } from "./kanban/KanbanContext";
import { getFirestore } from 'firebase/firestore';
import { FirestoreProvider, useFirebaseApp, AuthProvider } from 'reactfire';

import { getAuth } from 'firebase/auth';


function App() {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);


  const firestoreInstance = getFirestore(firebaseApp);

  return (
    <FirestoreProvider sdk={firestoreInstance}>
    <AuthProvider sdk={auth}>

      <ChakraProvider>
      <Router>
          <Box display="flex">
            <Sidebar />
            <main
              style={{
                width: "100%", // Fill the entire width
              }}
            >
              <Routes>
                {/* Replace Switch with Routes */}
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </main>
          </Box>
      </Router>
      </ChakraProvider>
    </AuthProvider>
    </FirestoreProvider>
  );
}
export default App;


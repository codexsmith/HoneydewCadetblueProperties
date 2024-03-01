import React from "react";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { Global } from "@emotion/react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
// import { KanbanProvider } from "./kanban/KanbanContext";
import { getFirestore } from "firebase/firestore";
import { FirestoreProvider, useFirebaseApp, AuthProvider } from "reactfire";

import { getAuth } from "firebase/auth";

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
              <Box flex="1" overflow="auto" height="100vh">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                  </Routes>
              </Box>
            </Box>
          </Router>
        </ChakraProvider>
      </AuthProvider>
    </FirestoreProvider>
  );
}
export default App;

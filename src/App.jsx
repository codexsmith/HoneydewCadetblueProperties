import React from "react";
import { Box, ChakraProvider, extendTheme } from "@chakra-ui/react";
import { darkTheme } from "./chakra-theme,js";
import { getFirestore } from "firebase/firestore";
import { FirestoreProvider, useFirebaseApp, AuthProvider } from "reactfire";
import { getAuth } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import AmChart from "./chart/amchart";

function App() {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);

  const firestoreInstance = getFirestore(firebaseApp);

  return (
    <FirestoreProvider sdk={firestoreInstance}>
      <AuthProvider sdk={auth}>
        <ChakraProvider theme={darkTheme}>
          <Router>
            <Box display="flex">
              <Sidebar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/stocks" element={<Stocks />} />
              </Routes>
            </Box>
          </Router>
        </ChakraProvider>
      </AuthProvider>
    </FirestoreProvider>
  );
}
export default App;

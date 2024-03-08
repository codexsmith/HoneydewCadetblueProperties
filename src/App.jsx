import React from "react";
import { Box, ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Global } from "@emotion/react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import { getFirestore } from "firebase/firestore";
import { FirestoreProvider, useFirebaseApp, AuthProvider } from "reactfire";

import { getAuth } from "firebase/auth";
import AmChart from "./chart/amchart";

function App() {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);

  const firestoreInstance = getFirestore(firebaseApp);

  const darkTheme = extendTheme({
    config: {
      initialColorMode: "dark",
      useSystemColorMode: false,
    },
    styles: {
      global: (props) => ({
        body: {
          bg: props.colorMode === "dark" ? "gray.800" : "gray.100", // Example background colors
          color: props.colorMode === "dark" ? "whiteAlpha.900" : "gray.800", // Example text colors
        },
      }),
    },
  });

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

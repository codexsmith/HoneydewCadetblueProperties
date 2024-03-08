import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { firebaseConfig } from "./data/FirebaseService";
import { getFirestore } from "firebase/firestore";
import { FirebaseAppProvider, FirestoreProvider } from "reactfire";
import { ColorModeScript } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";

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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig} suspense={true}>
      <ColorModeScript initialColorMode={darkTheme.config.initialColorMode} />

      <App />
    </FirebaseAppProvider>
  </React.StrictMode>
);

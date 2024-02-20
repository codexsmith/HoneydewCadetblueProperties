import React from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import { KanbanProvider } from "./kanban/KanbanContext";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <KanbanProvider>
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
        </KanbanProvider>
      </Router>
    </ChakraProvider>
  );
}
export default App;


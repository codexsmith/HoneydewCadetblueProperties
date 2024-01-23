import React, { createContext, useState } from 'react';

// Define the shape of your Kanban data here
const initialKanbanData = {
    columns: [
        { id: 'todo', title: 'To Do', cards: [] },
        { id: 'inProgress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
        // Add initial cards as needed
    ],
};

// Create the context
export const KanbanContext = createContext();

// Provider component
export const KanbanProvider = ({ children }) => {
    const [kanbanData, setKanbanData] = useState(initialKanbanData);

    // Define any methods to update your Kanban state here
    const updateKanbanData = (newData) => {
        setKanbanData(newData);
    };

    return (
        <KanbanContext.Provider value={{ kanbanData, updateKanbanData }}>
            {children}
        </KanbanContext.Provider>
    );
};

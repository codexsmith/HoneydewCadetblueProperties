import React, { createContext, useState, ReactNode } from "react";
// import { useDatabaseService } from "../database/FirebaseService";
import { KanbanContextType } from "../database/DataType";

const initialKanbanData = {
  tasks: [
    { id: "1", column: "todo", text: "TD Task 1" },
    { id: "2", column: "todo", text: "TD Task 2" },
    { id: "3", column: "in progress", text: "IP Task 3" },
    { id: "4", column: "in progress", text: "IP Task 4" },
    { id: "5", column: "done", text: "Task 5" },
  ],

  columnOrder: ["todo", "in progress", "done"],
  columns: [
    { id: "2", title: "todo" },
    { id: "2", title: "in progress" },
    { id: "2", title: "done" },
  ],
};

export const KanbanContext = createContext<KanbanContextType>({
  kanbanData: initialKanbanData,
  updateKanbanData: () => {},
});

interface KanbanProviderProps {
  children: ReactNode;
}

export const KanbanProvider = ({ children }: KanbanProviderProps) => {
  const [kanbanData, setKanbanData] = useState(initialKanbanData);

  //TODO integrate db
  // const db = useDatabaseService();

  const updateKanbanData = (
    partialData: Partial<KanbanContextType["kanbanData"]>
  ) => {
    setKanbanData((currentData) => ({
      ...currentData,
      ...partialData,
    }));
  };

  return (
    <KanbanContext.Provider value={{ kanbanData, updateKanbanData }}>
      {children}
    </KanbanContext.Provider>
  );
};

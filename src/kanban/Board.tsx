import React, { useRef, useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { KanbanContext } from "./KanbanContext";
import { CardType } from "../database/DataType";
import { useContext } from "react";
import Column from "./Column";
import { Box } from "@chakra-ui/react";
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { collection } from 'firebase/firestore';


function Board() {
  const firestore = useFirestore();

  const boardCollectionRef = collection(firestore, "boards");
  const { status: boardStatus, data: boardData } = useFirestoreCollectionData(boardCollectionRef, {
    idField: 'id'  // Automatically adds document ID to the data
  });

  // Assuming your tasks are stored in a 'tasks' collection
  const tasksCollectionRef = collection(firestore, "tasks");
  // Fetch tasks and listen for real-time updates
  const { status: tasksStatus, data: tasksData } = useFirestoreCollectionData(tasksCollectionRef, {
    idField: 'id'  // Automatically adds document ID to the data
  });

  // Assuming your columns are stored in a 'columns' collection
  const columnsCollectionRef = collection(firestore, "columns");
  // Fetch columns and listen for real-time updates
  const { status: columnsStatus, data: columnsData } = useFirestoreCollectionData(columnsCollectionRef, {
    idField: 'id'
  });
  
  // const { kanbanData, updateKanbanData } = useContext(KanbanContext);

  const moveTask = (
    taskId: string,
    sourceColumn: string,
    targetColumn: string
  ) => {
    if (
      sourceColumn === targetColumn ||
      !tasks.find((task) => task.id === taskId)
    ) {
      return;
    } else {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task.id === taskId) {
            // update the task
            return { ...task, column: targetColumn };
          }
          return task;
        });
        updateKanbanData({ tasks: updatedTasks });
        return updatedTasks;
      });
    }
  };

  const moveColumn = (draggedColumnName: string, hoverColumnName: string) => {
    const dragIndex = columnsOrder.indexOf(draggedColumnName);
    const hoverIndex = columnsOrder.indexOf(hoverColumnName);

    if (dragIndex === hoverIndex) {
      return;
    }

    const newColumnsOrder = [...columnsOrder];
    newColumnsOrder.splice(dragIndex, 1);
    newColumnsOrder.splice(hoverIndex, 0, draggedColumnName);
    updateKanbanData({ columnOrder: newColumnsOrder });

    setColumnsOrder(newColumnsOrder);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        display="flex"
        justifyContent="space-around"
        padding="20px"
        flexDirection={{ base: "column", md: "row" }}
        width="100%" 
        overflowX="auto"
      >
        {columnsOrder.map((columnName) => (
          <Column
            key={columnName}
            name={columnName}
            tasks={tasks.filter((t) => t.column === columnName)}
            moveTask={moveTask}
            moveColumn={moveColumn}
          />
        ))}
      </Box>
    </DndProvider>
  );
}

export default Board;

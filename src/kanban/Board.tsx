import React, { useRef, useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { KanbanContext } from "./KanbanContext";
import { CardType } from "../database/DataType";
import { useContext } from "react";
import Column from "./Column";
import { Box } from "@chakra-ui/react";

function Board() {
  const { kanbanData, updateKanbanData } = useContext(KanbanContext);

  const [tasks, setTasks] = useState<CardType[]>(kanbanData.tasks);
  const [columnsOrder, setColumnsOrder] = useState(kanbanData.columnOrder);

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
        flexDirection={{ base: "column", md: "row" }} // Stack vertically on small screens, horizontally on medium and up
        width="100%" // Fill the entire width
        overflowX="auto" // Allows scrolling on smaller screens
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

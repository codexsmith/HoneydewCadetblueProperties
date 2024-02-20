import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import Task from "./Task"; // Task component as before
import { CardType } from "../database/DataType";
import { Box, Text } from "@chakra-ui/react";

interface ColumnProps {
  name: string;
  tasks: CardType[];
  moveTask: (
    taskId: string,
    sourceColumn: string,
    targetColumn: string
  ) => void;
  moveColumn: (draggedColumnName: string, hoverColumnName: string) => void;
}

function Column({ name, tasks, moveTask, moveColumn }: ColumnProps) {
  const ref = useRef(null);

  // Setup for dropping tasks into this column
  const [, dropTask] = useDrop({
    accept: "task", // Specify that this drop target accepts tasks
    drop: (item: any) => {
      if (!ref.current) {
        return;
      }
      // name is the target column's name
      moveTask(item.id, item.sourceColumn, name);
    },
  });

  const [{ isDragging }, dragColumn] = useDrag({
    type: "column",
    item: { type: "column", name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, dropColumn] = useDrop({
    accept: "column",
    hover(item: { type: string; name: string }) {
      if (!ref.current) {
        return;
      }

      const draggedName = item.name;
      const hoverName = name;

      if (draggedName === hoverName) {
        return;
      }

      moveColumn(draggedName, hoverName);
    },
  });

  dropTask(ref);
  dragColumn(dropColumn(ref));

  return (
    <Box
      ref={ref}
      borderRadius="lg"
      border="1px"
      margin="0 10px"
      padding="10px"
      flex="1"
      opacity={isDragging ? 0.5 : 1}
      bg="gray.100"
      p={4}
      m={2}
      width="100%" // Fill the width of its parent flex container
      // maxWidth="300px" // Maximum width for each column
      boxShadow="md"
      display="flex"
      flexDirection="column"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        {name.toUpperCase()}
      </Text>

      {/* <h2>{name.toUpperCase()}</h2> */}
      {tasks.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </Box>
  );
}

export default Column;

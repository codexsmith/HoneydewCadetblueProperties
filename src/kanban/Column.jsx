import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import Task from "./Task";
import { Box, Text } from "@chakra-ui/react";

function Column({ columnName, columnId, tasks, moveTask, moveColumn }) {
  const ref = useRef(null);

  const [, dropTask] = useDrop(() => ({
    accept: "task",
    drop: (item) => {
      moveTask(item.id, item.sourceColumnId, columnId);
    },
  }));

  const [{ isDragging }, dragColumn] = useDrag(() => ({
    type: "column",
    item: { type: "column", id: columnId, title: columnName },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, dropColumn] = useDrop(() => ({
    accept: "column",
    hover: (item) => {
      const draggedId = item.id;
      const hoverId = columnId;

      if (draggedId === hoverId) {
        return;
      }

      moveColumn(draggedId, hoverId);
    },
  }));

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
      width="100%"
      boxShadow="md"
      display="flex"
      flexDirection="column"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        {columnName} - {columnId}
      </Text>

      {tasks?.length > 0 &&
        tasks?.map((task) => (
          <Task key={task.id} task={task} column={columnId} />
        ))}
    </Box>
  );
}

export default Column;

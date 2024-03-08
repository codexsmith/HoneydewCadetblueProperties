import React, { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import Task from "./Task";
import { Box, Text, IconButton, Flex } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import EditableTitle from "../components/EditableTitle";

function Column({
  columnName,
  columnId,
  tasks,
  moveTask,
  moveColumn,
  createTask,
  moveTaskWithinColumn,
}) {
  const ref = useRef(null);
  const [editMode, setEditMode] = useState(false);

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

  const handleDoubleClick = () => {
    setEditMode(true);
  };

  const handleTitleSubmit = (newTitle) => {
    // Here, you would update the column's title in your backend or state
    console.log(`New title for column ${columnId}: ${newTitle}`);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

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
      <Flex justifyContent="space-between">
        <div onDoubleClick={handleDoubleClick}>
          {editMode ? (
            <EditableTitle
              style={{ width: "100%" }}
              title={columnName}
              onSubmit={handleTitleSubmit}
              onCancel={handleCancel}
            />
          ) : (
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              {columnName} - {columnId}
            </Text>
          )}
        </div>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          height="100%"
        >
          <IconButton
            aria-label="Add task"
            icon={<AddIcon />}
            size="sm"
            onClick={createTask}
            variant="ghost"
          />
        </Box>
      </Flex>
      {tasks?.length > 0 &&
        tasks
          ?.sort((a, b) => {
            // Convert null or undefined to a large number to ensure they end up at the end
            let orderA =
              a.orderInColumn === null || a.orderInColumn === undefined
                ? Infinity
                : a.orderInColumn;
            let orderB =
              b.orderInColumn === null || b.orderInColumn === undefined
                ? Infinity
                : b.orderInColumn;

            return orderA - orderB;
          })
          .map((task) => (
            <Task
              key={task.id}
              task={task}
              column={columnId}
              moveTaskWithinColumn={moveTaskWithinColumn}
            />
          ))}
    </Box>
  );
}

export default Column;

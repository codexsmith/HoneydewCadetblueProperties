import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Textarea, Button } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons"; // Assuming you want to use a delete icon from Chakra UI

function TaskCard({ task, deleteTask, updateTask }) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(true);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    border: "1px solid black",
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <Box
        ref={setNodeRef}
        style={style}
        opacity="0.3"
        bg="mainBackgroundColor"
        p="2.5"
        h="100px"
        minH="100px"
        rounded="xl"
        border="2px"
        borderColor="rose.500"
        cursor="grab"
      />
    );
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      bg="mainBackgroundColor"
      p="2.5"
      h="100px"
      minH="100px"
      rounded="xl"
      cursor="grab"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      onClick={!editMode ? toggleEditMode : undefined}
    >
      {editMode ? (
        <Textarea
          h="90%"
          w="full"
          resize="none"
          bg="transparent"
          color="white"
          _focus={{ outline: "none" }}
          value={task.title}
          autoFocus
          onBlur={toggleEditMode}
          onChange={(e) => updateTask(task.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              toggleEditMode();
            }
          }}
        />
      ) : (
        <p style={{ height: "90%", width: "full", overflowY: "auto" }}>
          {task.title}
        </p>
      )}

      {mouseIsOver && (
        <Button
          onClick={() => deleteTask(task.id)}
          position="absolute"
          right="4"
          top="50%"
          transform="translateY(-50%)"
          bg="columnBackgroundColor"
          p="2"
          rounded="full"
          opacity="0.6"
          _hover={{ opacity: "1" }}
        >
          <DeleteIcon />
        </Button>
      )}
    </Box>
  );
}

export default TaskCard;

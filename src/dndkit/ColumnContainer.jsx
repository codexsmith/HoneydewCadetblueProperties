import { useState, useMemo } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Button, Flex, Input } from "@chakra-ui/react";
import TaskCard from "./TaskCard";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
}) {
  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    border: "1px solid black",
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      width="350px" //change to flex width
      bg="columnBackgroundColor"
      rounded="md"
      flexDir="column"
      className={isDragging ? "opacity-40 border-2 border-pink-500" : ""}
    >
      <Flex
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        bg="mainBackgroundColor"
        h="60px"
        alignItems="center"
        justifyContent="space-between"
        p="3"
        border="4px"
        borderColor="columnBackgroundColor"
        roundedTop="md"
      >
        <Flex gap="2">
          <Box
            bg="columnBackgroundColor"
            px="2"
            py="1"
            rounded="full"
            text="sm"
          >
            0
          </Box>
          {!editMode ? (
            column.title
          ) : (
            <Input
              bg="black"
              borderColor="rose.500"
              _focus={{ borderColor: "rose.500" }}
              rounded="md"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditMode(false)}
            />
          )}
        </Flex>
        <Button onClick={() => deleteColumn(column.id)} p="1" variant="ghost">
          <DeleteIcon />
        </Button>
      </Flex>
      <Box gap="2" flex="1" overflowY="auto" p="2">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </Box>
      <Button
        onClick={() => createTask(column.id)}
        m="4"
        leftIcon={<AddIcon />}
      >
        Add task
      </Button>
    </Box>
  );
}

export default ColumnContainer;

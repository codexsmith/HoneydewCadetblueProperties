import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import Task from "./Task"; // Task component as before
import { Box, Text } from "@chakra-ui/react";

function Column({ column, tasks, moveTask, moveColumn }) {
  const ref = useRef(null);
  // Setup for dropping tasks into this column

  const [, dropTask] = useDrop(() => ({
    accept: "task", // Accepting tasks
    drop: (item) => {
      // Assuming `item` contains `id` for the task ID and `sourceColumnId` for where it was dragged from
      moveTask(item.id, item.sourceColumnId, column.id); // Pass task ID, source column ID, and target column ID
    },
  })); // React to changes in column

  // const [, dropTask] = useDrop(
  //   () => ({
  //     accept: "task",
  //     drop: (item, monitor) => {
  //       if (!monitor.didDrop() && columnRef.current) {
  //         // Now we have column.id available for use here
  //         moveTask(item.id, item.sourceColumnId, column.id, item.boardId); // Adjusted to pass column ID and board ID
  //       }
  //     },
  //   }),
  //   [column]
  // ); // Ensure column is a dependency if it might change

  // const [, dropTask] = useDrop({
  //   accept: "task", // Specify that this drop target accepts tasks
  //   drop: (item) => {
  //     if (!ref.current) {
  //       return;
  //     }
  //     // name is the target column's name
  //     // (taskId, sourceColumnId, targetColumnId)
  //     moveTask(item.id, item.sourceColumn.id, column.id);
  //   },
  // });

  const [{ isDragging }, dragColumn] = useDrag(() => ({
    type: "column", // Type of draggable item
    item: { id: column.id, title: column.title }, // Pass column ID and title
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(), // Collect dragging state
    }),
  }));
  // const [{ isDragging }, dragColumn] = useDrag(
  //   () => ({
  //     type: "column",
  //     item: { type: "column", id: column.id, name: column.name }, // Adjusted to pass both ID and name
  //     collect: (monitor) => ({
  //       isDragging: !!monitor.isDragging(),
  //     }),
  //   }),
  //   [column]
  // ); // Ensure column is a dependency if it might change
  // const [{ isDragging }, dragColumn] = useDrag({
  //   type: "column",
  //   item: { type: "column", column },
  //   collect: (monitor) => ({
  //     isDragging: !!monitor.isDragging(),
  //   }),
  // });
  // Adjusting the useDrop hook for columns

  const [, dropColumn] = useDrop(() => ({
    accept: "column", // Only accept columns
    hover: (item) => {
      const draggedId = item.id; // ID of the dragged column
      const hoverId = column.id; // ID of the target column

      if (draggedId === hoverId) {
        return; // Exit if the columns are the same
      }

      moveColumn(draggedId, hoverId); // Perform the column reorder operation
      item.id = hoverId; // Update the dragged item's ID to the new position
    },
  })); // React to changes in column

  // const [, dropColumn] = useDrop(
  //   () => ({
  //     accept: "column",
  //     hover: (item, monitor) => {
  //       if (!monitor.didDrop() && columnRef.current) {
  //         const draggedId = item.id;
  //         const hoverId = column.id;

  //         if (draggedId === hoverId) {
  //           return;
  //         }

  //         moveColumn(draggedId, hoverId);
  //         item.index = column.index; // Assuming you're tracking column index for reordering
  //       }
  //     },
  //   }),
  //   [column]
  // ); // Ensure column is a dependency if it might change
  // const [, dropColumn] = useDrop({
  //   accept: "column",
  //   hover(item) {
  //     if (!ref.current) {
  //       return;
  //     }

  //     const draggedName = item.column.title;
  //     const hoverName = column.title;

  //     if (draggedName === hoverName) {
  //       return;
  //     }

  //     moveColumn(draggedName, hoverName);
  //   },
  // });

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
        {column.title}
      </Text>

      {/* <h2>{name.toUpperCase()}</h2> */}
      {tasks?.length > 0 &&
        tasks?.map((task) => (
          <Task key={task.id} task={task} column={column.id} />
        ))}
    </Box>
  );
}

export default Column;

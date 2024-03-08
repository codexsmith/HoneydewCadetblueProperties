import React, { useRef, useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Card, CardBody, CardFooter, CardHeader } from "@chakra-ui/react";

function Task({ task, column, moveTaskWithinColumn }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "task",
    item: {
      id: task.id,
      sourceColumnId: column,
      order: task.orderInColumn,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, dropRef] = useDrop({
    accept: "task",
    hover(item, monitor) {
      if (item.id === task.id) {
        return;
      }
      const dragIndex = item.order;
      const hoverIndex = task.orderInColumn;

      // Move the task in the column
      moveTaskWithinColumn(dragIndex, hoverIndex, item.sourceColumnId);
      item.index = hoverIndex; // Update the index for dragged item
    },
  });

  const ref = useRef(null);
  const combinedRef = useCallback(
    (node) => {
      dragRef(node);
      dropRef(node);
      ref.current = node;
    },
    [dragRef, dropRef]
  );

  return (
    <Card
      ref={combinedRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: "1px",
        margin: "2px 0",
        backgroundColor: "#ddd",
        cursor: "move",
        height: "120px",
      }}
      width="100%"
    >
      <CardHeader p="1">{task.name}</CardHeader>
      <CardBody>
        <div>{task.text}</div>
        <div>{task.description}</div>
      </CardBody>
      {/* <CardFooter>footer</CardFooter> */}
    </Card>
  );
}

export default Task;

import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Card, CardBody, CardFooter, CardHeader } from "@chakra-ui/react";
import { GridLayout } from "@amcharts/amcharts5";

function Task({ task, column, moveTaskWithinColumn, moveTaskBetweenColumns }) {
  const ref = useRef(null);
  let prevHoverIndex = useRef(-1);

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "task",
    item: {
      type: "task",
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
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.order;
      const hoverIndex = task.orderInColumn;
      // Don't replace items with themselves or if the source column is different
      if (item.id === task.id || item.sourceColumnId !== column) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the item's height.
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveTaskWithinColumn(dragIndex, hoverIndex, item.sourceColumnId);

      // Note: we're mutating the monitor item here!
      // Generally, it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.order = hoverIndex;
      task.orderInColumn = dragIndex;
    },
    drop: (item, monitor) => {
      if (!monitor.didDrop() && item.sourceColumnId !== column) {
        // Perform any actions required to finalize the move
        // This is a good place to make API calls or update global state
        moveTaskBetweenColumns(item.id, item.sourceColumnId, column);
      }
    },
  });

  dragRef(dropRef(ref));

  return (
    <Card
      bg={"gray"}
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: "1px",
        margin: "2px 0",
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

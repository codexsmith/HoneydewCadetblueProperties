import React from "react";
import { useDrag } from "react-dnd";
import { CardType } from "../database/DataType";
import { Card, CardBody, CardFooter, CardHeader } from "@chakra-ui/react";

interface TaskProps {
  task: CardType;
}

function Task({ task }: TaskProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id, sourceColumn: task.column },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Card
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: "10px",
        margin: "10px 0",
        backgroundColor: "#ddd",
        cursor: "move",
      }}
      width="100%" // Ensure each task fills the width of its column
    >
      {/* <CardHeader>Header</CardHeader> */}
      <CardBody>{task.text}</CardBody>
      {/* <CardFooter>footer</CardFooter> */}
    </Card>
  );
}

export default Task;

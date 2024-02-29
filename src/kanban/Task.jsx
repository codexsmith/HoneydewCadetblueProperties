import React from "react";
import { useDrag } from "react-dnd";
import { Card, CardBody, CardFooter, CardHeader } from "@chakra-ui/react";

function Task({ task, column }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id, sourceColumnId: column },
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
      width="100%"
    >
      <CardHeader>{task.name}</CardHeader>
      <CardBody>
        <div>{task.text}</div>
        <div>{task.description}</div>
      </CardBody>
      {/* <CardFooter>footer</CardFooter> */}
    </Card>
  );
}

export default Task;

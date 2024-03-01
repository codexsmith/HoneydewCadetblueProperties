import React, { useMemo, useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Column from "./Column";
import { Box, Button } from "@chakra-ui/react";
import {
  useFirestore,
  useFirestoreCollectionData,
  useFirestoreDocData,
} from "reactfire";
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  VStack,
} from "@chakra-ui/react";

function Board({ boardId }) {
  const firestore = useFirestore();

  const boardRef = useMemo(() => doc(firestore, "boards", boardId));

  const { status: boardStatus, data: kanbanBoard } = useFirestoreDocData(
    boardRef,
    {
      idField: "id",
    }
  );

  const mappingsRef = useMemo(() =>
    collection(firestore, "boardcolumncardmapping")
  );

  const q = query(mappingsRef, where("boardRef", "==", boardRef));
  const { status: boardColumnCardMapStatus, data: boardColumnCardMap } =
    useFirestoreCollectionData(q, { idField: "id" });

  const cardsCollectionRef = useMemo(() => collection(firestore, "cards"));
  const { status: cardsStatus, data: cardsData } = useFirestoreCollectionData(
    cardsCollectionRef,
    {
      idField: "id",
    }
  );

  const columnsCollectionRef = useMemo(() => collection(firestore, "columns"));
  const { status: columnsStatus, data: columnsData } =
    useFirestoreCollectionData(columnsCollectionRef, {
      idField: "id",
    });

  const createNewColumn = async () => {
    try {
      const newColumnRef = await addDoc(columnsCollectionRef, {
        title: "New Column",
      });

      const updatedColumnOrder = [newColumnRef.id, ...kanbanBoard.columnOrder];

      updateDoc(boardRef, {
        columnOrder: updatedColumnOrder,
      });
      kanbanBoard.columnOrder = updatedColumnOrder;
    } catch (error) {
      console.error("Error creating column: ", error);
    }
  };

  const moveTask = async (taskId, sourceColumnId, targetColumnId) => {
    const targetColumnRef = doc(firestore, "columns", targetColumnId);
    const sourceColumnRef = doc(firestore, "columns", sourceColumnId);

    const q = query(
      mappingsRef,
      where("cardRef", "==", taskId),
      where("boardRef", "==", boardRef),
      where("columnRef", "==", sourceColumnRef)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return;
    }

    querySnapshot.forEach((docSnapshot) => {
      const mappingDocRef = doc(
        firestore,
        "boardcolumncardmapping",
        docSnapshot.id
      );
      updateDoc(mappingDocRef, {
        columnRef: targetColumnRef,
      })
        .then(() => {
          console.log("Document successfully updated!");
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    });
  };

  const moveColumn = (draggedColumnId, hoverColumnId) => {
    const newColumnOrder = kanbanBoard.columnOrder;
    const fromIndex = newColumnOrder.indexOf(draggedColumnId);
    const toIndex = newColumnOrder.indexOf(hoverColumnId);
    if (fromIndex >= 0 && toIndex >= 0) {
      newColumnOrder.splice(fromIndex, 1); // Remove
      newColumnOrder.splice(toIndex, 0, draggedColumnId); // Insert
    }

    updateDoc(boardRef, {
      columnOrder: newColumnOrder,
    });

    kanbanBoard.columnOrder = newColumnOrder;
  };

  if (
    boardStatus === "success" &&
    cardsData.length > 0 &&
    cardsStatus === "success" &&
    columnsData.length > 0 &&
    columnsStatus === "success" &&
    boardColumnCardMap.length > 0 &&
    boardColumnCardMapStatus === "success" &&
    kanbanBoard != undefined
  ) {
    return (
      <Card
        display="flex"
        flex="1"
        flexDirection="column"
        boxShadow="md"
        p="0"
        borderRadius="md"
        width="fit-content"
        height="99%"
      >
        <CardHeader>
          <Heading size="lg" m="4">
            {kanbanBoard.title}
          </Heading>
          <Button onClick={createNewColumn} colorScheme="teal" size="md">
            + Add Column
          </Button>
        </CardHeader>

        <CardBody
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: "1",
              justifyContent: "space-around",
              flexDirection: "{{ base: 'column', md: 'row' }}",
            }}
          >
            <DndProvider
              backend={HTML5Backend}
              style={{
                border: "1px solid red",
                display: "flex",
                flex: "1",
                justifyContent: "space-around",
                p: "20px",
                flexDirection: "{{ base: 'column', md: 'row' }}",
              }}
            >
              {kanbanBoard.columnOrder.map((columnId) => {
                let targetColumnRef = doc(firestore, "columns", columnId);
                let bccmap = boardColumnCardMap
                  .filter((t) => t.columnRef.id == targetColumnRef.id)
                  .map((filteredMapping) => filteredMapping.cardRef);

                return (
                  <Column
                    key={columnId}
                    columnName={
                      columnsData.filter(
                        (col) => col.id == targetColumnRef.id
                      )[0].title
                    }
                    columnId={targetColumnRef.id}
                    tasks={cardsData.filter((task) => {
                      return bccmap.indexOf(task.id) != -1;
                    })}
                    moveTask={moveTask}
                    moveColumn={moveColumn}
                  />
                );
              })}
            </DndProvider>
          </div>
        </CardBody>
      </Card>
    );
  } else {
    return <div>loading</div>;
  }
}

export default Board;

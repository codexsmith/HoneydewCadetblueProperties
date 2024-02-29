import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Column from "./Column";
import { Box, Button } from "@chakra-ui/react";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  updateDoc,
  addDoc,
  arrayUnion,
} from "firebase/firestore";

function Board() {
  const firestore = useFirestore();
  const [board, setBoard] = useState();

  const boardCollectionRef = collection(firestore, "boards");
  const { status: boardStatus, data: boardData } = useFirestoreCollectionData(
    boardCollectionRef,
    {
      idField: "id",
    }
  );
  useEffect(() => {
    setBoard(boardData[0]);
  }, [boardData]);

  let boardColumnCardMap = [];
  let boardColumnCardMapStatus = "loading";
  if (boardStatus === "success" && boardData.length > 0) {
    const mappingsRef = collection(firestore, "boardcolumncardmapping");
    if (!board) {
      //TODO ADD dropdown for user select board
      setBoard(boardData[0]);
    }

    const boardRef = doc(firestore, "boards", boardData[0].id);
    const q = query(mappingsRef, where("boardRef", "==", boardRef));
    const { status: innerStatus, data: innerData } = useFirestoreCollectionData(
      q,
      { idField: "id" }
    );

    boardColumnCardMap = innerData;
    boardColumnCardMapStatus = innerStatus;
  }

  const cardsCollectionRef = collection(firestore, "cards");
  const { status: cardsStatus, data: cardsData } = useFirestoreCollectionData(
    cardsCollectionRef,
    {
      idField: "id",
    }
  );

  const columnsCollectionRef = collection(firestore, "columns");
  const { status: columnsStatus, data: columnsData } =
    useFirestoreCollectionData(columnsCollectionRef, {
      idField: "id",
    });

  const createNewColumn = async () => {
    try {
      // Step 1: Create a new column
      const newColumnRef = await addDoc(collection(firestore, "columns"), {
        title: "New Column", // Set initial properties for the column
        // Add any other column initialization properties here
      });

      // Step 2: Update the board's columnOrder to include the new column
      const boardDocRef = doc(firestore, "boards", board.id); // Assuming `board` is your current board state

      const updatedColumnOrder = [newColumnRef.id, ...board.columnOrder];
      await updateDoc(boardDocRef, { columnOrder: updatedColumnOrder });
      
    } catch (error) {
      console.error("Error creating column: ", error);
    }
  };

  const moveTask = async (taskId, sourceColumnId, targetColumnId) => {
    const targetColumnRef = doc(firestore, "columns", targetColumnId);
    const sourceColumnRef = doc(firestore, "columns", sourceColumnId);

    const boardRef = doc(firestore, "boards", board.id);

    const mappingsRef = collection(firestore, "boardcolumncardmapping");
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

  const moveColumn = async (draggedColumnId, hoverColumnId) => {
    const boardDocRef = doc(firestore, "boards", board.id);

    const newColumnOrder = board?.columnOrder;
    const fromIndex = newColumnOrder.indexOf(draggedColumnId);
    const toIndex = newColumnOrder.indexOf(hoverColumnId);
    if (fromIndex >= 0 && toIndex >= 0) {
      newColumnOrder.splice(fromIndex, 1); // Remove
      newColumnOrder.splice(toIndex, 0, draggedColumnId); // Insert
    }

    await updateDoc(boardDocRef, {
      columnOrder: newColumnOrder,
    });
  };

  if (
    boardData.length > 0 &&
    boardStatus === "success" &&
    cardsData.length > 0 &&
    cardsStatus === "success" &&
    columnsData.length > 0 &&
    columnsStatus === "success" &&
    boardColumnCardMap.length > 0 &&
    boardColumnCardMapStatus === "success" &&
    board != undefined
  ) {
    return (
      <DndProvider backend={HTML5Backend}>
        <Box
          display="flex"
          justifyContent="space-around"
          padding="20px"
          flexDirection={{ base: "column", md: "row" }}
          width="100%"
          overflowX="auto"
        >
          {board.columnOrder.map((columnId) => {
            let targetColumnRef = doc(firestore, "columns", columnId);
            let bccmap = boardColumnCardMap
              .filter((t) => t.columnRef.id == targetColumnRef.id)
              .map((filteredMapping) => filteredMapping.cardRef);

            return (
              <Column
                key={columnId}
                columnName={
                  columnsData.filter((col) => col.id == targetColumnRef.id)[0]
                    .title
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
          ;
          <Button
            onClick={createNewColumn}
            colorScheme="teal"
            position="absolute"
            bottom="20px"
            left="20px"
          >
            + Add Column
          </Button>
        </Box>
      </DndProvider>
    );
  } else {
    return <div>loading</div>;
  }
}

export default Board;

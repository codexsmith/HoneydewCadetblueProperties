import React, { useRef, useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { KanbanContext } from "./KanbanContext";
import { useContext } from "react";
import Column from "./Column";
import { Box } from "@chakra-ui/react";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

function Board() {
  const firestore = useFirestore();
  const [boardId, setBoardId] = useState();

  // First query to fetch the board
  const boardCollectionRef = collection(firestore, "boards");
  const { status: boardStatus, data: boardData } = useFirestoreCollectionData(
    boardCollectionRef,
    {
      idField: "id", // Automatically adds document ID to the data
    }
  );

  let boardColumnCardMap = [];
  let mappingsStatus = "loading";

  // Conditional logic to ensure boardData is loaded before querying mappings
  if (boardStatus === "success" && boardData.length > 0) {
    const mappingsRef = collection(firestore, "boardcolumncardmapping");
    // Assuming you want to query mappings for the first board's ID
    if (!boardId) {
      setBoardId(boardData[0].id);
    }

    const boardRef = doc(firestore, "boards", boardData[0].id);

    const q = query(mappingsRef, where("boardRef", "==", boardRef));

    const { status: innerStatus, data: innerData } = useFirestoreCollectionData(
      q,
      { idField: "id" }
    );

    boardColumnCardMap = innerData;
    mappingsStatus = innerStatus;
  }

  // Assuming your tasks are stored in a 'tasks' collection
  const cardsCollectionRef = collection(firestore, "cards");
  // Fetch tasks and listen for real-time updates
  const { status: cardsStatus, data: cardsData } = useFirestoreCollectionData(
    cardsCollectionRef,
    {
      idField: "id", // Automatically adds document ID to the data
    }
  );

  // Assuming your columns are stored in a 'columns' collection
  const columnsCollectionRef = collection(firestore, "columns");
  // Fetch columns and listen for real-time updates
  const { status: columnsStatus, data: columnsData } =
    useFirestoreCollectionData(columnsCollectionRef, {
      idField: "id",
    });

  // const { kanbanData, updateKanbanData } = useContext(KanbanContext);

  const moveTask = async (taskId, sourceColumnId, targetColumnId) => {
    // References to the source and target columns
    const targetColumnRef = doc(firestore, "columns", targetColumnId);
    const boardRef = doc(firestore, "boards", boardId);

    // Find the specific mapping document for the task within the given board
    const mappingsRef = collection(firestore, "boardcolumncardmapping");
    const q = query(
      mappingsRef,
      where("cardRef", "==", taskId),
      where("boardRef", "==", boardRef),
      where("columnRef", "==", sourceColumnId) // Ensure we're updating the correct current column
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return;
    }

    // Update the found mapping document(s) to point to the new column
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

  const moveColumn = (draggedColumnName, hoverColumnName) => {
    // const dragIndex = columnsOrder.indexOf(draggedColumnName);
    // const hoverIndex = columnsOrder.indexOf(hoverColumnName);
    // if (dragIndex === hoverIndex) {
    //   return;
    // }
    // const newColumnsOrder = [...columnsOrder];
    // newColumnsOrder.splice(dragIndex, 1);
    // newColumnsOrder.splice(hoverIndex, 0, draggedColumnName);
    // updateKanbanData({ columnOrder: newColumnsOrder });
    // setColumnsOrder(newColumnsOrder);
    return;
  };

  if (
    boardData.length > 0 &&
    boardStatus === "success" &&
    cardsData.length > 0 &&
    cardsStatus === "success" &&
    columnsData.length > 0 &&
    columnsStatus === "success" &&
    boardColumnCardMap.length > 0 &&
    mappingsStatus === "success"
  ) {
    let theBoard = boardData[0];

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
          {theBoard.columnOrder.map((columnId) => {
            let bccmap = boardColumnCardMap
              .filter((t) => t.columnRef === columnId)
              .map((filteredMapping) => filteredMapping.cardRef);

            return (
              <Column
                key={columnId}
                column={columnsData.filter((c) => c.id === columnId)[0]}
                tasks={cardsData.filter((task) => {
                  return bccmap.indexOf(task.id) != -1;
                })}
                moveTask={moveTask}
                moveColumn={moveColumn}
              />
            );
          })}
          ;
        </Box>
      </DndProvider>
    );
  } else {
    return <div>loading</div>;
  }
}

export default Board;

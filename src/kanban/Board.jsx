import React, { useMemo, useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Column from "./Column";
import { Box, Button, DarkMode } from "@chakra-ui/react";
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
  //insert refresh triggers to reduce unneccessary data calls
  const [boardRefreshTrigger, setBoardRefreshTrigger] = useState(0);
  const [mappingRefreshTrigger, setMappingRefreshTrigger] = useState(0);
  const [cardRefreshTrigger, setCardRefreshTrigger] = useState(0);
  const [columnRefreshTrigger, setcolumnRefreshTrigger] = useState(0);

  const [boardData, setBoardData] = useState([]);
  const [mappingData, setMappingData] = useState([]);
  const [cardsState, setCardsState] = useState([]);
  const [columnData, setcolumnData] = useState([]);

  const boardRef = useMemo(() => doc(firestore, "boards", boardId));

  const { status: boardStatus, data: kanbanBoard } = useFirestoreDocData(
    boardRef,
    {
      idField: "id",
      dependencies: [boardRefreshTrigger],
    }
  );

  const mappingsRef = useMemo(() =>
    collection(firestore, "boardcolumncardmapping")
  );

  //inline query
  //   const prizeListRef = firestore
  //     .collection('prizes')
  //     .limit(3)
  //     .where('year', '==', year)
  //     .where('weekNumber', '==', weekNumber);

  // const  { status, data, error } = useFirestoreCollectionData(prizeListRef);

  const mapping_q = query(mappingsRef, where("boardRef", "==", boardRef));
  const { status: boardColumnCardMapStatus, data: boardColumnCardMap } =
    useFirestoreCollectionData(mapping_q, {
      idField: "id",
      dependencies: [mappingRefreshTrigger],
    });

  const cardsCollectionRef = useMemo(() => collection(firestore, "cards"));
  const { status: cardsStatus, data: cardsData } = useFirestoreCollectionData(
    cardsCollectionRef,
    {
      idField: "id",
      dependencies: [cardRefreshTrigger],
    }
  );

  useEffect(() => {
    setCardsState(cardsData);
  }, [cardsData]);

  const columnsCollectionRef = useMemo(() => collection(firestore, "columns"));
  const { status: columnsStatus, data: columnsData } =
    useFirestoreCollectionData(columnsCollectionRef, {
      idField: "id",
      dependencies: [columnRefreshTrigger],
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

  const moveTaskBetweenColumns = async (
    taskId,
    sourceColumnId,
    targetColumnId
  ) => {
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

  const moveTaskWithinColumn = (
    dragIndex,
    hoverIndex,
    sourceColumnId,
    isDrop
  ) => {
    // Retrieve all tasks in the source column from the boardColumnCardMap and cardsData
    const columnTasks = boardColumnCardMap
      .filter((mapping) => mapping.columnRef.id === sourceColumnId)
      .map((mapping) => {
        const cardData = cardsState.find((card) => card.id === mapping.cardRef);
        return {
          ...cardData,
          mappingId: mapping.id,
        };
      });

    // Sort tasks by orderInColumn to ensure we're working with the correct order
    columnTasks.sort((a, b) => a.orderInColumn - b.orderInColumn);

    // Move the task within the array
    const [removed] = columnTasks.splice(dragIndex, 1);
    columnTasks.splice(hoverIndex, 0, removed);
    // Update the orderInColumn for each task based on its new index

    columnTasks.forEach((task, index) => {
      task.orderInColumn = index;
      // if (isDrop) {
      const taskRef = doc(firestore, "cards", task.id);
      updateDoc(taskRef, { orderInColumn: index });
      // }
    });

    const updatedCardsData = cardsState.map((card) => {
      // Find the updated task from columnTasks
      const updatedTask = columnTasks.find((task) => task.id === card.id);
      // If this card has been updated, return the updated task, else return the card as is
      return updatedTask
        ? { ...card, orderInColumn: updatedTask.orderInColumn }
        : card;
    });

    // Now, update the state with the newly formed array

    // cardsData.indexOf();

    setCardsState(updatedCardsData);

    // if (isDrop) {
    //   setCardRefreshTrigger((prev) => prev + 1);
    // }
  };

  const createNewTaskInFirebase = async (columnId) => {
    try {
      // Step 1: Create a new task in the 'cards' collection
      const newTaskRef = await addDoc(cardsCollectionRef, {
        name: "New Task", // Set your initial task properties here
        description: "test", // Example additional field
        orderInColumn: "0",
      });

      // Step 2: Update the board-column-card mapping to include the new task
      await addDoc(mappingsRef, {
        cardRef: newTaskRef.id, // Reference to the new task document
        columnRef: doc(firestore, "columns", columnId), // Reference to the column document
        boardRef: boardRef, // Reference to the current board
      });
    } catch (error) {
      console.error("Error creating task: ", error);
    }
  };

  const dataIsReady =
    boardStatus === "success" &&
    cardsData.length > 0 &&
    cardsStatus === "success" &&
    cardsState &&
    columnsData.length > 0 &&
    columnsStatus === "success" &&
    boardColumnCardMap.length > 0 &&
    boardColumnCardMapStatus === "success" &&
    kanbanBoard !== undefined;

  if (dataIsReady) {
    return (
      <Card
        m="0 1px"
        display="flex"
        flex="1"
        flexDirection="column"
        overflow="auto"
        height="100vh"
        boxShadow="md"
        p="0"
        borderRadius="md"
        minwidth="fit-content"
        minHeight="fit-content"
        bg={"lightgrey"}
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
                const targetColumnRef = doc(firestore, "columns", columnId);
                const bccmap = boardColumnCardMap
                  .filter((t) => t.columnRef.id == targetColumnRef.id)
                  .map((filteredMapping) => filteredMapping.cardRef);

                const columns = columnsData.filter(
                  (col) => col.id == targetColumnRef.id
                )[0].title;
                return (
                  <Column
                    key={columnId}
                    columnName={columns}
                    columnId={targetColumnRef.id}
                    tasks={cardsState.filter((task) => {
                      return bccmap.indexOf(task.id) != -1;
                    })}
                    moveTask={moveTaskBetweenColumns}
                    moveColumn={moveColumn}
                    createTask={() => createNewTask(columnId)}
                    moveTaskWithinColumn={moveTaskWithinColumn}
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

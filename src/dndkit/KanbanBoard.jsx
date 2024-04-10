import { useState, useMemo, useEffect } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ColumnContainer from "./ColumnContainer";
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
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

// Example column and task data
const defaultCols = [
  { id: "todo", title: "Todo" },
  // Add more columns as needed
];

const defaultTasks = [
  { id: "1", columnId: "todo", content: "Task Example" },
  // Add more tasks as needed
];

function KanbanBoard({ boardId }) {
  const firestore = useFirestore();

  const boardRef = useMemo(() => doc(firestore, "boards", boardId));

  const { status: boardStatus, data: kanbanBoard } = useFirestoreDocData(
    boardRef,
    {
      idField: "id",
      //   dependencies: [boardRefreshTrigger],
    }
  );

  const mappingsRef = useMemo(() =>
    collection(firestore, "boardcolumncardmapping")
  );

  const mapping_q = query(mappingsRef, where("boardRef", "==", boardRef));
  const { status: boardColumnCardMapStatus, data: boardColumnCardMap } =
    useFirestoreCollectionData(mapping_q, {
      idField: "id",
      //   dependencies: [mappingRefreshTrigger],
    });

  const cardsCollectionRef = useMemo(() => collection(firestore, "cards"));
  const { status: cardsStatus, data: cardsData } = useFirestoreCollectionData(
    cardsCollectionRef,
    {
      idField: "id",
      //   dependencies: [cardRefreshTrigger],
    }
  );

  useEffect(() => {
    const temp = boardColumnCardMap.map((bcc) => bcc.cardRef);
    setTasks(cardsData.filter((card) => temp.includes(card.id)));
  }, [cardsData]);

  const columnsCollectionRef = useMemo(() => collection(firestore, "columns"));
  const { status: columnsStatus, data: columnsData } =
    useFirestoreCollectionData(columnsCollectionRef, {
      idField: "id",
      //   dependencies: [columnRefreshTrigger],
    });

  //====================================================================
  useEffect(() => {
    const temp = boardColumnCardMap.map((bcc) => bcc.columnRef.id);
    setColumns(columnsData.filter((column) => temp.includes(column.id)));
  }, [columnsData]);

  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );

  return (
    <Box
      m="auto"
      display="flex"
      minH="100vh"
      w="full"
      alignItems="center"
      overflowX="auto"
      overflowY="hidden"
      px="10"
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <Box m="auto" display="flex" gap="4">
          <SortableContext items={columns.map((col) => col.id)}>
            {columns.map((column) => {
              const taskIdsForColumn = boardColumnCardMap
                .filter((mapping) => mapping.columnRef.id === column.id)
                .map((mapping) => mapping.cardRef);

              return (
                <ColumnContainer
                  style={{ border: "1px solid black" }}
                  key={column.id}
                  column={column}
                  tasks={tasks.filter((task) =>
                    taskIdsForColumn.includes(task.id)
                  )}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              );
            })}
          </SortableContext>
          <IconButton
            icon={<AddIcon />}
            onClick={() => createNewColumn()}
            aria-label="Add Column"
            variant="outline"
          />
        </Box>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </Box>
  );

  async function createNewTaskInFirebase(columnId, newTask) {
    try {
      // Step 1: Create a new task in the 'cards' collection
      const newTaskRef = await addDoc(cardsCollectionRef, newTask);

      //     {
      //     name: "New Task", // Set your initial task properties here
      //     description: "test", // Example additional field
      //     orderInColumn: "0",
      //   });

      // Step 2: Update the board-column-card mapping to include the new task
      await addDoc(mappingsRef, {
        cardRef: newTaskRef.id, // Reference to the new task document
        columnRef: doc(firestore, "columns", columnId), // Reference to the column document
        boardRef: boardRef, // Reference to the current board
      });
    } catch (error) {
      console.error("Error creating task: ", error);
    }
  }

  function createTask(columnId) {
    const newTask = {
      name: "new",
      description: "replace me",
      orderInColumn: 0,
    };

    createNewTaskInFirebase(columnId, newTask);

    setTasks([...tasks, newTask]);
  }

  function deleteTask(id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function updateTask(id, content) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
  }

  const createNewColumnInFirebase = async () => {
    try {
      const newColumnRef = await addDoc(columnsCollectionRef, {
        title: "New Column",
      });

      const updatedColumnOrder = [newColumnRef.id, ...kanbanBoard.columnOrder];

      updateDoc(boardRef, {
        columnOrder: updatedColumnOrder,
      });
      //   kanbanBoard.columnOrder = updatedColumnOrder;
    } catch (error) {
      console.error("Error creating column: ", error);
    }
  };

  function createNewColumn() {
    createNewColumnInFirebase();
    // setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  }

  function updateColumn(id, title) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function onDragStart(event) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    console.log("DRAG END");

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;
    console.log("Type ", active.data.current?.type);
    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      console.log("on drag task over task", active.data.current?.type);
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      console.log("on drag task over column");
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        console.log("DROPPING TASK OVER COLUMN", { activeIndex });
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;

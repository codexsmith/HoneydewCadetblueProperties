import React from "react";
import Board from "./Board";
import KanbanBoard from "../dndkit/KanbanBoard";

function BoardContainer() {
  //   const firestore = useFirestore();

  //   const boardCollectionRef = collection(firestore, "boards");
  //   const { status: boardStatus, data: boardData } = useFirestoreCollectionData(
  //     boardCollectionRef,
  //     {
  //       idField: "id",
  //     }g  
  //   );

  const boardId = "kHs1NpKPB9Gf6Uv6mOuT";

  // return <Board boardId={boardId} />;
  return <KanbanBoard boardId={boardId} />;
}

export default BoardContainer;

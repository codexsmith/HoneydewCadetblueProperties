import React from "react";
import Board from "./Board";
import { Box } from "@chakra-ui/react";

function BoardContainer() {
  //   const firestore = useFirestore();

  //   const boardCollectionRef = collection(firestore, "boards");
  //   const { status: boardStatus, data: boardData } = useFirestoreCollectionData(
  //     boardCollectionRef,
  //     {
  //       idField: "id",
  //     }
  //   );

  const boardId = "kHs1NpKPB9Gf6Uv6mOuT";

  return <Board boardId={boardId} />;
}

export default BoardContainer;

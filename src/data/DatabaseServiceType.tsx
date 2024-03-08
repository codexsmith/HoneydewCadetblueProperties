import { CardType, ColumnType, BoardType } from "./DataType";

export interface IDatabaseService {
  fetchTasks: () => Promise<CardType[]>;
  addTask: (task: CardType) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<CardType>) => Promise<void>;

  //   fetchColumns: () => Promise<KanbanColumnType[]>;
  //   addColumn: (column: KanbanColumnType) => Promise<void>;
  //   updateColumn: (
  //     columnId: string,
  //     updates: Partial<KanbanColumnType>
  //   ) => Promise<void>;

  //   fetchBoards: () => Promise<KanbanBoardType[]>;
  //   addBoard: (column: KanbanBoardType) => Promise<void>;
  //   updateBoard: (
  //     boardId: string,
  //     updates: Partial<KanbanBoardType>
  //   ) => Promise<void>;
}

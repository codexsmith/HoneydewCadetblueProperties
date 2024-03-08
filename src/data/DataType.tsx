import { Object as tstb } from "ts-toolbelt"; //https://millsp.github.io/ts-toolbelt/
//TODO implement recoil

export interface CardType {
  id: string;
  text: string;
  orderInColumn: number;
}

export interface ColumnType {
  id: string;
  title: string;
}

export interface BoardType {
  id: string;
  title: string;
  cards: CardType[];
  columns: ColumnType[];
}

export interface BoardCardMappingType {
  id: string;
  boardId: string;
  cardId: string;
}

export interface ColumnColumnMappingType {
  id: string;
  boardId: string;
  cardId: string;
}

export interface CardCardMappingType {
  id: string;
  boardId: string;
  cardId: string;
}

export interface KanbanContextType {
  kanbanData: {
    tasks: CardType[];
    columnOrder: string[];
    columns: ColumnType[];
  };
  updateKanbanData: (
    partialData: Partial<KanbanContextType["kanbanData"]>
  ) => void;
}

import { schema, Typesaurus } from "typesaurus";

// Generate the db object from given schem that you can use to access
// Firestore, i.e.:
//   await db.get(userId)
export const db = schema(($) => ({
  users: $.collection<User>().sub({
    notes: $.collection<Note>(),
  }),
  orders: $.collection<Order>(),
  books: $.collection<Book>(),
}));

// Infer schema type helper with shortcuts to types in your database:
//   function getUser(id: Schema["users"]["Id"]): Schema["users"]["Result"]
export type Schema = Typesaurus.Schema<typeof db>;

// Your model types:

interface User {
  name: string;
}

interface Note {
  text: string;
}

interface Order {
  userId: Schema["users"]["Id"];
  bookId: Schema["books"]["Id"];
}

interface Book {
  title: string;
}

export interface CardType {
  id: string;
  text: string;
  column: string;
}

export interface ColumnType {
  id: string;
  title: string;
}

export interface KanbanBoardType {
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

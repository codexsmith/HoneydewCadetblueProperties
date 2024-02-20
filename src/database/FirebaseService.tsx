import { createContext, useContext } from "react";
import { CardType } from "./DataType";
import { add, update, getMany } from "typesaurus";

import { IDatabaseService } from "./DatabaseServiceType";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBP3q_YQQuixF6hFQXVYRXkRz_1QZgf5_c",
  authDomain: "projectrlive-dev.firebaseapp.com",
  databaseURL: "https://projectrlive-dev-default-rtdb.firebaseio.com",
  projectId: "projectrlive-dev",
  storageBucket: "projectrlive-dev.appspot.com",
  messagingSenderId: "345453357656",
  appId: "1:345453357656:web:e8efef14e5cfc79480782d",
  measurementId: "G-KGSREGCRVZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export class FirebaseService implements IDatabaseService {
  //   fetchColumns: () => Promise<KanbanColumnType[]>;
  //   addColumn: (column: KanbanColumnType) => Promise<void>;
  //   updateColumn: (columnId: string, updates: Partial<KanbanColumnType>) => Promise<void>;
  //   fetchBoards: () => Promise<KanbanBoardType[]>;
  //   addBoard: (column: KanbanBoardType) => Promise<void>;
  //   updateBoard: (boardId: string, updates: Partial<KanbanBoardType>) => Promise<void>;
  // async fetchTasks(): Promise<CardType[]> {
  //   // Firebase fetch implementation
  //   return []; // Placeholder return
  // }

  // async addTask(task: CardType): Promise<void> {
  //   // Firebase add task implementation
  // }

  // async updateTask(taskId: string, updates: Partial<CardType>): Promise<void> {
  //   // Firebase update task implementation
  // }

  async fetchTasks(): Promise<CardType[]> {
    const tasks = await getMany(tasksCollection, []); // Use an appropriate query
    return tasks.map(({ data }) => data);
  }

  async addTask(task: CardType): Promise<void> {
    await add(tasksCollection, task);
  }

  async updateTask(taskId: string, updates: Partial<CardType>): Promise<void> {
    await update(tasksCollection, taskId, updates);
  }
  // Implement other methods as required
}

const DatabaseServiceContext = createContext<IDatabaseService>(
  new FirebaseService()
);

export const useDatabaseService = () => useContext(DatabaseServiceContext);

import Board from "./kanban/Board";
import { useUser } from "reactfire";
import { SignIn } from "./components/SignIn";

const Dashboard = () => {
  const { status, data: user } = useUser();

  return user ? (
    <div>
      <h1>Dashboard Component</h1>
      <Board />
    </div>
  ) : (
    <SignIn />
  );
};

export default Dashboard;

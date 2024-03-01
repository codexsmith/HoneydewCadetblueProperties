import BoardContainer from "../kanban/BoardContainer";
import { useUser } from "reactfire";
import { SignIn } from "../components/SignIn";

const Dashboard = () => {
  const { status, data: user } = useUser();

  return user ? <BoardContainer /> : <SignIn />;
};

export default Dashboard;

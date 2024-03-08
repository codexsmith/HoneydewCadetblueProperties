import BoardContainer from "../kanban/BoardContainer";
import { useUser } from "reactfire";
import { SignIn } from "../components/SignIn";
import StockChart from "../chart/stockChart";
import { Box } from "@chakra-ui/react";

const Dashboard = () => {
  const { status, data: user } = useUser();
  // return <StockChart />;

  return user ? <BoardContainer /> : <SignIn />;
};

export default Dashboard;

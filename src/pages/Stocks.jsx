import BoardContainer from "../kanban/BoardContainer";
import { useUser } from "reactfire";
import { SignIn } from "../components/SignIn";
import StockChart from "../chart/stockChart";
import { Box } from "@chakra-ui/react";
import AmChart from "../chart/amchart";
import IsChart from "../chart/ischart";
import CoinbaseWebSocket from "../chart/cbchart";

const Dashboard = () => {
  const { status, data: user } = useUser();
  return user ? <CoinbaseWebSocket /> : <SignIn />;

  // return user ? <AmChart /> : <SignIn />;

  // return user ? <IsChart /> : <SignIn />;
  // return user ? <BeChart /> : <SignIn />;

  // return user ? <StockChart /> : <SignIn />;
};

export default Dashboard;

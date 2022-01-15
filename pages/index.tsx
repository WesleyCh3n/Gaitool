import type { NextPage } from "next";
import Chart from "./Chart";

const Home: NextPage = () => {
  return (
    <div className="m-4 flex justify-center">
        <Chart />
        <Chart />
    </div>
  );
};

export default Home;

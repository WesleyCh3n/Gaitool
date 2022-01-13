import type { NextPage } from "next";
import DrawChart from "./Chart";

const Home: NextPage = () => {
  return (
    <div className="m-4 flex justify-center">
        <DrawChart />
    </div>
  );
};

export default Home;

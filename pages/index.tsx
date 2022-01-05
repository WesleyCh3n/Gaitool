import type { NextPage } from "next";
import DrawChart from "./Chart";

const Home: NextPage = () => {
  return (
    <div className="m-4 grid grid-rows-2 grid-cols-10 gap-2">
      <div className="col-span-1"></div>
      <div className="col-span-8 row-span-1">
        <DrawChart />
      </div>
      <div className="col-span-1"></div>
      <div className="col-span-1"></div>
      <div className="col-span-8 row-span-1">
        <DrawChart />
      </div>
      <div className="col-span-1"></div>
    </div>
  );
};

export default Home;

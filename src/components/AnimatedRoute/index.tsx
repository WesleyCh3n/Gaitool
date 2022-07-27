import { Route, Routes, useLocation } from "react-router-dom";
import DualChart from "../../pages/DualChart";
import Home from "../../pages/Home";
import Split from "../../pages/Split";
import Setting from "../../pages/Setting";
import Check from "../../pages/Check";
import { useEffect } from "react";
import { useStore } from "../../store";

const AnimatedRoute = () => {
  const location = useLocation();
  const setSelectedPane = useStore((store) => store.setSelectedPane);
  useEffect(() => {
    setSelectedPane(location.pathname);
  }, [location])
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/chart" element={<DualChart />} />
      <Route path="/split" element={<Split />} />
      <Route path="/setting" element={<Setting />} />
      <Route path="/check" element={<Check />} />
    </Routes>
  )
}

export default AnimatedRoute;

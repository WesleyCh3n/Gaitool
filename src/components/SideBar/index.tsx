import {
  AiOutlineHome,
  AiOutlineScissor,
  AiOutlineSetting,
  AiOutlineCheck,
} from "react-icons/ai";
import { IoAnalyticsOutline } from "react-icons/io5";
import { BsMoon, BsSun } from "react-icons/bs";
import { Link } from "react-router-dom";
import useDarkMode from "../../hooks/useDarkMode";

export function SideBar() {
  return (
    <div
      className="fixed top-0 left-0 h-screen w-16 flex flex-col
                  bg-white dark:bg-gray-900 shadow-lg"
    >
      <SideBarIcon icon={<AiOutlineHome size="28" />} text="home" />
      <SideBarIcon icon={<IoAnalyticsOutline size="28" />} text="chart" />
      <SideBarIcon icon={<AiOutlineScissor size="28" />} text="tooltip" />
      <SideBarIcon icon={<AiOutlineCheck size="28" />} text="tooltip" />
      <ThemeIcon />
      <SideBarIcon icon={<AiOutlineSetting size="28" />} text="tooltip" />
    </div>
  );
}

const SideBarIcon = (props: { icon: any; text: string }) => {
  return (
    <Link to={"/" + props.text} className="sidebar-icon group">
      {props.icon}
      <span className="sidebar-tooltip group-hover:scale-100">
        {props.text}
      </span>
    </Link>
  );
};

const ThemeIcon = () => {
  const [darkTheme, setDarkTheme] = useDarkMode();
  const handleMode = () => setDarkTheme(!darkTheme);
  return (
    <div className="sidebar-icon group" onClick={handleMode}>
      {darkTheme ? <BsMoon size="28" /> : <BsSun size="28" />}
      <span className="sidebar-tooltip group-hover:scale-100">
        {"toggleTheme"}
      </span>
    </div>
  );
};

export default SideBar;

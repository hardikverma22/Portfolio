import { useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import {
  FcBusinessman,
  FcCellPhone,
  FcDiploma2,
  FcList,
  FcPortraitMode,
} from "react-icons/fc";
import DarkModeButton from "./DarkModeButton";
import useScroll from "./hooks/useScroll";

const NavigationBar = () => {
  const [open, setOpen] = useState(false);

  const [scrollTo] = useScroll();

  const sideNavRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (sideNavRef.current && !sideNavRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  const handleScroll = (pageNo) => {
    scrollTo(pageNo);
    setOpen(false);
  };

  return (
    <header className="w-full fixed top-0 z-[1000]">
      <nav className="bg-white bg-opacity-70 dark:bg-black dark:bg-opacity-70 shadow-lg flex items-center justify-between px-10 h-24 md:h-16">
        <h1 className="text-2xl md:text-3xl text-tertiary dark:text-white">
          <a className="cursor-pointer" onClick={() => scrollTo(0)}>
            Hardik Verma
          </a>
        </h1>
        <div className="flex gap-6">
          <ul className="hidden md:flex items-center justify-center gap-6 font-medium tracking-wide">
            <li className="cursor-pointer hover:text-black text-tertiary dark:text-white dark:hover:text-tertiary">
              <a
                onClick={() => scrollTo(0)}
                className="flex gap-2 justify-center items-center"
              >
                <FcPortraitMode className="text-xl" />
                <span>Who I Am</span>
              </a>
            </li>
            <li className="cursor-pointer hover:text-black text-tertiary dark:text-white dark:hover:text-tertiary">
              <a
                onClick={() => scrollTo(1)}
                className="flex gap-2 justify-center items-center"
              >
                <FcDiploma2 className="text-xl" />
                <span>Skills</span>
              </a>
            </li>
            <li className="cursor-pointer hover:text-black text-tertiary dark:text-white dark:hover:text-tertiary">
              <a
                onClick={() => scrollTo(2)}
                className="flex gap-2 justify-center items-center"
              >
                <FcBusinessman className="text-xl" />
                <span>About Me</span>
              </a>
            </li>
            <li className="cursor-pointer hover:text-black text-tertiary dark:text-white dark:hover:text-tertiary">
              <a
                onClick={() => scrollTo(3)}
                className="flex gap-2 justify-center items-center"
              >
                <FcList className="text-xl" />
                <span>Projects</span>
              </a>
            </li>
            <li className="cursor-pointer hover:text-black text-tertiary dark:text-white dark:hover:text-tertiary">
              <a
                onClick={() => scrollTo(4)}
                className="flex gap-2 justify-center items-center"
              >
                <FcCellPhone className="text-xl" />
                <span>Contact</span>
              </a>
            </li>
          </ul>
          <DarkModeButton />
          <button
            type="button"
            className="md:hidden bg-none outline-none hover:bg-gray-400 dark:text-white rounded-full w-10 h-10 flex justify-center items-center duration-300 text-3xl"
            onClick={() => setOpen(!open)}
          >
            {open ? <AiOutlineClose /> : <AiOutlineMenu />}
          </button>
        </div>
        <ul
          ref={sideNavRef}
          className={`fixed top-0 bg-tertiary dark:bg-[#232323] w-[50%] h-full text-white ease-in-out duration-700 ${
            open ? "left-0" : "left-[-100%]"
          }`}
        >
          <h1
            onClick={() => handleScroll(0)}
            className="cursor-pointer text-4xl font-bold text-white p-2"
          >
            Hardik
          </h1>
          <li
            onClick={() => handleScroll(0)}
            className="flex gap-2 items-center p-4 border-b border-b-primary  dark:border-b-white cursor-pointer hover:bg-white hover:text-black duration-500"
          >
            <FcPortraitMode className="text-xl" />
            <span>Who I Am</span>
          </li>
          <li
            onClick={() => handleScroll(1)}
            className="flex gap-2 items-center p-4 border-b border-b-primary  dark:border-b-white cursor-pointer hover:bg-white hover:text-black duration-500"
          >
            <FcDiploma2 className="text-xl" />
            <span>Skills</span>
          </li>
          <li
            onClick={() => handleScroll(2)}
            className="flex gap-2 items-center p-4 border-b border-b-primary  dark:border-b-white cursor-pointer hover:bg-white hover:text-black duration-500"
          >
            <FcBusinessman className="text-xl" />
            <span>About Me</span>
          </li>
          <li
            onClick={() => handleScroll(3)}
            className="flex gap-2 items-center p-4 border-b border-b-primary  dark:border-b-white cursor-pointer hover:bg-white hover:text-black duration-500"
          >
            <FcList className="text-xl" />
            <span>Projects</span>
          </li>
          <li
            onClick={() => handleScroll(4)}
            className="flex gap-2 items-center p-4 border-b border-b-primary  dark:border-b-white cursor-pointer hover:bg-white hover:text-black duration-500"
          >
            <FcCellPhone className="text-xl" />
            <span>Contact</span>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavigationBar;

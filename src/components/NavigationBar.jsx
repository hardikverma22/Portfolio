import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { slideIn } from "../constants/motion";
import DarkModeButton from "./DarkModeButton";
import {
  AiOutlineClose,
  AiOutlineMenu,
  FcBusinessman,
  FcCellPhone,
  FcDiploma2,
  FcList,
  FcPortraitMode,
} from "./Icons";

import logo from "../assets/logo.svg";
import logoWhite from "../assets/logo-white.svg";

const NavigationBar = ({
  summaryRef,
  skillRef,
  aboutMeRef,
  projectsRef,
  contactMeRef,
}) => {
  const [open, setOpen] = useState(false);

  const sideNavRef = useRef(null);

  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      title: "Who I Am",
      icon: <FcPortraitMode className="text-xl" />,
      passedInRef: summaryRef,
    },
    {
      title: "Skills",
      icon: <FcDiploma2 className="text-xl" />,
      passedInRef: skillRef,
    },
    {
      title: "About Me",
      icon: <FcBusinessman className="text-xl" />,
      passedInRef: aboutMeRef,
    },
    {
      title: "Projects",
      icon: <FcList className="text-xl" />,
      passedInRef: projectsRef,
    },
    {
      title: "Contact",
      icon: <FcCellPhone className="text-xl" />,
      passedInRef: contactMeRef,
    },
  ];

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

  const handleScroll = (ref) => {
    scrollIntoView(ref);
    setOpen(false);
  };

  const scrollIntoView = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="w-full fixed top-0 z-[1000] dark:bg-black bg-white">
      <nav className="bg-white bg-opacity-70 dark:bg-black dark:bg-opacity-70 shadow-lg flex items-center justify-between px-10 h-16 sm:h-24 md:h-16">
        <h1 className="text-2xl md:text-3xl text-tertiary dark:text-white">
          <motion.div
            variants={slideIn("left", "spring", 0.5, 0.5)}
            initial={"hidden"}
            whileInView={"show"}
            viewport={{ once: true }}
          >
            <a
              className="cursor-pointer flex gap-2 justify-center items-center hover:text-primary"
              onClick={() => scrollIntoView(summaryRef)}
            >
              <img src={logo} alt="logo" className="h-10 sm:12 dark:hidden" />
              <img
                src={logoWhite}
                alt="logo"
                className="hidden h-10 sm:12 dark:flex"
              />
            </a>
          </motion.div>
        </h1>
        <div className="flex gap-6">
          <motion.ul
            variants={slideIn("up", "spring", 0.5, 0.5)}
            initial={"hidden"}
            whileInView={"show"}
            viewport={{ once: true }}
            className="hidden md:flex items-center justify-center gap-6 font-medium tracking-wide"
          >
            {tabs.map((tab, index) => (
              <li
                key={`${tab}_${index}`}
                className="relative cursor-pointer hover:text-black text-tertiary dark:text-white dark:hover:text-tertiary"
              >
                <a
                  onClick={() => {
                    scrollIntoView(tab.passedInRef);
                    setActiveTab(index);
                  }}
                  className="flex gap-2 justify-center items-center p-2"
                >
                  {activeTab === index && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute inset-0 z-10 bg-[#2962d62b] dark:bg-white dark:mix-blend-exclusion mix-blend-color-burn"
                      style={{ borderRadius: 9999 }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}

                  {tab.icon}
                  <span>{tab.title}</span>
                </a>
              </li>
            ))}
          </motion.ul>
          <motion.div
            variants={slideIn("right", "spring", 0.5, 0.5)}
            initial={"hidden"}
            whileInView={"show"}
            viewport={{ once: true }}
            className="flex gap-6"
          >
            <DarkModeButton />
            <button
              type="button"
              className="md:hidden bg-none outline-none hover:bg-gray-400 dark:text-white rounded-full w-10 h-10 flex justify-center items-center duration-300 text-3xl"
              onClick={() => setOpen(!open)}
            >
              {open ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
          </motion.div>
        </div>
        <ul
          ref={sideNavRef}
          className={`fixed top-0 bg-tertiary dark:bg-[#232323] w-[50%] h-full text-white ease-in-out duration-700 ${
            open ? "left-0" : "left-[-100%]"
          }`}
        >
          <h1
            onClick={() => handleScroll(summaryRef)}
            className="cursor-pointer text-4xl font-bold text-white p-2"
          >
            Hardik
          </h1>
          <li
            onClick={() => handleScroll(summaryRef)}
            className="flex gap-2 items-center p-4 border-b border-b-primary  dark:border-b-white cursor-pointer hover:bg-white hover:text-black duration-500"
          >
            <FcPortraitMode className="text-xl" />
            <span>Who I Am</span>
          </li>
          <li
            onClick={() => handleScroll(skillRef)}
            className="flex gap-2 items-center p-4 border-b border-b-primary  dark:border-b-white cursor-pointer hover:bg-white hover:text-black duration-500"
          >
            <FcDiploma2 className="text-xl" />
            <span>Skills</span>
          </li>
          <li
            onClick={() => handleScroll(aboutMeRef)}
            className="flex gap-2 items-center p-4 border-b border-b-primary  dark:border-b-white cursor-pointer hover:bg-white hover:text-black duration-500"
          >
            <FcBusinessman className="text-xl" />
            <span>About Me</span>
          </li>
          <li
            onClick={() => handleScroll(projectsRef)}
            className="flex gap-2 items-center p-4 border-b border-b-primary  dark:border-b-white cursor-pointer hover:bg-white hover:text-black duration-500"
          >
            <FcList className="text-xl" />
            <span>Projects</span>
          </li>
          <li
            onClick={() => handleScroll(contactMeRef)}
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

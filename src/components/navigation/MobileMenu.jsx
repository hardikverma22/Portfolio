import {useRef, useEffect, useState} from "react";
import {motion} from "framer-motion";
import {slideIn} from "lib/constants/motion";
import {AiOutlineClose, AiOutlineMenu} from "src/components/icons";
import {TABS} from "lib/constants";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
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

  return (
    <>
      <motion.button
        variants={slideIn("right", "spring", 1, 0.1)}
        initial={"hidden"}
        whileInView={"show"}
        viewport={{once: true}}
        type="button"
        className="lg:hidden bg-none outline-none hover:bg-gray-400 dark:text-white rounded-full w-10 h-10 flex justify-center items-center duration-300 text-3xl"
        onClick={() => setOpen(!open)}
      >
        {open ? <AiOutlineClose /> : <AiOutlineMenu />}
      </motion.button>
      <aside
        ref={sideNavRef}
        className={`lg:hidden 
                    fixed top-0 left-0
                    bg-white dark:bg-[#232323] dark:text-white/80
                    shadow-2xl
                    w-[30%] min-h-[100svh] ease-in-out duration-700 
                     ${open ? "left-0" : "left-[-100%]"}`}
      >
        <h1 className="cursor-pointer text-4xl font-bold text-secondary p-2">
          <a href="#summary">Hardik</a>
        </h1>
        <ul>
          {TABS.map((tab) => (
            <li
              key={tab.id}
              className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-50/10 transition-all duration-200"
            >
              <a href={`#${tab.id}`} className="flex gap-2 items-center">
                <tab.icon />
                <span>{tab.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default MobileMenu;

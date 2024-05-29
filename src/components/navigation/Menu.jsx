import {motion} from "framer-motion";
import {TABS} from "lib/constants";
import {useState} from "react";

const container = {
  hidden: {opacity: 0},
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      type: "spring",
    },
  },
};

const slideInX = {
  hidden: {opacity: 0, x: 200},
  show: {
    opacity: 1,
    x: 0,
    transition: {duration: 0.9, type: "spring", bounce: 0.2},
  },
};

const Menu = () => {
  const [activeTab, setActiveTab] = useState(-1);

  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      viewport={{once: true}}
      className="items-center justify-center
                hidden lg:flex
                gap-6 
                font-medium tracking-wide
                select-none"
    >
      {TABS.map((tab, index) => {
        const {title, icon, id} = tab;
        return (
          <motion.li
            variants={slideInX}
            key={title}
            className="relative cursor-pointer hover:bg-[#2962d62b] transition-all duration-500 rounded-3xl hover:text-black text-gray-700 dark:text-white dark:hover:text-tertiary"
          >
            <a
              onClick={() => {
                setActiveTab(index);
              }}
              href={`#${id}`}
              className="flex gap-2 justify-center items-center p-2"
            >
              {activeTab === index && (
                <motion.span
                  layoutId="bubble"
                  className="absolute inset-0 z-10 bg-[#2962d62b] dark:bg-white dark:mix-blend-exclusion mix-blend-color-burn"
                  style={{borderRadius: 9999}}
                  transition={{
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.6,
                  }}
                />
              )}

              <tab.icon className="text-xl" />
              <span>{title}</span>
            </a>
          </motion.li>
        );
      })}
    </motion.ul>
  );
};

export default Menu;

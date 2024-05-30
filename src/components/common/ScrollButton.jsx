import {AiOutlineArrowDown, AiOutlineArrowUp} from "src/components/icons";

const ScrollButton = ({id, isGoToTop = false}) => {
  return (
    <div className="z-[400] absolute bottom-3 right-3">
      <a
        className={`animate-bounce inline-block p-3
                    font-medium text-xs rounded-full shadow-xl transition duration-150 ease-in-out bottom-5 
                  bg-white text-black 
                  dark:bg-gray-500 dark:text-white hover:shadow-2xl hover:border hover:border-black dark:hover:border-white`}
        href={`#${id}`}
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({
            top: "4rem",
            behavior: "smooth",
          });
        }}
      >
        {isGoToTop ? (
          <AiOutlineArrowUp className="text-2xl" />
        ) : (
          <AiOutlineArrowDown className="text-2xl" />
        )}
      </a>
    </div>
  );
};

export default ScrollButton;

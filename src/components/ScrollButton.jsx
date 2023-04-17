import { forwardRef } from "react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";

const ScrollButton = forwardRef(
  ({ isLight = false, isGoToTop = false }, ref) => {
    const bgColor = isLight ? "bg-white" : "bg-secondary";
    const textColor = isLight ? "text-secondary" : "text-white";
    const hoverColor = isLight ? "bg-secondary" : "bg-tertiary";

    const handleClick = (e) => {
      e.stopPropagation();
      console.log(ref);
      ref.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
      <div
        className={`z-400 absolute bottom-5 ${
          isGoToTop ? "right-5" : "mx-auto"
        }`}
      >
        <button
          type="button"
          className={`animate-bounce inline-block p-3 ${bgColor} ${textColor} font-medium text-xs rounded-full shadow-lg hover:${hoverColor} hover:text-primary hover:shadow-2xl transition duration-150 ease-in-out bottom-5 dark:text-black dark:hover:text-tertiary`}
          onClick={handleClick}
        >
          {isGoToTop ? (
            <AiOutlineArrowUp className="text-2xl" />
          ) : (
            <AiOutlineArrowDown className="text-2xl" />
          )}
        </button>
      </div>
    );
  }
);

export default ScrollButton;

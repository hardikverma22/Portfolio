import {cn} from "lib/utils/cn";
import {useRef} from "react";
import {useEffect} from "react";
import {useState} from "react";
import {BackgroundGradient} from "src/components/ui/background-gradient";

export const BentoGrid = ({className, children}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-max grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({className, name, recommendationText, occupation, avatar}) => {
  const [showMore, setShowMore] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, []);

  return (
    <BackgroundGradient
      containerClassName={cn("row-span-1 ", className)}
      className={cn("rounded-[22px] p-6 bg-white dark:bg-[#232323] flex gap-2 h-full")}
    >
      <div className="min-w-fit">
        <img
          src={`${avatar}.jfif`}
          alt={`${name}'s profile pic`}
          className="rounded-full w-14 aspect-square"
        />
      </div>
      <div className="col-span-4 flex flex-col gap-1 text-neutral-600 dark:text-neutral-200">
        <span className="font-medium text-balance text-md ">{name}</span>
        <span className="text-base text-black/90 dark:text-neutral-200">{occupation}</span>
        <span
          ref={textRef}
          className={cn(
            "text-wrap text-sm pt-2 leading-6 text-black/90 dark:text-neutral-200 text-ellipsis",
            {
              "line-clamp-6": !showMore,
            }
          )}
        >
          {recommendationText}
        </span>
        {isOverflowing && (
          <a
            className="text-sm text-blue-500 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setShowMore(!showMore);
            }}
          >
            {showMore ? "Show Less" : "Show More"}
          </a>
        )}
      </div>
    </BackgroundGradient>
    // <div
    //   className={cn(
    //     `row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent
    //     flex gap-2 max-h-fit`,
    //     className
    //   )}
    // >
    //   <div className="min-w-fit">
    //     <img
    //       src={`/Portfolio/src/assets/${avatar}.jfif`}
    //       alt={`${name}'s profile pic`}
    //       className="rounded-full w-14 aspect-square"
    //     />
    //   </div>
    //   <div className="col-span-4 flex flex-col gap-1 text-neutral-600 dark:text-neutral-200">
    //     <span className="font-medium text-balance text-md ">{name}</span>
    //     <span className="text-base text-black/90 dark:text-neutral-200">{occupation}</span>
    //     <span
    //       ref={textRef}
    //       className={cn(
    //         "text-wrap text-sm pt-2 leading-6 text-black/90 dark:text-neutral-200 text-ellipsis",
    //         {
    //           "line-clamp-4": !showMore,
    //         }
    //       )}
    //     >
    //       {recommendationText}
    //     </span>
    //     {isOverflowing && (
    //       <a
    //         className="text-sm text-blue-500 cursor-pointer"
    //         onClick={(e) => {
    //           e.preventDefault();
    //           setShowMore(!showMore);
    //         }}
    //       >
    //         {showMore ? "Show Less" : "Show More"}
    //       </a>
    //     )}
    //   </div>
    // </div>
  );
};

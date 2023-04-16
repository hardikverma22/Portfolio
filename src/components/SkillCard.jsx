import { useRef } from "react";
import { useInViewport } from "react-in-viewport";

const SkillCard = ({ title, Icon, delay }) => {
  const skillCardRef = useRef();
  const { inViewport } = useInViewport(skillCardRef, {
    rootMargin: "0px",
  });

  return (
    <div
      title={title}
      ref={skillCardRef}
      className={`${
        inViewport ? "animate-move animate-loadUp" : ""
      } opacity-0 ${delay} transition -translate-y-10 p-4 sm:p-8 rounded-xl bg-white shadow-xl group hover:scale-110 duration-500 ease-in-out`}
    >
      <Icon className="text-6xl text-tertiary group-hover:text-secondary " />
    </div>
  );
};

export default SkillCard;

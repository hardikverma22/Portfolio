import {motion} from "framer-motion";
import {slideIn} from "lib/constants/motion";
import Code from "src/components/summary/Code";
import ColorCodes from "src/components/summary/ColorCodes";
import Intro from "src/components/summary/Intro";
import ScrollButton from "src/components/common/ScrollButton";

const Summary = () => {
  return (
    <section
      id="summary"
      className="w-full h-[calc(100svh-4rem)] 
                grid lg:grid-rows-1 grid-rows-2 lg:grid-cols-5 lg:gap-2
                bg-white/10 dark:bg-black overflow-hidden relative"
    >
      <motion.div
        variants={slideIn("left", "spring", 0.1, 0.2)}
        initial={"hidden"}
        whileInView={"show"}
        viewport={{once: true}}
        className="h-full w-full bg-white
                      flex flex-col gap-5 justify-center items-center lg:col-span-3"
      >
        <div className="h-full w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_15%,black)] dark:[mask-image:radial-gradient(ellipse_at_center,transparent_50%,black)]"></div>
          <div className="z-[50]">
            <Intro />
          </div>
        </div>
      </motion.div>
      <motion.div
        variants={slideIn("right", "tween", 0.1, 0.8)}
        initial={"hidden"}
        whileInView={"show"}
        viewport={{once: true}}
        className="h-full w-full lg:col-span-2 py-10 
                      flex flex-col gap-5 justify-center items-center
                      bg-gradient-to-b from-secondary to-tertiary dark:from-[#232323] dark:to-secondary
                      
                      rounded-bl-[15rem] rounded-tl-[15rem]"
      >
        <Code />
        <ColorCodes />
      </motion.div>
      <ScrollButton id="skills" />
    </section>
  );
};

export default Summary;

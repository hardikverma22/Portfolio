import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { BsGithub, CgWebsite } from "../Icons";
const Slide = ({ title, description, githubURL, liveURL, techStack }) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    let { currentTarget, clientX, clientY } = e;
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div
      className="group relative max-w-md rounded-3xl border border-gray-700 bg-white dark:bg-gray-900 p-8"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="hidden dark:block pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(
          650px circle at ${mouseX}px ${mouseY}px,
          rgb(14 165 233 / 20%),
          transparent 80%
        )`,
        }}
      />
      <div>
        <h3 className="text-2xl font-extrabold tracking-wide leading-7 text-black font-poppins dark:text-white">
          {title}
        </h3>
        <p className="mt-4 text-gray-700 dark:text-gray-300 tracking-tight line-clamp-2 leading-6">
          {description}
        </p>
        <ul
          className="mt-8 space-y-3
                    text-gray-700 dark:text-gray-300  leading-6 
                    grid grid-rows-3 grid-cols-2 gap-1"
        >
          {techStack.map((tech) => (
            <li
              key={tech.name}
              className="flex gap-2 justify-start items-center col-span-1"
            >
              {tech.icon}
              <span>{tech.name}</span>
            </li>
          ))}
        </ul>

        <div className="w-full flex gap-4 mt-8">
          <a
            href={githubURL}
            target="_blank"
            className="w-full
                    bg-white  dark:bg-gray-700 dark:text-white
                      rounded-lg p-2
                      flex gap-2 justify-center items-center
                    hover:bg-gray-200
                    dark:hover:bg-gray-600 border border-gray-600 dark:border-gray-400"
          >
            <BsGithub />
            <span className="text-gray-600 dark:text-white">Github</span>
          </a>
          <a
            href={liveURL}
            target="_blank"
            className="w-full
                    bg-white  dark:bg-gray-700 dark:text-white
                      rounded-lg p-2
                      flex gap-2 justify-center items-center
                    hover:bg-gray-200
                      dark:hover:bg-gray-600 border border-gray-600 dark:border-gray-400"
          >
            <CgWebsite />
            <span className="text-gray-600 dark:text-white">Live</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Slide;

import { BsGithub } from "../Icons";

const Slide = ({ title, description, githubURL, liveURL }) => {
  return (
    <div className="mx-auto flex items-center justify-center">
      <div className="max-w-md h-[15rem] border mx-5 rounded-lg bg-white shadow-xl p-5 flex flex-col gap-5 dark:bg-[#232323]">
        <h5 className="text-2xl font-bold tracking-tight  text-gray-900 dark:text-white">
          {title}
        </h5>
        <p className="font-normal text-gray-700 dark:text-white">
          {description}
        </p>
        <div className="flex gap-5 items-center">
          <a href={githubURL} target="_blank">
            <BsGithub className="text-2xl hover:scale-125 duration-300 cursor-pointer dark:text-white" />
          </a>

          <a
            href={liveURL}
            target="_blank"
            className="shadow-lg px-4 py-2 rounded-md hover:scale-110 duration-300 dark:text-white dark:shadow-black"
          >
            Live
          </a>
        </div>
      </div>
    </div>
  );
};

export default Slide;

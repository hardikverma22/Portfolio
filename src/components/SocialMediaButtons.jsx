import React from "react";
import {BsGithub, BsLinkedin, MdDownloadForOffline} from "./Icons";
import resume from "../assets/resume.pdf";

const SocialMediaButtons = () => {
  return (
    <div className="flex gap-5 justify-center items-center">
      <a href="https://github.com/hardikverma22" className="rounded-xl w-10 h-10 p-1" target="_blank">
        <BsGithub
          className="text-lg md:text-2xl
                   text-tertiary dark:text-white
                    rounded-md w-8 h-8 hover:scale-110 duration-200 cursor-pointer"
          title="Github Profile"
        />
      </a>
      <a href="https://www.linkedin.com/in/hardikverma22" target="_blank">
        <BsLinkedin
          className="text-lg md:text-2xl
                   text-tertiary dark:text-white
                    rounded-md w-8 h-8 hover:scale-110 duration-200 cursor-pointer"
          title="LinkedIn Profile"
        />
      </a>

      <a href={resume} download className="w-lg">
        <MdDownloadForOffline
          className="text-xl md:text-5xl
                   text-tertiary dark:text-white
                    rounded-md w-10 h-10 hover:scale-110 hover:w-full duration-200 cursor-pointer"
          title="Resume Download"
        />
      </a>
    </div>
  );
};

export default SocialMediaButtons;

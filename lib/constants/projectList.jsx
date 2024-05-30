import {
  SiOpenai,
  SiTailwindcss,
  FaCss3,
  AiOutlineEdit,
  SiFirebase,
  SiCodemirror,
  FaAws,
  FaCcStripe,
  FaReact,
  TbBrandThreejs,
  AiOutlineMail,
  SiFramer,
  SiNextdotjs,
  TbGridDots,
  SiRazorpay,
} from "src/components/icons";

import convexLogo from "src/assets/convex-logo.svg";
import clerkLogo from "src/assets/clerk.svg";
import {cn} from "lib/utils/cn";

export const Convex = ({className = "w-6 h-6"}) => {
  return <img alt="Convex logo" src={convexLogo} className={cn("grayscale", className)} />;
};

export const Clerk = ({className = "w-6 h-6"}) => {
  return <img alt="Clerk logo" src={clerkLogo} className={cn("grayscale", className)} />;
};

export const PROJECTS = [
  {
    title: "Travel Planner AI",
    description: `AI travel companion designed to simplify the process of planning your next adventure.`,
    githubURL: "https://github.com/hardikverma22/travel-planner-ai",
    liveURL: "https://travel-plannerai.vercel.app/",
    techStack: [
      {name: "NextJS", icon: <SiNextdotjs className="text-xl" />},
      {name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl" />},
      {name: "OpenAI", icon: <SiOpenai className="text-xl" />},
      {name: "Convex", icon: <Convex />},
      {name: "Clerk", icon: <Clerk />},
      {name: "Razorpay", icon: <SiRazorpay className="text-xl" />},
    ],
  },
  {
    title: "Voice Wise AI",
    description: `Enables users to record audio notes and convet it into transcription, summmary and useful action items`,
    githubURL: "https://github.com/hardikverma22/VoiceWiseAI",
    liveURL: "https://voice-wise-ai.vercel.app/",
    techStack: [
      {name: "NextJS", icon: <SiNextdotjs className="text-xl" />},
      {name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl" />},
      {name: "Whisper AI", icon: <SiOpenai className="text-xl" />},
      {
        name: "Together.ai",
        icon: <TbGridDots className="text-xl" />,
      },
      {name: "Convex", icon: <Convex />},
      {name: "Clerk", icon: <Clerk />},
    ],
  },
  {
    title: "HDocs",
    description: `Hdocs is an application that allows users to create, edit, delete, and
          share documents with other users.`,
    githubURL: "https://github.com/hardikverma22/HDocs",
    liveURL: "https://hdocs.netlify.app/",
    techStack: [
      {name: "React", icon: <FaReact className="text-xl" />},
      {name: "CSS", icon: <FaCss3 className="text-xl" />},
      {name: "Quill", icon: <AiOutlineEdit className="text-xl" />},
      {name: "Firebase", icon: <SiFirebase className="text-xl" />},
      {name: "AWS", icon: <FaAws className="text-xl" />},
    ],
  },
  {
    title: "Shoe Forge",
    description: `3D Shoe Configurator, which allows real-time visualization of shoe textures and colors on the web.`,
    githubURL: "https://github.com/hardikverma22/shoe-forge",
    liveURL: "https://hardikverma22.github.io/shoe-forge",
    techStack: [
      {name: "ThreeJS", icon: <TbBrandThreejs className="text-xl" />},
      {name: "React", icon: <FaReact className="text-xl" />},
      {name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl" />},
    ],
  },
  {
    title: "CodeMe",
    description: `CodeMe is an online editor plus IDE to develop small web applications
          using HTML, CSS and Javascript.`,
    githubURL: "https://github.com/hardikverma22/Code-Me-with-tailwind-reziable-panels",
    liveURL: "https://hardikverma22.github.io/Code-Me-with-tailwind-reziable-panels/",
    techStack: [
      {name: "React", icon: <FaReact className="text-xl" />},
      {name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl" />},
      {name: "Codemirror", icon: <SiCodemirror className="text-xl" />},
    ],
  },
  {
    title: "Textop.AI",
    description: `A text analysis tool for sentiment analysis, text classification,
       keyword extraction, and text summarization.`,
    githubURL: "https://github.com/hardikverma22/textop.AI",
    liveURL: "https://hardikverma22.github.io/textop.AI/",
    techStack: [
      {name: "React", icon: <FaReact className="text-xl" />},
      {name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl" />},
      {name: "OpenAI", icon: <SiOpenai className="text-xl" />},
      {name: "AWS", icon: <FaAws className="text-xl" />},
    ],
  },
  {
    title: "Portfolio Website",
    description: `Portfolio website is built to showcase skills,
     projects and about me and react out many people.`,
    githubURL: "https://github.com/hardikverma22/CodeMe",
    liveURL: "https://code-me.netlify.app/",
    techStack: [
      {name: "React", icon: <FaReact className="text-xl" />},
      {name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl" />},
      {name: "ThreeJS", icon: <TbBrandThreejs className="text-xl" />},
      {name: "EmailJS", icon: <AiOutlineMail className="text-xl" />},
      {name: "Framer Motion", icon: <SiFramer className="text-xl" />},
    ],
  },
];

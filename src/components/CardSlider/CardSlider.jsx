import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Slide from "./Slide";
import {
  SiOpenai,
  SiTailwindcss,
  FaCss3,
  AiOutlineEdit,
  SiFirebase,
  SiCodemirror,
  FaAws,
  FaReact,
  TbBrandThreejs,
  AiOutlineMail,
  SiFramer,
} from "../Icons";

const projects = [
  {
    title: "HDocs",
    description: `Hdocs is an application that allows users to create, edit, delete, and
          share documents with other users.`,
    githubURL: "https://github.com/hardikverma22/HDocs",
    liveURL: "https://hdocs.netlify.app/",
    techStack: [
      { name: "React", icon: <FaReact className="text-xl" /> },
      { name: "CSS", icon: <FaCss3 className="text-xl" /> },
      { name: "Quill", icon: <AiOutlineEdit className="text-xl" /> },
      { name: "Firebase", icon: <SiFirebase className="text-xl" /> },
      { name: "AWS", icon: <FaAws className="text-xl" /> },
    ],
  },
  {
    title: "CodeMe",
    description: `CodeMe is an online editor plus IDE to develop small web applications
          using HTML, CSS and Javascript`,
    githubURL:
      "https://github.com/hardikverma22/Code-Me-with-tailwind-reziable-panels",
    liveURL:
      "https://hardikverma22.github.io/Code-Me-with-tailwind-reziable-panels/",
    techStack: [
      { name: "React", icon: <FaReact className="text-xl" /> },
      { name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl" /> },
      { name: "Codemirror", icon: <SiCodemirror className="text-xl" /> },
    ],
  },
  {
    title: "AI Keyword Extractor",
    description:
      " Key Extractor is based on OpenAI's Chat GPT to extract keywords from text paragraphs.",
    githubURL: "https://github.com/hardikverma22/key-extractor",
    liveURL: "https://keyext.netlify.app/",
    techStack: [
      { name: "React", icon: <FaReact className="text-xl" /> },
      { name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl" /> },
      { name: "OpenAI", icon: <SiOpenai className="text-xl" /> },
      { name: "AWS", icon: <FaAws className="text-xl" /> },
    ],
  },
  {
    title: "Portfolio Website",
    description: `Portfolio website is built to showcase skills, projects and about me and react out many people.`,
    githubURL: "https://github.com/hardikverma22/CodeMe",
    liveURL: "https://code-me.netlify.app/",
    techStack: [
      { name: "React", icon: <FaReact className="text-xl" /> },
      { name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl" /> },
      { name: "ThreeJS", icon: <TbBrandThreejs className="text-xl" /> },
      { name: "EmailJS", icon: <AiOutlineMail className="text-xl" /> },
      { name: "Framer Motion", icon: <SiFramer className="text-xl" /> },
    ],
  },
];

const CardSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipeToSlide: true,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1460,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 1032,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
    ],
  };
  return (
    <Slider {...settings} className="w-full flex">
      <Slide {...projects[0]} />
      <Slide {...projects[1]} />
      <Slide {...projects[2]} />
      <Slide {...projects[3]} />
    </Slider>
  );
};

export default CardSlider;

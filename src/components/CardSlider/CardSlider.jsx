import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Slide from "./Slide";

const projects = [
  {
    title: "HDocs",
    description: `Hdocs is an application that allows users to create, edit, delete, and
          share documents with other users.`,
    githubURL: "https://github.com/hardikverma22/HDocs",
    liveURL: "https://hdocs.netlify.app/",
  },
  {
    title: "CodeMe",
    description: `CodeMe is an online editor plus IDE to develop small web applications
          using HTML, CSS and Javascript`,
    githubURL: "https://github.com/hardikverma22/Code-Me-with-tailwind-reziable-panels",
    liveURL: "https://hardikverma22.github.io/Code-Me-with-tailwind-reziable-panels/",
  },
  {
    title: "AI Keyword Extractor",
    description:
      "Key Extractor is based on OpenAI's Chat GPT to extract keywords from text paragraphs.",
    githubURL: "https://github.com/hardikverma22/key-extractor",
    liveURL: "https://keyext.netlify.app/",
  },
  {
    title: "PortFolio Website",
    description: `Portfolio website to showcase skills visually and react out many people.`,
    githubURL: "https://github.com/hardikverma22/CodeMe",
    liveURL: "https://code-me.netlify.app/",
  },
];

const CardSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 3,
    slidesToScroll: 1,
    // focusOnSelect: true,
    swipeToSlide: true,
    autoplay: true,
    autoplaySpeed: 4000,
    // centerMode: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 872,
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
      <Slide {...projects[0]} />
      <Slide {...projects[1]} />
      <Slide {...projects[2]} />
      {/* <Slide title="HDocs 2" />
      <Slide title="HDocs 3" />
      <Slide title="HDocs 4" />
      <Slide title="HDocs 5" />
      <Slide title="HDocs 6" />
      <Slide title="HDocs 7" /> */}
    </Slider>
  );
};

export default CardSlider;

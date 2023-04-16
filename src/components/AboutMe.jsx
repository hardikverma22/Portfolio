import { useRef } from "react";
import pic from "../assets/pic.jpeg";
import bnwPic from "../assets/bnwPic.jpeg";
import ScrollButton from "./ScrollButton";
import { useInViewport } from "react-in-viewport";

const AboutMe = () => {
  const aboutMeSectionRef = useRef();
  const { inViewport } = useInViewport(aboutMeSectionRef, {
    rootMargin: "0px",
  });

  return (
    <section className="relative flex gap-5 flex-col h-fit md:h-screen justify-start items-center bg-white text-tertiary pt-32 dark:bg-black dark:text-white">
      <div className="z-0 bg-wave dark:bg-wave-dark absolute top-0 min-w-full min-h-full bg-no-repeat bg-cover"></div>
      <div className="z-10 flex gap-10 flex-col justify-start items-center w-full">
        <h2 className="text-4xl text-primary dark:text-white font-bold flex justify-center items-center uppercase">
          About Me
        </h2>
        <div
          ref={aboutMeSectionRef}
          className={`${
            inViewport ? "animate-moveSlow" : ""
          } z-10 bg-white relative dark:bg-[#232323] dark:text-white w-[70%] mx-auto translate-y-24 md:shadow-lg dark:shadow-[#232323] md:rounded-xl flex flex-col md:flex-row justify-center items-center md:drop-shadow-lg`}
        >
          <div className="flex justify-center items-end md:items-center md:justify-start p-5">
            <img
              src={pic}
              className="block dark:hidden md:w-48 md:h-64 w-40 h-52 rounded-xl"
            />
            <img
              src={bnwPic}
              className="hidden dark:block md:w-48 md:h-64 w-40 h-52 rounded-xl"
            />
          </div>
          <div className="p-5 md:w-full">
            <div className="text-lg leading-9  text-black dark:text-white">
              I am an accomplished lead software engineer working at
              <span className="font-bold"> Fidelity Investments.</span>
              <br />I work on a variety of projects that encompass both
              <span className="font-bold"> Front-End</span> and
              <span className="font-bold"> Back-End</span> development. I have
              honed my skills through self-learning and enjoys working with JS
              frameworks such as React. My passion for development extends
              beyond my work at Fidelity, I work on personal projects as well to
              get my hands dirty with new technologies. My experience, technical
              expertise, and dedication to my craft make me happy and satisfied
              everyday.
            </div>
          </div>
        </div>
      </div>
      <ScrollButton pageNo={3} />
    </section>
  );
};

export default AboutMe;

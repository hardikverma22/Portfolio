import { useRef } from "react";
import { useInViewport } from "react-in-viewport";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail, MdLocationOn } from "react-icons/md";
import ContactForm from "./ContactForm";
import { Toaster } from "react-hot-toast";
import ScrollButton from "../ScrollButton";

const ContactMe = () => {
  const contactMeSectionRef = useRef();
  const { inViewport } = useInViewport(contactMeSectionRef, {
    rootMargin: "0px",
  });

  return (
    <section className="relative bg-white flex gap-10 flex-col h-fit md:h-screen justify-start items-center pt-40 dark:bg-black">
      <Toaster
        containerStyle={{
          top: 100,
        }}
      />
      <div className="w-full flex gap-10 flex-col justify-start items-center">
        <div className="z-0 bg-wave-grad dark:bg-wave-dark absolute top-0 min-w-full min-h-full bg-no-repeat bg-cover"></div>

        <h2 className="z-50 text-4xl text-primary dark:text-white font-bold flex justify-center items-center uppercase">
          Get In Touch
        </h2>
        <div
          ref={contactMeSectionRef}
          className={`${
            inViewport ? "animate-move" : ""
          } bg-white dark:bg-[#232323] w-[70%] mx-auto translate-y-24 shadow-lg dark:shadow-cyan-500/50 dark:shadow-sm md:rounded-lg flex flex-col md:flex-row justify-center items-center gap-10 lg:gap-0 md:drop-shadow-lg`}
        >
          <div className="md:w-[40%] w-full h-full p-3">
            <div className="relative overflow-hidden flex flex-col gap-5 justify-start p-5 h-full text-white bg-tertiary rounded-lg">
              <div className="text-xl font-medium">Contact</div>
              <div className="flex gap-5">
                <BsFillTelephoneFill className="text-2xl" />
                <span>+91 - 7550147914</span>
              </div>
              <div className="flex gap-5">
                <MdEmail className="text-2xl" />
                <span>Hardikverma22@gmail.com</span>
              </div>
              <div className="flex gap-5">
                <MdLocationOn className="text-2xl" />
                <span>Bengaluru, India</span>
              </div>
              <div className="w-1/3 md:w-1/2 aspect-square absolute -bottom-20 md:-bottom-20 -right-20 md:-right-20 rounded-full bg-gradient-to-br from-blue-500 to-[#6994eb94]" />
            </div>
          </div>
          <div className="w-full p-5">
            <ContactForm />
          </div>
        </div>
      </div>
      <ScrollButton pageNo={0} isGoToTop={true} />
    </section>
  );
};

export default ContactMe;

import {motion} from "framer-motion";
import {forwardRef} from "react";
import {Toaster} from "react-hot-toast";

import {slideIn, textVariant} from "../../constants/motion";
import {BsFillTelephoneFill, MdEmail, MdLocationOn} from "../Icons";

import ScrollButton from "../ScrollButton";
import ContactForm from "./ContactForm";

const ContactMe = forwardRef(({contactMeRef}, ref) => {
  return (
    <section
      ref={contactMeRef}
      className="relative bg-white flex gap-10 flex-col h-fit md:h-screen justify-start items-center pt-40 dark:bg-black"
    >
      <Toaster
        containerStyle={{
          top: 100,
        }}
      />
      <div className="w-full flex gap-10 flex-col justify-start items-center">
        <motion.div variants={textVariant(0.1)} initial="hidden" whileInView="show">
          <h2 className="z-50 text-4xl text-primary dark:text-white font-bold flex justify-center items-center uppercase">
            Get In Touch
          </h2>
        </motion.div>
        <motion.div
          variants={slideIn("down", "", 0, 0.5)}
          initial={"hidden"}
          whileInView={"show"}
          className="bg-white dark:bg-[#232323] landscape:lg:w-[70%] portrait:w-[80%] mx-auto translate-y-24 shadow-lg dark:shadow-cyan-500/50 dark:shadow-sm md:rounded-lg flex flex-col md:flex-row justify-center items-center gap-10 lg:gap-0 md:drop-shadow-lg"
        >
          <div className="md:w-[40%] w-full h-full p-3">
            <div className="relative overflow-hidden flex flex-col gap-5 justify-start p-5 h-full text-white bg-tertiary rounded-lg">
              <div className="text-xl font-medium">Contact</div>
              <div className="flex gap-5">
                <BsFillTelephoneFill className="text-2xl" />
                <span className="text-sm lg:text-base">+91 - 7550147914</span>
              </div>
              <div className="flex gap-5">
                <MdEmail className="lg:text-2xl text-sm" />
                <span className="text-sm">Hardikverma22@gmail.com</span>
              </div>
              <div className="flex gap-5">
                <MdLocationOn className="text-2xl" />
                <span>Bengaluru, India</span>
              </div>
            </div>
          </div>
          <div className="w-full p-5">
            <ContactForm />
          </div>
        </motion.div>
      </div>
      <ScrollButton ref={ref} isGoToTop={true} />
    </section>
  );
});

export default ContactMe;

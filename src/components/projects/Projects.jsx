import CardSlider from "src/components/projects/CardSlider";
import ScrollButton from "src/components/common/ScrollButton";
import SectionTitle from "src/components/common/SectionTitle";

const Projects = () => {
  return (
    <section
      id="projects"
      className="relative
                flex flex-col gap-10 justify-center lg:justify-center items-center
                min-h-screen rounded-[5rem]
                bg-gradient-to-b from-secondary to-[#9fb0d2] dark:from-[#232323] dark:to-[#232323]"
    >
      <SectionTitle title="Projects" />
      <div className="h-full md:w-[94%] w-[75%] flex items-center justify-center md:max-h-screen">
        <CardSlider />
      </div>
      <ScrollButton id="contactme" />
    </section>
  );
};

export default Projects;

import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  AboutMe,
  ContactMe,
  NavigationBar,
  Projects,
  Skills,
  Summary,
} from "./components";
import ScrollButton from "./components/ScrollButton";

const App = () => {
  const summaryRef = useRef();
  const skillRef = useRef();
  const aboutMeRef = useRef();
  const projectsRef = useRef();
  const contactMeRef = useRef();

  const [moveImg, setMoveImg] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--vh",
      window.innerHeight * 0.01 + "px"
    );
  }, []);

  return (
    <main>
      <NavigationBar
        summaryRef={summaryRef}
        skillRef={skillRef}
        aboutMeRef={aboutMeRef}
        projectsRef={projectsRef}
        contactMeRef={contactMeRef}
      />

      <Summary moveImg={moveImg} summaryRef={summaryRef} ref={skillRef} />
      <Skills setMoveImg={setMoveImg} skillRef={skillRef} ref={aboutMeRef} />
      <AboutMe aboutMeRef={aboutMeRef} ref={projectsRef} />
      <Projects projectsRef={projectsRef} ref={contactMeRef} />
      <ContactMe contactMeRef={contactMeRef} ref={summaryRef} />
    </main>
  );
};

export default App;

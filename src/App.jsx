import {useEffect, useRef} from "react";
import "./App.css";
import {AboutMe, ContactMe, NavigationBar, Projects, Skills, Summary} from "./components";

const App = () => {
  const summaryRef = useRef();
  const skillRef = useRef();
  const aboutMeRef = useRef();
  const projectsRef = useRef();
  const contactMeRef = useRef();
  const mainRef = useRef();

  useEffect(() => {
    document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
  }, []);

  return (
    <main>
      <NavigationBar
        summaryRef={summaryRef}
        skillRef={skillRef}
        aboutMeRef={aboutMeRef}
        projectsRef={projectsRef}
        contactMeRef={contactMeRef}
        mainRef={mainRef}
      />

      <div ref={mainRef}>
        <Summary summaryRef={summaryRef} ref={skillRef} />
        <Skills skillRef={skillRef} ref={aboutMeRef} />
        <AboutMe aboutMeRef={aboutMeRef} ref={projectsRef} />
        <Projects projectsRef={projectsRef} ref={contactMeRef} />
        <ContactMe contactMeRef={contactMeRef} ref={summaryRef} />
      </div>
    </main>
  );
};

export default App;

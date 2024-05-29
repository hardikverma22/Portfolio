import {useEffect} from "react";
import "./App.css";
import {AboutMe, ContactMe, NavigationBar, Projects, Skills, Summary} from "./components";
import {Toaster} from "react-hot-toast";
import Testimonials from "components/testimonials/Testimonials";

const App = () => {
  useEffect(() => {
    document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
  }, []);

  return (
    <main>
      <NavigationBar />
      <div className="pt-16">
        <Summary />
        <Skills />
        <AboutMe />
        <Projects />
        <Testimonials />
        <ContactMe />
      </div>
      <Toaster containerStyle={{top: 100}} />
    </main>
  );
};

export default App;

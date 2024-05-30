import {useEffect} from "react";
import "./App.css";
import {AboutMe, ContactMe, NavigationBar, Projects, Skills, Summary} from "./components";
import {Toaster} from "react-hot-toast";
import Testimonials from "components/testimonials/Testimonials";
import {ErrorBoundary} from "react-error-boundary";

const App = () => {
  useEffect(() => {
    document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
  }, []);

  function fallbackRender({error, resetErrorBoundary}) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.

    return (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre style={{color: "red"}}>{error.message}</pre>
      </div>
    );
  }

  return (
    <main>
      <ErrorBoundary fallbackRender={fallbackRender}>
        <NavigationBar />
        <div className="pt-16">
          <Summary index={-1} />
          <Skills index={0} />
          <AboutMe index={1} />
          <Projects index={2} />
          <Testimonials index={3} />
          <ContactMe index={4} />
        </div>
        <Toaster containerStyle={{top: 100}} />
      </ErrorBoundary>
    </main>
  );
};

export default App;

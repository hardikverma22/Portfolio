import {useState, useEffect, useContext, createContext} from "react";
import {THEMES} from "../../lib/constants/index";

export const ThemeContext = createContext();

export const useTheme = () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) throw Error("Context not found");
  return themeContext;
};

export const ThemeProvider = ({children}) => {
  const [theme, setTheme] = useState(THEMES.LIGHT);

  const toggleTheme = () => {
    const currentTheme = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(currentTheme);
    localStorage.setItem("hdk-portfolio-theme", currentTheme);
  };

  useEffect(() => {
    const localTheme = localStorage.getItem("hdk-portfolio-theme");
    if (localTheme) {
      document.body.className = localTheme;
      setTheme(localTheme);
    } else {
      document.body.className = theme;
    }
  }, [theme]);

  return <ThemeContext.Provider value={{theme, toggleTheme}}>{children}</ThemeContext.Provider>;
};

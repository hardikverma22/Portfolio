import {useState, useContext, createContext} from "react";

export const ActiveIndexContext = createContext();

export const useActiveIndex = () => {
  const activeIndexContext = useContext(ActiveIndexContext);
  if (!activeIndexContext) throw Error("activeIndexContext  not found");
  return activeIndexContext;
};

export const ActiveIndexContextProvider = ({children}) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <ActiveIndexContext.Provider value={{activeIndex, setActiveIndex}}>
      {children}
    </ActiveIndexContext.Provider>
  );
};

import {createContext, useContext} from "react";

const NavContext = createContext(null);

export const useNavigation = useContext(NavContext);

const NavContextProvider = ({children}) => {
  // const []
  return <NavContext.Provider value={{}}>{children}</NavContext.Provider>;
};

export default NavContextProvider;

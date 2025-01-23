import React, { createContext, ReactNode, useContext } from "react";

interface GlobalContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
}

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const { data: user = null, loading } = { data: null, loading: false };

  const isLoggedIn = !!user; // use !! to convert to boolean
  //   console.log(JSON.stringify(user, null, 2));
  return (
    <GlobalContext.Provider value={{ isLoggedIn, user, loading }}>
      {children}
    </GlobalContext.Provider>
  )
};

export default GlobalProvider;

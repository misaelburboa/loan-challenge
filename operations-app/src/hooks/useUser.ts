import { getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [user, setUser] = useState<object | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        console.log(currentUser);
        setUser(currentUser);
        setIsLoggedIn(true);
      } catch (error) {
        setUser(null);
        setIsLoggedIn(false);
      }
    }

    fetchUser();
  }, []);

  const onSignOut = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const onSignIn = () => {
    setIsLoggedIn(true);
  };


  return { user, isLoading, isLoggedIn, onSignOut, onSignIn };
};

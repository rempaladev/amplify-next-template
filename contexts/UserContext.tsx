"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react";

interface UserContextType {
  email: string | null;
  username: string | null;
  userAttributes: any;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  email: null,
  username: null,
  userAttributes: null,
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, authStatus } = useAuthenticator((context) => [context.user]);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserAttributes() {
      if (authStatus === "authenticated") {
        try {
          const attributes = await fetchUserAttributes();
          setUserAttributes(attributes);
        } catch (error) {
          console.error("Error fetching user attributes:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadUserAttributes();
  }, [authStatus]);

  const email = userAttributes?.email || user?.signInDetails?.loginId || null;
  const username = user?.username || null;

  return (
    <UserContext.Provider value={{ email, username, userAttributes, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
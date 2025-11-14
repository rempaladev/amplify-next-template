"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useAuthenticator } from "@aws-amplify/ui-react";

Amplify.configure(outputs, { ssr: true });

const client = generateClient<Schema>({ authMode: 'userPool' });
  
export default function App() {
  const { signOut, user } = useAuthenticator();
  
  const email = user?.signInDetails?.loginId;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Welcome!</h1>
      <p>Email: {email}</p>
    </div>
  );
}

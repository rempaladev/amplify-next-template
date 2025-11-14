"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
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
    <div>
      <h1>Hello world!</h1>
      <p>Email: {email}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

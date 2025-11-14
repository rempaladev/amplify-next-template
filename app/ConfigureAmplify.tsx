"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useEffect } from "react";

export default function ConfigureAmplify() {
  useEffect(() => {
    Amplify.configure(outputs, { ssr: true });
  }, []);

  return null;
}
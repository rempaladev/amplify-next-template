"use client";
import { useState } from "react";
import { LearnerConversation } from "@/components/LearnerConversation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LearnerPage() {

  const languages = [
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  ];
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]); // Default to Polish



  console.log("Rendering LearnerPage with language: ", selectedLanguage.code);

  return (
    <div className="relative">
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default">
              I'm Learning - {selectedLanguage.flag} {selectedLanguage.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {languages.map((lang) => (
              <DropdownMenuItem key={lang.code} onClick={() => setSelectedLanguage(lang)}>
                {lang.flag} {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <LearnerConversation selectedLanguage={selectedLanguage} />
    </div>
  );
}
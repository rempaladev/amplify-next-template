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
    { code: "pl", name: "Polish", flag: "🇵🇱" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
  ];
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]); // Default to Polish

  console.log("Rendering LearnerPage with language: ", selectedLanguage.code);

  return (
    <div className="relative">
      <div className="absolute top-4 right-4">
        {/* Mobile compact */}
        <div className="block sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={`I'm learning ${selectedLanguage.name}`}
                className="w-9 h-9"
              >
                <span className="text-xl">{selectedLanguage.flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  I'm Learning - 
                  <span className="text-lg">{lang.flag}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop full label */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default">
                I'm Learning - {selectedLanguage.flag} {selectedLanguage.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang.flag} {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <LearnerConversation selectedLanguage={selectedLanguage} />
    </div>
  );
}
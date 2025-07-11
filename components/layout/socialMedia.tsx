'use client'

import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

export const SocialMedia = () => {
  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/cheerleadingindonesia/", "_blank");
  };

  const handleFacebookClick = () => {
    window.open("https://www.facebook.com/cheerleadingindonesia", "_blank");
  };

  const handleYoutubeClick = () => {
    window.open("https://www.youtube.com/@Cheerleadingindonesia", "_blank");
  };
    const handleLinkedinClick = () => {
    window.open("https://www.linkedin.com/in/indonesian-cheer-association-association-07a2a3339/", "_blank");
  };

  return (
    <div className="h-[50px] w-full bg-red-600 flex justify-center items-center">
      <div className="container mx-auto flex items-center justify-end gap-x-4">
        <div
          onClick={handleInstagramClick}
          className="text-white w-7 h-7 hover:cursor-pointer"
        >
          <Instagram />
        </div>
        <div
          onClick={handleFacebookClick}
          className="text-white w-7 h-7 hover:cursor-pointer"
        >
          <Facebook />
        </div>
        <div
          onClick={handleYoutubeClick}
          className="text-white w-7 h-7 hover:cursor-pointer"
        >
          <Youtube />
        </div>
         <div
          onClick={handleLinkedinClick}
          className="text-white w-7 h-7 hover:cursor-pointer"
        >
          <Linkedin />
        </div>
      </div>
    </div>
  );
};

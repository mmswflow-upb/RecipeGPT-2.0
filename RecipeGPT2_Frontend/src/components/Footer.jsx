import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import twitterIcon from "../assets/logos/twitter.png";
import facebookIcon from "../assets/logos/facebook.png";
import instagramIcon from "../assets/logos/instagram.png";
import tiktokIcon from "../assets/logos/tiktok.png";
import SocialIcon from "./SocialIcon";

const Footer = () => {
  const { theme } = useTheme();
  return (
    <footer
      className={`${
        theme === "light"
          ? "bg-[#FFFDF9] text-[#1D1D1D]"
          : "bg-black text-white"
      } border-t border-gray-200`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-start mx-auto">
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-left">
              <li>
                <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start mx-auto">
            <h3 className="text-sm font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-left">
              <li>
                <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                  FAQ
                </span>
              </li>
              <li>
                <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                  Contact Us
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start mx-auto">
            <h3 className="text-sm font-semibold mb-4">About Us</h3>
            <ul className="space-y-2 text-left">
              <li>
                <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                  Our Story
                </span>
              </li>
              <li>
                <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                  Team
                </span>
              </li>
              <li>
                <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                  Careers
                </span>
              </li>
              <li>
                <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                  Blog
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start mx-auto">
            <h3 className="text-sm font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <SocialIcon
                icon={twitterIcon}
                link="https://twitter.com/RecipeGPT"
                alt="Twitter"
              />
              <SocialIcon
                icon={facebookIcon}
                link="https://facebook.com/RecipeGPT"
                alt="Facebook"
              />
              <SocialIcon
                icon={instagramIcon}
                link="https://instagram.com/RecipeGPT"
                alt="Instagram"
              />
              <SocialIcon
                icon={tiktokIcon}
                link="https://tiktok.com/@RecipeGPT"
                alt="TikTok"
              />
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-[#6C757D]">
            &copy; 2025 RecipeGPT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

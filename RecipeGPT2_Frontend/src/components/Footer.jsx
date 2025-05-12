import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#FFFDF9] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-start mx-auto">
            <h3 className="text-sm font-semibold text-[#1D1D1D] mb-4">Legal</h3>
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
            <h3 className="text-sm font-semibold text-[#1D1D1D] mb-4">Help</h3>
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
            <h3 className="text-sm font-semibold text-[#1D1D1D] mb-4">
              About Us
            </h3>
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
            <h3 className="text-sm font-semibold text-[#1D1D1D] mb-4">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                <i className="fa-brands fa-twitter text-xl"></i>
              </span>
              <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                <i className="fa-brands fa-facebook text-xl"></i>
              </span>
              <span className="text-[#6C757D] hover:text-[#E63946] cursor-pointer">
                <i className="fa-brands fa-instagram text-xl"></i>
              </span>
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

import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-20 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 border-t border-gray-200 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-700">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} <span className="font-semibold">Pawan Kumar</span>. All rights reserved.
        </p>

        <div className="flex gap-6 items-center text-xl">
          <a
            href="https://www.linkedin.com/in/pawan-kumar0075/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition duration-300"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>

          <a
            href="https://github.com/pawan0110"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition duration-300"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
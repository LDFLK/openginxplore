import { Github, Linkedin, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className={`relative z-100 border-t border-border px-2 lg:px-6 w-full`}
    >
      <div className="py-6 p-2 md:px-14 lg:px-24 xl:px-56 mx-auto">
        <div className="flex items-center justify-between">
          {/* Copyright */}
          <a
            href="https://opendata.lk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="text-primary/75 text-sm">
              <span className="hover:text-accent">Open Data</span> ©{" "}
              {new Date().getFullYear()}. All rights reserved.
            </p>
          </a>

          {/* Social Media Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://discord.gg/wYKFyVEY"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-primary/75 hover:text-accent transition-all duration-200 hover:scale-110"
            >
              <MessageSquare className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/lankadata/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-primary/75 hover:text-accent transition-all hover:scale-110"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/LDFLK"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-primary/75 hover:text-accent transition-all duration-200 hover:scale-110"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

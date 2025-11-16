"use client";
import { useEffect, useState } from "react";

const asciiLoading = `
██╗      ██████╗  █████╗ ██████╗ ██╗███╗   ██╗ ██████╗  
██║     ██╔═══██╗██╔══██╗██╔══██╗██║████╗  ██║██╔════╝  
██║     ██║   ██║███████║██║  ██║██║██╔██╗ ██║██║  ███╗ 
██║     ██║   ██║██╔══██║██║  ██║██║██║╚██╗██║██║   ██║ 
███████╗╚██████╔╝██║  ██║██████╔╝██║██║ ╚████║╚██████╔╝
╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝ 
`;

export function SandboxLoading() {
  const [dotPosition, setDotPosition] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotPosition((prev) => (prev + 1) % 3);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex leading-tight">
        <pre>{asciiLoading}</pre>
        <pre className="block">
          {"\n"}
          {"\n"}
          {"\n"}
          {"\n"}
          {dotPosition !== 0 ? "\n" : ""}
          {"██╗\n╚═╝"}
        </pre>
        <pre className="block">
          {"\n"}
          {"\n"}
          {"\n"}
          {"\n"}
          {dotPosition !== 1 ? "\n" : ""}
          {"██╗\n╚═╝"}
        </pre>
        <pre className="block">
          {"\n"}
          {"\n"}
          {"\n"}
          {"\n"}
          {dotPosition !== 2 ? "\n" : ""}
          {"██╗\n╚═╝"}
        </pre>
      </div>
    </div>
  );
}

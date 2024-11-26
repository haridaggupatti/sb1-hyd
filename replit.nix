{
  description = "Node.js environment for Interview Prep App";

  deps = {
    pkgs = import <nixpkgs> {};
  };

  env = {
    VITE_OPENAI_API_KEY = "";
  };
}
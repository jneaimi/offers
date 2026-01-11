import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppLayout } from "./components/layout/AppLayout";
import { SetupWizard } from "./components/setup-wizard";
import "./App.css";

interface SetupStatus {
  is_complete: boolean;
  has_claude_md: boolean;
  has_generate_script: boolean;
  has_env_file: boolean;
  has_api_key: boolean;
  has_claude_config: boolean;
  project_path: string;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [projectPath, setProjectPath] = useState<string>("");

  useEffect(() => {
    // Check if setup is needed on app start
    invoke<SetupStatus>("check_setup", {})
      .then((status) => {
        setProjectPath(status.project_path);
        setNeedsSetup(!status.is_complete);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to check setup:", err);
        // On error, show setup wizard to let user choose path
        setNeedsSetup(true);
        setIsLoading(false);
      });
  }, []);

  const handleSetupComplete = (path: string) => {
    setProjectPath(path);
    setNeedsSetup(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (needsSetup) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return <AppLayout projectPath={projectPath} />;
}

export default App;

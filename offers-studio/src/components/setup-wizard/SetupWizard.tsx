import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SetupStatus {
  is_complete: boolean;
  has_claude_md: boolean;
  has_generate_script: boolean;
  has_env_file: boolean;
  has_api_key: boolean;
  has_claude_config: boolean;
  project_path: string;
}

interface UvStatus {
  installed: boolean;
  version: string | null;
}

interface SetupWizardProps {
  onComplete: (projectPath: string) => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState<'checking' | 'uv' | 'setup' | 'apikey' | 'complete'>('checking');
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [uvStatus, setUvStatus] = useState<UvStatus>({ installed: false, version: null });
  const [projectPath, setProjectPath] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check setup status on mount
  useEffect(() => {
    initializeSetup();
  }, []);

  const checkUvStatus = async (): Promise<UvStatus> => {
    try {
      const installed = await invoke<boolean>('check_uv_installed');
      let version: string | null = null;
      if (installed) {
        version = await invoke<string | null>('get_uv_version');
      }
      return { installed, version };
    } catch {
      return { installed: false, version: null };
    }
  };

  const initializeSetup = async () => {
    try {
      // Get the standard project path
      const standardPath = await invoke<string>('get_standard_project_path');
      setProjectPath(standardPath);

      // Check UV status
      const uv = await checkUvStatus();
      setUvStatus(uv);

      if (!uv.installed) {
        setStep('uv');
        return;
      }

      // Check if setup is already complete
      await checkSetupStatus(standardPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
      setStep('setup');
    }
  };

  const checkSetupStatus = async (path: string) => {
    try {
      // Initialize the project directory (creates if needed)
      await invoke('init_standard_project_path');
      await invoke('set_project_path', { projectPath: path });

      const result = await invoke<SetupStatus>('check_setup', { projectPath: path });
      setStatus(result);

      if (result.is_complete) {
        setStep('complete');
        onComplete(path);
      } else if (!result.has_claude_md || !result.has_generate_script || !result.has_claude_config) {
        setStep('setup');
      } else if (!result.has_api_key) {
        setStep('apikey');
      } else {
        setStep('setup');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check setup');
      setStep('setup');
    }
  };

  const handleInstallUv = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await invoke<string>('install_uv');

      // Wait for installation to settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      const uv = await checkUvStatus();
      setUvStatus(uv);

      if (uv.installed) {
        await checkSetupStatus(projectPath);
      } else {
        setError('UV was installed but may require a terminal restart. Please restart the app.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install UV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipUv = () => {
    checkSetupStatus(projectPath);
  };

  const handleSetup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Copy bundled resources
      await invoke('copy_bundled_resources', { projectPath });

      // Configure statusline for context tracking
      try {
        await invoke('install_statusline');
        await invoke('configure_claude_statusline');
      } catch {
        // Non-fatal
      }

      // Re-check status
      const result = await invoke<SetupStatus>('check_setup', { projectPath });
      setStatus(result);

      if (result.has_api_key) {
        setStep('complete');
        onComplete(projectPath);
      } else {
        setStep('apikey');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set up project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await invoke('save_api_key', { apiKey: apiKey.trim(), projectPath });
      setStep('complete');
      onComplete(projectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipApiKey = () => {
    setStep('complete');
    onComplete(projectPath);
  };

  if (step === 'checking') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-400">Checking setup...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900 p-8">
      <div className="max-w-lg w-full bg-gray-800 rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">GenImage Studio Setup</h1>
          <p className="text-gray-400">
            {step === 'uv' && 'Install required dependencies'}
            {step === 'setup' && 'Set up your workspace'}
            {step === 'apikey' && 'Configure your Google API key'}
            {step === 'complete' && 'Setup complete!'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${['uv', 'setup', 'apikey', 'complete'].includes(step) ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-8 h-0.5 ${['setup', 'apikey', 'complete'].includes(step) ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-3 h-3 rounded-full ${['setup', 'apikey', 'complete'].includes(step) ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-8 h-0.5 ${['apikey', 'complete'].includes(step) ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-3 h-3 rounded-full ${['apikey', 'complete'].includes(step) ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-8 h-0.5 ${step === 'complete' ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-3 h-3 rounded-full ${step === 'complete' ? 'bg-green-500' : 'bg-gray-600'}`} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step: UV Installation */}
        {step === 'uv' && (
          <div>
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-yellow-400 text-xl">⚠️</div>
                <div>
                  <h3 className="text-yellow-200 font-medium mb-1">Python UV Required</h3>
                  <p className="text-yellow-200/70 text-sm">
                    GenImage Studio uses UV to run Python scripts for image generation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-3">What is UV?</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Lightning-fast Python package installer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Automatically manages dependencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>No manual setup required</span>
                </li>
              </ul>
            </div>

            {uvStatus.installed && uvStatus.version && (
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2 text-green-300">
                  <span>✓</span>
                  <span>UV installed: {uvStatus.version}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSkipUv}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleInstallUv}
                disabled={isLoading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Installing...' : 'Install UV'}
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Official installer from{' '}
              <a href="https://astral.sh/uv" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                astral.sh/uv
              </a>
            </p>
          </div>
        )}

        {/* Step: Setup */}
        {step === 'setup' && (
          <div>
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-3">Workspace Location</h3>
              <code className="text-blue-400 text-sm break-all">{projectPath}</code>
              <p className="text-gray-400 text-sm mt-2">
                Your generated images and project files will be stored here.
              </p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-3">Files to be created:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className={status?.has_claude_md ? 'text-green-400' : 'text-yellow-400'}>
                    {status?.has_claude_md ? '✓' : '○'}
                  </span>
                  CLAUDE.md - Project guidance
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className={status?.has_generate_script ? 'text-green-400' : 'text-yellow-400'}>
                    {status?.has_generate_script ? '✓' : '○'}
                  </span>
                  generate-image.py - Image generation
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className={status?.has_claude_config ? 'text-green-400' : 'text-yellow-400'}>
                    {status?.has_claude_config ? '✓' : '○'}
                  </span>
                  .claude/ - Commands and skills
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-yellow-400">○</span>
                  generated_images/ - Output folder
                </li>
              </ul>
            </div>

            <button
              onClick={handleSetup}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Setting up...' : 'Set Up Workspace'}
            </button>
          </div>
        )}

        {/* Step: API Key */}
        {step === 'apikey' && (
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Google API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google API key"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <p className="mt-2 text-sm text-gray-400">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkipApiKey}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={isLoading || !apiKey.trim()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save API Key'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="text-center">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-xl font-medium text-white mb-2">You're all set!</h3>
            <p className="text-gray-400 mb-2">
              GenImage Studio is ready to generate images.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Workspace: <code className="text-blue-400">{projectPath}</code>
            </p>
            <button
              onClick={() => onComplete(projectPath)}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Using GenImage Studio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

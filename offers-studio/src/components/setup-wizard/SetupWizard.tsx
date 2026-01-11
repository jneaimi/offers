import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

interface SetupStatus {
  is_complete: boolean;
  has_claude_md: boolean;
  has_generate_script: boolean;
  has_env_file: boolean;
  has_api_key: boolean;
  has_claude_config: boolean;
  project_path: string;
}

interface SetupWizardProps {
  onComplete: (projectPath: string) => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState<'checking' | 'select' | 'copy' | 'apikey' | 'complete'>('checking');
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [projectPath, setProjectPath] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check setup status on mount
  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async (customPath?: string) => {
    try {
      const result = await invoke<SetupStatus>('check_setup', {
        projectPath: customPath || undefined
      });
      setStatus(result);
      setProjectPath(result.project_path);

      if (result.is_complete) {
        setStep('complete');
        onComplete(result.project_path);
      } else {
        // Always show select step first to let user choose/confirm path
        setStep('select');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check setup status');
      setStep('select');
    }
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Folder',
      });

      if (selected && typeof selected === 'string') {
        setProjectPath(selected);
        // Re-check setup status for the selected folder
        const result = await invoke<SetupStatus>('check_setup', {
          projectPath: selected
        });
        setStatus(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select folder');
    }
  };

  const handleConfirmPath = async () => {
    if (!projectPath) {
      setError('Please select a project folder');
      return;
    }

    // Set the project path in the backend
    try {
      await invoke('set_project_path', { projectPath });

      // Re-check status for this path
      const result = await invoke<SetupStatus>('check_setup', { projectPath });
      setStatus(result);

      if (result.is_complete) {
        setStep('complete');
        onComplete(projectPath);
      } else if (!result.has_claude_md || !result.has_generate_script || !result.has_claude_config) {
        setStep('copy');
      } else if (!result.has_api_key) {
        setStep('apikey');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set project path');
    }
  };

  const handleCopyResources = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await invoke('copy_bundled_resources', { projectPath });
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
      setError(err instanceof Error ? err.message : 'Failed to copy resources');
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
            {step === 'select' && 'Choose your project folder'}
            {step === 'copy' && 'Setting up project files...'}
            {step === 'apikey' && 'Configure your Google API key'}
            {step === 'complete' && 'Setup complete!'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${['select', 'copy', 'apikey', 'complete'].includes(step) ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-8 h-0.5 ${['copy', 'apikey', 'complete'].includes(step) ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-3 h-3 rounded-full ${['copy', 'apikey', 'complete'].includes(step) ? 'bg-blue-500' : 'bg-gray-600'}`} />
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

        {/* Step: Select Folder */}
        {step === 'select' && (
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Folder
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  placeholder="Select or enter project path"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                />
                <button
                  onClick={handleSelectFolder}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  title="Browse folders"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Choose where to set up your image generation project
              </p>
            </div>

            {/* Show current status for selected path */}
            {status && projectPath && (
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <h3 className="text-white font-medium mb-3 text-sm">Status for selected folder:</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className={status.has_claude_md ? 'text-green-400' : 'text-gray-500'}>
                      {status.has_claude_md ? '✓' : '○'}
                    </span>
                    CLAUDE.md
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className={status.has_generate_script ? 'text-green-400' : 'text-gray-500'}>
                      {status.has_generate_script ? '✓' : '○'}
                    </span>
                    generate-image.py
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className={status.has_claude_config ? 'text-green-400' : 'text-gray-500'}>
                      {status.has_claude_config ? '✓' : '○'}
                    </span>
                    .claude/ config
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className={status.has_api_key ? 'text-green-400' : 'text-gray-500'}>
                      {status.has_api_key ? '✓' : '○'}
                    </span>
                    API key configured
                  </li>
                </ul>
              </div>
            )}

            <button
              onClick={handleConfirmPath}
              disabled={!projectPath}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Continue with this folder
            </button>
          </div>
        )}

        {/* Step: Copy Resources */}
        {step === 'copy' && (
          <div>
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
                  generate-image.py - Image generation script
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className={status?.has_claude_config ? 'text-green-400' : 'text-yellow-400'}>
                    {status?.has_claude_config ? '✓' : '○'}
                  </span>
                  .claude/ - Commands and skills
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-yellow-400">○</span>
                  generated_images/ - Output directory
                </li>
              </ul>
            </div>

            <div className="text-sm text-gray-400 mb-6">
              Project path: <code className="text-blue-400 break-all">{projectPath}</code>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCopyResources}
                disabled={isLoading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Setting up...' : 'Setup Project Files'}
              </button>
            </div>
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
            <p className="text-gray-400 mb-6">
              GenImage Studio is ready to generate images.
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

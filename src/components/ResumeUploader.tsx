import { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import Button from './Button';
import TextareaAutosize from 'react-textarea-autosize';

interface ResumeUploaderProps {
  onUpload: (content: string) => Promise<void>;
}

const MAX_LENGTH = 4000;
const MIN_LENGTH = 100;

export default function ResumeUploader({ onUpload }: ResumeUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (text: string) => {
    setResumeText(text);
    if (text.length > MAX_LENGTH) {
      setError(`Resume is too long. Maximum ${MAX_LENGTH} characters allowed.`);
    } else if (text.length < MIN_LENGTH && text.length > 0) {
      setError(`Resume is too short. Minimum ${MIN_LENGTH} characters required.`);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || loading || error) return;

    try {
      setLoading(true);
      await onUpload(resumeText.trim());
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError('Failed to process resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = resumeText.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label 
              htmlFor="resume" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Paste your resume text
            </label>
            <span 
              className={`text-sm ${
                error 
                  ? 'text-red-500' 
                  : charCount > MAX_LENGTH * 0.9 
                    ? 'text-yellow-500' 
                    : 'text-gray-500'
              }`}
            >
              {charCount}/{MAX_LENGTH}
            </span>
          </div>
          
          <div className="relative">
            <TextareaAutosize
              id="resume"
              value={resumeText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste your resume content here..."
              className={`w-full rounded-md shadow-sm resize-none min-h-[200px] p-3 ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'
              } dark:bg-dark-700 dark:text-gray-100`}
              minRows={8}
              maxRows={20}
              disabled={loading}
            />
            {error && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-start pt-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p>Tips for a better interview experience:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Include your work experience with specific details</li>
              <li>List your technical skills and proficiency levels</li>
              <li>Mention notable projects and achievements</li>
              <li>Add relevant education and certifications</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !resumeText.trim() || !isValid}
            icon={<Send className="w-4 h-4" />}
          >
            Start Interview
          </Button>
        </div>
      </form>
    </div>
  );
}
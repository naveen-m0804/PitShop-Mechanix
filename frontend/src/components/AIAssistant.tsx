import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Bot, Send, Loader2, X, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface AIAssistantProps {
  onSuggestion?: (suggestion: string) => void;
}

interface DiagnosisResponse {
  diagnosis: string;
  recommendedAction: string;
  confidenceScore: number;
  clarifyingQuestions: string[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onSuggestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [response, setResponse] = useState<DiagnosisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAskAI = async () => {
    if (!issueDescription.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please describe your vehicle issue',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const result = await api.post('/ai/diagnose', {
        issueDescription: issueDescription.trim(),
        make: vehicleMake.trim() || null,
        model: vehicleModel.trim() || null,
        year: vehicleYear ? parseInt(vehicleYear) : null,
      });

      if (result.data) {
        setResponse(result.data);
      } else {
        setError('No response received from AI service');
      }
    } catch (err: any) {
      console.error('AI Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get AI response';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSuggestion = () => {
    if (onSuggestion && response) {
      onSuggestion(response.diagnosis);
      handleClose();
      toast({
        title: 'Suggestion Applied',
        description: 'AI diagnosis added to your request',
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIssueDescription('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleYear('');
    setResponse(null);
    setError(null);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'text-green-400';
    if (score >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.7) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

  // Helper function to format text into proper HTML with robust edge case handling
  const formatText = (text: string) => {
    if (!text) return null;

    // Pre-process: Clean up any broken markdown that might slip through
    let cleanedText = text
      // Remove standalone asterisks that aren't part of formatting
      .replace(/\*{1,2}([^*\n]+)(?!\*)/g, '$1')
      // Clean up any ** that doesn't have matching closure
      .replace(/\*\*([^*]+)$/gm, '$1')
      // Remove leading asterisks from lines
      .replace(/^\*+\s*/gm, '- ')
      // Normalize line breaks
      .replace(/\r\n/g, '\n');

    // Split by newlines and process each line
    const lines = cleanedText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: 'numbered' | 'bullet' | null = null;

    const flushList = () => {
      if (currentList.length > 0) {
        if (listType === 'numbered') {
          elements.push(
            <ol key={`ol-${elements.length}`} className="list-decimal pl-5 my-2 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm text-foreground/80">{formatInlineText(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-2 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm text-foreground/80">{formatInlineText(item)}</li>
              ))}
            </ul>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    // Format inline text (bold, italic)
    const formatInlineText = (line: string): React.ReactNode => {
      // Handle bold text with ** markers
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for numbered list (1. 2. 3. etc.)
      const numberedMatch = trimmedLine.match(/^(\d+)[.)]\s*(.+)/);
      if (numberedMatch) {
        if (listType !== 'numbered') {
          flushList();
          listType = 'numbered';
        }
        currentList.push(numberedMatch[2]);
        return;
      }

      // Check for bullet points (*, -, •, →)
      const bulletMatch = trimmedLine.match(/^[-•→]\s*(.+)/);
      if (bulletMatch) {
        if (listType !== 'bullet') {
          flushList();
          listType = 'bullet';
        }
        currentList.push(bulletMatch[1]);
        return;
      }

      // Regular line - flush any pending list
      flushList();

      // Skip empty lines but add spacing
      if (!trimmedLine) {
        elements.push(<div key={`space-${index}`} className="h-2" />);
        return;
      }

      // Check if it looks like a header (all caps or ends with colon)
      const isHeader = /^[A-Z][A-Z\s]+:?$/.test(trimmedLine) || trimmedLine.endsWith(':');
      
      if (isHeader && trimmedLine.length < 50) {
        elements.push(
          <p key={`header-${index}`} className="text-sm font-semibold text-foreground mt-2 mb-1">
            {trimmedLine.replace(/:$/, '')}
          </p>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={`para-${index}`} className="text-sm text-foreground/80 my-1">
          {formatInlineText(trimmedLine)}
        </p>
      );
    });

    // Flush any remaining list items
    flushList();

    return <div className="space-y-1">{elements}</div>;
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-bg text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-40"
        aria-label="AI Assistant"
        title="AI Vehicle Diagnosis Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* AI Assistant Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg glass-card border-white/10 max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <DialogTitle>AI Vehicle Diagnosis</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              Powered by HuggingFace AI - Describe your vehicle issue for an instant diagnosis.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 space-y-4 p-1">
            {/* Vehicle Info Section */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Make</label>
                <Input
                  placeholder="Toyota"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  className="input-glass text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Model</label>
                <Input
                  placeholder="Camry"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="input-glass text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Year</label>
                <Input
                  placeholder="2020"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  className="input-glass text-sm"
                  type="number"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Issue Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Describe your vehicle issue
              </label>
              <Textarea
                placeholder="e.g., Car won't start when I turn the key. I hear a clicking sound but the engine doesn't crank. Battery is less than a year old..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="input-glass min-h-[100px] resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Response Section */}
            {(response || isLoading || error) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">AI Diagnosis</label>
                <div className="p-4 rounded-lg border border-white/10 bg-secondary/20">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Analyzing your vehicle issue...</p>
                    </div>
                  ) : error ? (
                    <div className="text-red-400 text-sm">
                      <p className="font-medium">Error</p>
                      <p>{error}</p>
                    </div>
                  ) : response ? (
                    <div className="space-y-4">
                      {/* Diagnosis */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">Diagnosis</span>
                        </div>
                        <div className="pl-6">{formatText(response.diagnosis)}</div>
                      </div>

                      {/* Recommended Action */}
                      <div>
                        <span className="font-semibold text-foreground text-sm">Recommended Action</span>
                        <div className="mt-1">{formatText(response.recommendedAction)}</div>
                      </div>

                      {/* Confidence */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <span className={`text-sm font-medium ${getConfidenceColor(response.confidenceScore)}`}>
                          {getConfidenceLabel(response.confidenceScore)} ({Math.round(response.confidenceScore * 100)}%)
                        </span>
                      </div>

                      {/* Clarifying Questions */}
                      {response.clarifyingQuestions && response.clarifyingQuestions.length > 0 && (
                        <div>
                          <span className="font-semibold text-foreground text-sm">Clarifying Questions</span>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {response.clarifyingQuestions.map((q, i) => (
                              <li key={i} className="text-sm text-muted-foreground">{formatText(q)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground">
              💡 This AI diagnosis is for guidance only. Always have a professional mechanic verify any repairs.
            </p>
          </div>

          <DialogFooter className="flex gap-2 justify-end border-t border-white/10 pt-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-border hover:bg-secondary/50"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>

            {response && onSuggestion && (
              <Button
                onClick={handleUseSuggestion}
                variant="secondary"
              >
                Use Diagnosis
              </Button>
            )}

            <Button
              onClick={handleAskAI}
              disabled={isLoading || !issueDescription.trim()}
              className="gradient-bg text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Get Diagnosis
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAssistant;

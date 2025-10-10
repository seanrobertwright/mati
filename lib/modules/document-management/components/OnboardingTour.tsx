'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TourStep {
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * OnboardingTour component
 * Provides a guided tour for new users through the document management system
 */
export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Highlight target element if specified
    const step = steps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        element.classList.add('onboarding-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return () => {
      // Remove highlight from all elements
      document.querySelectorAll('.onboarding-highlight').forEach((el) => {
        el.classList.remove('onboarding-highlight');
      });
    };
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100]" aria-hidden="true" />

      {/* Tour Card */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
      >
        <div className="bg-background rounded-lg shadow-2xl max-w-md w-full p-6 border-2 border-primary">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 id="tour-title" className="text-lg font-semibold mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              aria-label="Skip tour"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div id="tour-description" className="mb-6">
            <p className="text-sm leading-relaxed">{step.content}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  aria-label="Previous step"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
              >
                Skip Tour
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleNext}
                aria-label={currentStep < steps.length - 1 ? 'Next step' : 'Complete tour'}
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  'Complete'
                )}
              </Button>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-4" role="presentation">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add global styles for highlighting */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 99;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

/**
 * Default tour steps for document management
 */
export const defaultDocumentManagementTour: TourStep[] = [
  {
    title: 'Welcome to Document Management',
    content:
      'This tour will guide you through the key features of the document management system. Let\'s get started!',
  },
  {
    title: 'Directory Navigation',
    content:
      'Use the directory tree on the left to organize your documents into folders and subfolders. Click on any directory to view its contents.',
    target: '[data-tour="directory-tree"]',
  },
  {
    title: 'Document List',
    content:
      'All documents in the selected directory appear here. You can search, sort, and filter documents using the controls above the list.',
    target: '[data-tour="document-list"]',
  },
  {
    title: 'Upload Documents',
    content:
      'Click the upload button to add new documents. You can drag and drop files or browse to select them.',
    target: '[data-tour="upload-button"]',
  },
  {
    title: 'Approval Workflow',
    content:
      'Documents go through a multi-stage approval process: draft → review → approval. Track the status in the document details.',
    target: '[data-tour="approval-workflow"]',
  },
  {
    title: 'Metrics Dashboard',
    content:
      'Monitor compliance metrics, overdue reviews, and document status from the metrics dashboard. Click on any metric to drill down.',
    target: '[data-tour="metrics-dashboard"]',
  },
  {
    title: 'All Set!',
    content:
      'You\'re ready to start managing documents! Remember, you can access help and documentation anytime from the menu.',
  },
];


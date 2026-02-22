"use client";

interface StepIndicatorProps {
  steps: Array<{ number: number; label: string }>;
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;
          
          return (
            <div 
              key={step.number} 
              className={`flex items-start ${isLast ? '' : 'flex-1'}`}
            >
              {/* Step circle and label */}
              <div className={`flex flex-col ${isFirst ? 'items-start' : isLast ? 'items-end' : 'items-center'}`}>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${
                    step.number <= currentStep
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    step.number <= currentStep ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connecting line - takes remaining space */}
              {!isLast && (
                <div className="flex-1 flex items-center h-10 px-3">
                  <div
                    className={`h-1 w-full rounded ${
                      step.number < currentStep ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

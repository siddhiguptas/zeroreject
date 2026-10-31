import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  action,
}) => {
  return (
    <div className="border-b border-[#DFDBD2] pb-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#162A45]">
            {eyebrow}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#111625] font-semibold tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-[#525866] max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
        {action && (
          <div className="shrink-0 flex items-center">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Sheet = ({ open, onOpenChange, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { open, onOpenChange });
            }
            return child;
          })}
        </>
      )}
    </AnimatePresence>
  );
};

export const SheetTrigger = React.forwardRef(({ children, ...props }, ref) => {
  return React.cloneElement(children, { ref, ...props });
});

export const SheetContent = ({ side = "right", className, children, open, onOpenChange }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const sideVariants = {
    left: { x: -300 },
    right: { x: 300 },
    top: { y: -300 },
    bottom: { y: 300 },
  };

  const sideClasses = {
    left: "inset-y-0 left-0 h-full border-r",
    right: "inset-y-0 right-0 h-full border-l",
    top: "inset-x-0 top-0 border-b",
    bottom: "inset-x-0 bottom-0 border-t",
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-50 bg-black/50"
      />
      
      {/* Sheet */}
      <motion.div
        initial={sideVariants[side]}
        animate={{ x: 0, y: 0 }}
        exit={sideVariants[side]}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "fixed z-50 bg-white shadow-lg",
          sideClasses[side],
          side === 'left' || side === 'right' ? 'w-3/4 sm:max-w-sm' : '',
          className
        )}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </motion.div>
    </>
  );
};

export const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left p-6", className)}
    {...props}
  />
);

export const SheetFooter = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6", className)}
    {...props}
  />
);

export const SheetTitle = ({ className, ...props }) => (
  <h2
    className={cn("text-lg font-semibold text-slate-950", className)}
    {...props}
  />
);

export const SheetDescription = ({ className, ...props }) => (
  <p
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
);

export const SheetClose = ({ children, ...props }) => {
  return React.cloneElement(children, props);
};

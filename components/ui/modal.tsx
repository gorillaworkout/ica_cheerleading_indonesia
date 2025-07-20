"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave?: () => void;
  isOpen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose, onSave, isOpen = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto my-8">
        <div className="relative bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-white/90 to-red-50/80 rounded-2xl" />
          
          {/* Content */}
          <div className="relative">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-4 sm:p-6 pb-4 border-b border-gray-200/50">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100/80 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Body - Scrollable */}
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 py-4">
              {children}
            </div>
            
            {/* Footer - Fixed */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 pt-4 border-t border-gray-200/50">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100/80 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
              {onSave && (
                <button
                  onClick={onSave}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default export for backwards compatibility
export default Modal;

import React from "react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose, onSave }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 border border-red-500">
        <h2 className="text-xl font-semibold mb-4 text-red-600">{title}</h2>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 border border-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 border border-red-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

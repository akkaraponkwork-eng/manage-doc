import { X } from 'lucide-react';

export default function Modal({ children, onClose, title, size = 'lg' }: { children: React.ReactNode; onClose: () => void; title: string; size?: 'lg' | 'xl' | '4xl' }) {
  const maxWidth = size === '4xl' ? 'max-w-4xl' : size === 'xl' ? 'max-w-xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} p-3 md:p-6 animate-fade-in-up max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

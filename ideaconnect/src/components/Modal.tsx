"use client";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'var(--overlay)' }} onClick={onClose} />
            <div className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-scale border border-[var(--border-color)]" style={{ background: 'var(--surface)' }}>
                <div className="px-6 sm:px-8 py-5 border-b border-[var(--border-color)] flex justify-between items-center" style={{ background: 'var(--input-bg)' }}>
                    <h2 className="text-lg font-bold text-theme-primary">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--surface-hover)] text-theme-secondary transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

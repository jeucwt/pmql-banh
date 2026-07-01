interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#7A2020] text-white px-6 py-3 rounded-xl text-sm font-medium shadow-[0_4px_20px_rgba(0,0,0,0.25)] whitespace-nowrap z-50 animate-[slideUp_.2s_ease]">
      ⚠️ {message}
    </div>
  );
}
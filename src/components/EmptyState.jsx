export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#222e35] text-center p-8">
      <div className="w-20 h-20 rounded-full bg-[#2a3942] flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-[#8696a0]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </div>
      <h2 className="text-[#e9edef] text-lg font-medium mb-2">
        Selecciona una conversación
      </h2>
      <p className="text-[#8696a0] text-sm max-w-xs">
        Elige una conversación del panel izquierdo para ver los mensajes y gestionar la atención.
      </p>
    </div>
  );
}

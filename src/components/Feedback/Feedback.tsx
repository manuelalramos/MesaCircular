export default function Feedback({ erro, sucesso }: { erro?: string; sucesso?: string }) {
    if (!erro && !sucesso) return null;
    return (
        <div
            className={`rounded-2xl border p-4 text-sm leading-6 ${erro ? 'border-vinho/20 bg-rosa/20 text-vinho' : 'border-verde/20 bg-verde/10 text-verde-escuro'}`}
            role={erro ? 'alert' : 'status'}
            aria-live="polite"
        >
            {erro || sucesso}
        </div>
    );
}

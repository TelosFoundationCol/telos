import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="serif text-7xl text-ink-faint tabular">404</div>
      <h1 className="serif text-3xl mt-2">Página no encontrada</h1>
      <p className="text-ink-muted mt-3 max-w-md">
        El enlace que abriste ya no existe o nunca existió. Vuelve al inicio y empieza desde ahí.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-full font-medium hover:bg-stone-800"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

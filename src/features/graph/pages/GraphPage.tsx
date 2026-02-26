import { useParams } from "react-router-dom";

export function GraphPage() {
  const { rootId } = useParams();

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <h1 className="text-2xl font-semibold">Graph {rootId}</h1>
    </main>
  );
}

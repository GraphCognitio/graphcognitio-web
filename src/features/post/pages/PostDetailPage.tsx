import { useParams } from "react-router-dom";

export function PostDetailPage() {
  const { id } = useParams();

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <h1 className="text-2xl font-semibold">Post {id}</h1>
    </main>
  );
}

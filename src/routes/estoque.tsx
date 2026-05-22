import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatBRL, useProducts } from "@/lib/store";

export const Route = createFileRoute("/estoque")({
  component: EstoquePage,
});

function statusFor(stock: number) {
  if (stock < 12) return { label: "Baixo", color: "text-destructive" };
  if (stock < 25) return { label: "Normal", color: "text-warning" };
  return { label: "Alto", color: "text-success" };
}

function EstoquePage() {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }, [products, query]);

  const totalItems = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter((p) => p.stock < 12).length;

  return (
    <div className="h-[calc(100vh-1.5rem)] bg-sidebar text-sidebar-foreground rounded-xl p-5 flex flex-col gap-5 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-card text-foreground outline-none"
          />
        </div>
        <button
          onClick={() => navigate({ to: "/pdv" })}
          className="px-5 py-2.5 rounded-lg bg-card text-foreground text-sm hover:bg-card/90"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total de produtos", value: products.length },
          { label: "Itens em estoque", value: totalItems },
          { label: "Estoque baixo", value: lowStock },
        ].map((s) => (
          <div key={s.label} className="bg-card text-foreground rounded-lg px-4 py-3 text-center">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-card text-foreground rounded-lg overflow-hidden flex flex-col min-h-0">
        <div className="overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const st = statusFor(p.stock);
                return (
                  <tr key={p.code} className="border-t">
                    <td className="px-4 py-3">{p.code}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3">{formatBRL(p.price)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className={`px-4 py-3 font-medium ${st.color}`}>{st.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

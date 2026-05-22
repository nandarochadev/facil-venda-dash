import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatBRL, useSales } from "@/lib/store";

export const Route = createFileRoute("/relatorios")({
  component: RelatoriosPage,
});

const COLORS = ["oklch(0.27 0.09 264)", "oklch(0.55 0.15 230)", "oklch(0.65 0.18 145)"];

function RelatoriosPage() {
  const { sales } = useSales();

  const now = new Date();
  const monthSales = sales.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = monthSales.reduce((s, x) => s + x.total, 0);

  const productData = useMemo(() => {
    const map = new Map<string, number>();
    monthSales.forEach((s) => s.items.forEach((i) => {
      map.set(i.name, (map.get(i.name) ?? 0) + i.qty);
    }));
    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [monthSales]);

  const paymentData = useMemo(() => {
    const map = new Map<string, number>();
    monthSales.forEach((s) => map.set(s.payment, (map.get(s.payment) ?? 0) + s.total));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [monthSales]);

  const monthName = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="h-[calc(100vh-1.5rem)] overflow-y-auto pr-1 space-y-3">
      <div className="bg-card rounded-xl border px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Relatórios</h2>
          <p className="text-sm text-muted-foreground capitalize">{monthName}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Vendido no mês</div>
          <div className="text-2xl font-semibold text-primary">{formatBRL(monthTotal)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{monthSales.length} venda(s)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border p-5">
          <h3 className="font-medium mb-1">Produtos mais vendidos</h3>
          <p className="text-xs text-muted-foreground mb-4">Quantidade vendida no mês</p>
          {productData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              Sem dados ainda.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "oklch(0.94 0.01 250)" }} />
                  <Bar dataKey="qty" fill="oklch(0.27 0.09 264)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h3 className="font-medium mb-1">Formas de pagamento</h3>
          <p className="text-xs text-muted-foreground mb-4">Preferências no mês (valor)</p>
          {paymentData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              Sem dados ainda.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { formatBRL, useSales } from "@/lib/store";

export const Route = createFileRoute("/historico")({
  component: HistoricoPage,
});

function HistoricoPage() {
  const { sales } = useSales();
  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.date).toDateString() === today);
  const total = todaySales.reduce((s, x) => s + x.total, 0);

  return (
    <div className="h-[calc(100vh-1.5rem)] flex flex-col gap-3 overflow-hidden">
      <div className="bg-card rounded-xl border px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Histórico de Vendas</h2>
          <p className="text-sm text-muted-foreground">Vendas realizadas hoje</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total vendido no dia</div>
          <div className="text-2xl font-semibold text-primary">{formatBRL(total)}</div>
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border overflow-hidden flex flex-col min-h-0">
        {todaySales.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma venda registrada hoje.
          </div>
        ) : (
          <div className="overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Horário</th>
                  <th className="px-4 py-3 font-medium">Itens</th>
                  <th className="px-4 py-3 font-medium">Pagamento</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {todaySales.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-3">
                      {new Date(s.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      {s.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(", ")}
                    </td>
                    <td className="px-4 py-3">{s.payment}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatBRL(s.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/30 font-medium">
                  <td className="px-4 py-3" colSpan={3}>Total do dia</td>
                  <td className="px-4 py-3 text-right">{formatBRL(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Bike, ClipboardList, CheckCircle2, MapPin, User } from "lucide-react";
import { formatBRL, useIFoodOrders, useSales, type Sale } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/ifood")({
  component: IFoodPage,
});

function IFoodPage() {
  const { orders, updateStatus } = useIFoodOrders();
  const { sales, addSale } = useSales();

  const today = new Date().toDateString();
  const ifoodSalesToday = sales.filter(
    (s) => s.channel === "iFood" && new Date(s.date).toDateString() === today,
  );
  const totalToday = ifoodSalesToday.reduce((s, x) => s + x.total, 0);

  const pending = orders.filter((o) => o.status !== "Entregue");

  function startPrep(id: string) {
    updateStatus(id, "Preparando");
    toast.success("Pedido em preparo");
  }

  function finalize(id: string) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    updateStatus(id, "Entregue");
    const sale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: order.items.map((i) => ({
        code: i.name,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      total: order.total,
      payment: "iFood",
      channel: "iFood",
    };
    addSale(sale);
    toast.success("Pedido entregue e registrado!");
  }

  return (
    <div className="h-[calc(100vh-1.5rem)] flex flex-col gap-3 overflow-hidden">
      <div className="bg-card rounded-xl border px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-[#EA1D2C]/10 text-[#EA1D2C] flex items-center justify-center">
            <Bike className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Entregas iFood</h2>
            <p className="text-sm text-muted-foreground">
              Pedidos a preparar e entregas do dia
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total de entregas hoje</div>
          <div className="text-2xl font-semibold text-primary">{formatBRL(totalToday)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {ifoodSalesToday.length} pedido(s) entregue(s)
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <div className="bg-card rounded-xl border flex flex-col min-h-0">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <ClipboardList className="size-4 text-muted-foreground" />
            <span className="font-medium">Pedidos a preparar</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {pending.length} em aberto
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {pending.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Nenhum pedido em aberto.
              </div>
            ) : (
              pending.map((o) => (
                <div key={o.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">{o.id}</div>
                      <div className="font-medium flex items-center gap-1.5">
                        <User className="size-3.5" /> {o.customer}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <MapPin className="size-3.5" /> {o.address}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        o.status === "Pendente"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2.5 space-y-1">
                    {o.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {i.qty}× {i.name}
                        </span>
                        <span>{formatBRL(i.price * i.qty)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-1.5 flex justify-between text-sm font-medium">
                      <span>Total</span>
                      <span>{formatBRL(o.total)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {o.status === "Pendente" && (
                      <button
                        onClick={() => startPrep(o.id)}
                        className="flex-1 py-2 rounded-md border text-sm hover:bg-accent"
                      >
                        Iniciar preparo
                      </button>
                    )}
                    <button
                      onClick={() => finalize(o.id)}
                      className="flex-1 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="size-4" />
                      Marcar como entregue
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border flex flex-col min-h-0">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <CheckCircle2 className="size-4 text-muted-foreground" />
            <span className="font-medium">Entregas concluídas hoje</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {ifoodSalesToday.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Nenhuma entrega registrada hoje.
              </div>
            ) : (
              ifoodSalesToday.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 border rounded-lg p-3"
                >
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.date).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex-1 text-sm truncate">
                    {s.items
                      .map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`)
                      .join(", ")}
                  </div>
                  <div className="text-sm font-medium">{formatBRL(s.total)}</div>
                </div>
              ))
            )}
            {ifoodSalesToday.length > 0 && (
              <div className="border-t pt-2 flex justify-between text-sm font-medium">
                <span>Total do dia</span>
                <span>{formatBRL(totalToday)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

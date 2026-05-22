import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShoppingCart, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL, useProducts, useSales, type Product, type Sale } from "@/lib/store";
import { toast } from "sonner";

type CartItem = { product: Product; qty: number };

export const Route = createFileRoute("/pdv")({
  component: PDVPage,
});

function PDVPage() {
  const { products, setProducts } = useProducts();
  const { addSale } = useSales();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todos" | "Doces" | "Bebidas" | "Salgados">("Todos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payment, setPayment] = useState<"Cartão" | "Pix" | "Dinheiro">("Cartão");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      const matchC =
        category === "Todos" ||
        (category === "Doces" && p.category === "Doce") ||
        (category === "Bebidas" && p.category === "Bebida") ||
        (category === "Salgados" && p.category === "Salgado");
      return matchQ && matchC;
    });
  }, [products, query, category]);

  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  function addToCart(p: Product) {
    if (p.stock <= 0) { toast.error("Produto sem estoque"); return; }
    setCart((c) => {
      const ex = c.find((i) => i.product.code === p.code);
      if (ex) return c.map((i) => i.product.code === p.code ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { product: p, qty: 1 }];
    });
  }

  function removeItem(code: string) {
    setCart((c) => c.filter((i) => i.product.code !== code));
  }

  function finalize() {
    const sale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: cart.map((i) => ({
        code: i.product.code, name: i.product.name, price: i.product.price, qty: i.qty,
      })),
      total,
      payment,
    };
    addSale(sale);
    // decrement stock
    const updated = products.map((p) => {
      const found = cart.find((i) => i.product.code === p.code);
      return found ? { ...p, stock: Math.max(0, p.stock - found.qty) } : p;
    });
    setProducts(updated);
    setCart([]);
    setCheckoutOpen(false);
    toast.success("Venda finalizada!");
    navigate({ to: "/historico" });
  }

  return (
    <div className="h-[calc(100vh-1.5rem)] flex flex-col gap-3">
      <div className="bg-card rounded-xl px-5 py-3.5 text-muted-foreground border">
        Nova Venda
      </div>

      <div className="flex-1 grid grid-cols-[1fr_320px] gap-3 min-h-0">
        {/* products */}
        <div className="bg-card rounded-xl border p-4 flex flex-col min-h-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex gap-2 mt-3">
            {(["Todos", "Doces", "Bebidas", "Salgados"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-md text-sm border transition ${
                  category === c ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1">
            {filtered.map((p) => (
              <button
                key={p.code}
                onClick={() => addToCart(p)}
                className="text-left bg-card border rounded-xl p-3 hover:shadow-md hover:-translate-y-0.5 transition relative"
              >
                <div className="flex items-start justify-between">
                  <div className="size-14 rounded-lg bg-muted flex items-center justify-center text-3xl">
                    {p.emoji}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatBRL(p.price)}</span>
                </div>
                <div className="mt-3 font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.code}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-10 text-sm">
                Nenhum produto encontrado.
              </div>
            )}
          </div>
        </div>

        {/* cart */}
        <div className="bg-card rounded-xl border flex flex-col min-h-0">
          <div className="px-4 py-3.5 border-b flex items-center gap-2">
            <ShoppingCart className="size-4 text-muted-foreground" />
            <span className="font-medium">Venda Atual</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <ShoppingCart className="size-10 opacity-40" />
                <span className="text-sm">Carrinho vazio</span>
              </div>
            ) : (
              cart.map((i) => (
                <div key={i.product.code} className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
                  <div className="size-9 rounded-md bg-card border flex items-center justify-center text-lg">
                    {i.product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{i.product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.qty}× {formatBRL(i.product.price)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">{formatBRL(i.product.price * i.qty)}</div>
                  <button onClick={() => removeItem(i.product.code)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                disabled={cart.length === 0}
                onClick={() => setCheckoutOpen(true)}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
              >
                Finalizar
              </button>
              <div className="text-sm text-muted-foreground">
                Total: <span className="text-foreground font-medium">{formatBRL(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Finalizar Venda</DialogTitle>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4 space-y-1.5">
            {cart.map((i) => (
              <div key={i.product.code} className="flex justify-between text-sm">
                <span>{i.product.name}{i.qty > 1 ? ` ×${i.qty}` : ""}</span>
                <span>{formatBRL(i.product.price * i.qty)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-end text-sm">
              <span className="text-muted-foreground mr-2">Total:</span>
              <span className="font-semibold">{formatBRL(total)}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["Cartão", "Pix", "Dinheiro"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPayment(m)}
                className={`py-2.5 rounded-lg text-sm border transition ${
                  payment === m ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={finalize}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            Continuar
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

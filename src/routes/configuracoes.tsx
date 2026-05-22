import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getPassword, setPassword, useSettings } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  component: ConfigPage,
});

function ConfigPage() {
  const { settings, setSettings } = useSettings();
  const [form, setForm] = useState(settings);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  function saveFiscal(e: React.FormEvent) {
    e.preventDefault();
    setSettings(form);
    toast.success("Dados fiscais salvos");
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (current !== getPassword()) return toast.error("Senha atual incorreta");
    if (next.length < 4) return toast.error("Nova senha muito curta");
    if (next !== confirm) return toast.error("As senhas não coincidem");
    setPassword(next);
    setCurrent(""); setNext(""); setConfirm("");
    toast.success("Senha atualizada");
  }

  const input = "w-full px-3 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-ring/40 text-sm";
  const label = "text-xs font-medium text-muted-foreground";

  return (
    <div className="h-[calc(100vh-1.5rem)] overflow-y-auto pr-1 space-y-3">
      <div className="bg-card rounded-xl border px-5 py-4">
        <h2 className="text-lg font-semibold">Configurações</h2>
        <p className="text-sm text-muted-foreground">Dados fiscais da empresa e segurança</p>
      </div>

      <form onSubmit={saveFiscal} className="bg-card rounded-xl border p-5 space-y-4">
        <h3 className="font-medium">Dados Fiscais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={label}>Razão Social</label>
            <input className={input} value={form.razaoSocial}
              onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className={label}>Nome Fantasia</label>
            <input className={input} value={form.nomeFantasia}
              onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className={label}>CNPJ</label>
            <input className={input} value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className={label}>Inscrição Estadual</label>
            <input className={input} value={form.inscricaoEstadual}
              onChange={(e) => setForm({ ...form, inscricaoEstadual: e.target.value })} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className={label}>Endereço</label>
            <input className={input} value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className={label}>E-mail</label>
            <input type="email" className={input} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            Salvar
          </button>
        </div>
      </form>

      <form onSubmit={changePassword} className="bg-card rounded-xl border p-5 space-y-4">
        <div>
          <h3 className="font-medium">Segurança</h3>
          <p className="text-xs text-muted-foreground">Senha inicial: <code className="bg-muted px-1 rounded">admin</code></p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={label}>Senha atual</label>
            <input type="password" className={input} value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className={label}>Nova senha</label>
            <input type="password" className={input} value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className={label}>Confirmar nova senha</label>
            <input type="password" className={input} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            Trocar senha
          </button>
        </div>
      </form>
    </div>
  );
}

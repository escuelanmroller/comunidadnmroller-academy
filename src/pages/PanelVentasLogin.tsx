import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock } from "lucide-react";

const PanelVentasLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/panel-ventas", { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "No pudimos iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-sm border border-border bg-card p-8">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <Lock className="w-5 h-5" />
          <span className="text-xs uppercase tracking-[0.18em] font-bold">Panel de ventas</span>
        </div>
        <h1 className="font-display italic uppercase text-2xl font-black mb-6">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="h-12 rounded-none bg-background border-border text-base"
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="h-12 rounded-none bg-background border-border text-base"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.18em] text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default PanelVentasLogin;

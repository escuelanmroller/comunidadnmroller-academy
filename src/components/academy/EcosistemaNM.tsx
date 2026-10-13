import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  GraduationCap,
  Globe,
  Handshake,
  Instagram,
  MessagesSquare,
  MonitorPlay,
  Package,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { ECOSISTEMA, INSTAGRAMS, NOTAS_TV, VIDEOS, WEB_PERSONAL, type ItemEcosistema } from "@/data/ecosistema";

const ICONOS: Record<ItemEcosistema["icono"], typeof Users> = {
  instructor: GraduationCap,
  comunidad: Users,
  alquiler: Package,
  venta: ShoppingBag,
  tienda: Store,
  cursos: MonitorPlay,
  mastery: Award,
  mentoria: MessagesSquare,
  empresa: Briefcase,
  franquicias: Handshake,
  importacion: Globe,
};

const cardCls =
  "group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/60";

const Tarjeta = ({ item }: { item: ItemEcosistema }) => {
  const Icono = ICONOS[item.icono];
  const contenido = (
    <>
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icono className="h-5 w-5" />
      </span>
      <h3 className="text-lg font-extrabold leading-snug">{item.titulo}</h3>
      <p className="mt-1.5 flex-1 text-base leading-relaxed text-neutral-300">{item.descripcion}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-emerald-400 group-hover:underline">
        {item.cta} <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </>
  );
  return item.tipo === "interno" ? (
    <Link to={item.href} className={cardCls}>
      {contenido}
    </Link>
  ) : (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cardCls}>
      {contenido}
    </a>
  );
};

export default function EcosistemaNM({ excluirIds = [] }: { excluirIds?: string[] }) {
  return (
    <div className="space-y-10">
      {(VIDEOS.length > 0 || NOTAS_TV.length > 0 || WEB_PERSONAL) && (
        <section>
          <h2 className="mb-4 text-xl font-extrabold">Mirá lo que hacemos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {VIDEOS.map((v) => (
              <div key={v.youtubeId} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube.com/embed/${v.youtubeId}?rel=0`}
                    title={v.titulo}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="p-4 text-sm font-semibold">{v.titulo}</p>
              </div>
            ))}
            {NOTAS_TV.map((n) => (
              <a
                key={n.url}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cardCls}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{n.medio ?? "Nota"}</span>
                <h3 className="mt-2 flex-1 text-lg font-extrabold leading-snug">{n.titulo}</h3>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Ver nota <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </a>
            ))}
            {WEB_PERSONAL && (
              <a href={WEB_PERSONAL.url} target="_blank" rel="noopener noreferrer" className={cardCls}>
                <Globe className="mb-4 h-6 w-6 text-primary" />
                <h3 className="flex-1 text-base font-extrabold leading-snug">{WEB_PERSONAL.titulo}</h3>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Visitar <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </a>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-1 text-xl font-extrabold">Todo el ecosistema NM Roller</h2>
        <p className="mb-4 text-base text-neutral-300">Mientras te contactamos, conocé todo lo que armamos.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {ECOSISTEMA.filter((item) => !excluirIds.includes(item.id)).map((item) => (
            <Tarjeta key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-center gap-3">
        {INSTAGRAMS.map((ig) => (
          <a
            key={ig.url}
            href={ig.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-card"
          >
            <Instagram className="h-4 w-4" /> {ig.usuario}
          </a>
        ))}
      </section>
    </div>
  );
}

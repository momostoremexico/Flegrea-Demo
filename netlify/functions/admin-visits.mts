import { getStore } from "@netlify/blobs"
import type { Config } from "@netlify/functions"
import { timingSafeEqual } from "node:crypto"

// Solo el administrador (con la contraseña guardada en ADMIN_KEY) puede ver las visitas.

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  })

function allowed(req: Request) {
  const key = Netlify.env.get("ADMIN_KEY")
  if (!key) return false
  const given = Buffer.from((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""))
  const want = Buffer.from(key)
  return given.length === want.length && timingSafeEqual(given, want)
}

export default async (req: Request) => {
  if (!allowed(req)) return json({ error: "Contraseña incorrecta" }, 401)

  const store = getStore("visitas")

  if (req.method === "DELETE") {
    const sid = new URL(req.url).searchParams.get("sid") || ""
    if (!/^[a-z0-9]{8,32}$/.test(sid)) return json({ error: "Visita no válida" }, 400)
    await store.delete(`s/${sid}`)
    return json({ ok: true })
  }

  const { blobs } = await store.list({ prefix: "s/" })
  const visits = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean)
  visits.sort((a: any, b: any) => b.start - a.start)
  return json({ visits: visits.slice(0, 2000) })
}

export const config: Config = { path: "/api/admin/visits", method: ["GET", "DELETE"] }

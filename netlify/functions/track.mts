import { getStore } from "@netlify/blobs"
import type { Config, Context } from "@netlify/functions"

// Recibe el estado de una visita a la demo y lo guarda (una entrada por visita).
// Cada visita la escribe solo la pestaña del visitante, así que la última versión es la buena.

const txt = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "")
const num = (v: unknown, max: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0
}

export default async (req: Request, context: Context) => {
  const body = await req.text()
  if (body.length > 40000) return new Response("Payload too large", { status: 413 })

  let s: any
  try {
    s = JSON.parse(body)
  } catch {
    return new Response("Bad JSON", { status: 400 })
  }
  if (!s || typeof s.sid !== "string" || !/^[a-z0-9]{8,32}$/.test(s.sid)) {
    return new Response("Bad session", { status: 400 })
  }

  const now = Date.now()
  const start = num(s.start, now) || now
  const path = Array.isArray(s.path)
    ? s.path.slice(0, 300).map((p: any) => ({ k: txt(p?.k, 40), t: num(p?.t, 864e5) })).filter((p: any) => p.k)
    : []

  const visit = {
    sid: s.sid,
    vid: txt(s.vid, 40),
    name: txt(s.name, 60).trim(),
    start,
    last: now,
    active: num(s.active, 864e5),
    dev: txt(s.dev, 20),
    ref: txt(s.ref, 80),
    path,
    tour: num(s.tour, 999),
    cta: num(s.cta, 999),
    city: context.geo?.city || "",
    region: context.geo?.subdivision?.name || "",
    country: context.geo?.country?.name || "",
  }

  await getStore("visitas").setJSON(`s/${s.sid}`, visit)
  return new Response(null, { status: 204 })
}

export const config: Config = { path: "/api/track", method: "POST" }

'use client'

import * as React from 'react'
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

// === Tailwind helpers
const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
const card = 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow'

// === Brands (labels + optional logo URLs)
const BRAND_LABELS: Record<string, string> = {
  RV: 'RangeVision', PX: 'Picaso 3D', AR: 'Artec', UM: 'Ultimaker', FL: 'Formlabs', RL: 'Roland', TR: 'Trotec',
  GMG: 'Geomagic', GOM: 'GOM Inspect', INV: 'Autodesk Inventor', F360: 'Fusion 360'
}
const BRAND_LOGOS: Record<string, string | undefined> = {
  // При недоступности логотипов сработает graceful‑fallback на текстовый бейдж
  RV: 'https://rangevision.com/wp-content/uploads/2022/09/rv-logo.svg',
  PX: 'https://upload.wikimedia.org/wikipedia/commons/6/66/PICASO_3D.svg',
  AR: undefined,
  UM: undefined,
  FL: undefined,
  RL: undefined,
  TR: undefined,
  GMG: undefined,
  GOM: undefined,
  INV: undefined,
  F360: undefined,
}

// === Data
const services = [
  { id: 'cad',      title: 'CAD/CAE‑моделирование',       descr: 'Параметрические модели, сборки, FEA‑анализ',        badge: 'R&D' },
  { id: 'reverse',  title: 'Реверсивный инжиниринг',       descr: '3D‑сканирование, обработка сеток, NURBS/САПР',     badge: 'Geomagic · GOM' },
  { id: 'am',       title: 'Аддитивное производство',      descr: 'FDM/DLP печать, постобработка, литьё',            badge: 'FDM · DLP' },
  { id: 'proto',    title: 'Прототипирование',             descr: 'Мастер‑модели, приспособления, малые серии',       badge: 'CNC · Laser' },
  { id: 'implants', title: 'Мед. изделия',                 descr: 'Ортезы, импланты, биопротезы',                     badge: 'MedTech' },
  { id: 'edu',      title: 'Образование',                  descr: 'Курсы ДПО, проектные школы, чемпионаты',          badge: '72 ч · 48 ч' },
]

// SVG placeholder data‑URL
const svgPh = (t: string) => `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 360'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#f8fafc'/>
        <stop offset='1' stop-color='#e2e8f0'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter,system-ui' font-size='28' fill='#334155'>${t}</text>
  </svg>`
)}`

// Equipment (категории + бренды)
const equipment: { name: string; note: string; brand: string; cat: '3D‑сканеры'|'3D‑принтеры'|'CNC и лазер' }[] = [
  { name: '3D‑сканер RangeVision NEO',      note: '2 шт.',         brand: 'RV', cat: '3D‑сканеры' },
  { name: '3D‑сканер RangeVision Spectrum', note: '1 шт.',         brand: 'RV', cat: '3D‑сканеры' },
  { name: 'Artec Eva',                      note: 'ручной, 2 шт.', brand: 'AR', cat: '3D‑сканеры' },
  { name: 'Ultimaker 3',                    note: 'FDM',           brand: 'UM', cat: '3D‑принтеры' },
  { name: 'Picaso 3D Designer X',           note: 'FDM',           brand: 'PX', cat: '3D‑принтеры' },
  { name: 'Formlabs (семейство)',           note: 'DLP/SLA',       brand: 'FL', cat: '3D‑принтеры' },
  { name: 'Roland MDX‑40/50/540',           note: 'CNC',           brand: 'RL', cat: 'CNC и лазер' },
  { name: 'Trotec Speedy 300',              note: 'Лазер',         brand: 'TR', cat: 'CNC и лазер' },
]
const software: { name: string; note: string; brand: string }[] = [
  { name: 'Geomagic',          note: 'Reverse/Design', brand: 'GMG' },
  { name: 'GOM Inspect',       note: 'Метрология',     brand: 'GOM' },
  { name: 'Autodesk Inventor', note: 'CAD',            brand: 'INV' },
  { name: 'Fusion 360',        note: 'CAD/CAM/CAE',    brand: 'F360' },
]
const equipmentCatalog: { cat: string; items: { name: string; note: string; brand: string }[] }[] = [
  { cat: '3D‑сканеры',  items: equipment.filter(e => e.cat==='3D‑сканеры') },
  { cat: '3D‑принтеры', items: equipment.filter(e => e.cat==='3D‑принтеры') },
  { cat: 'CNC и лазер', items: equipment.filter(e => e.cat==='CNC и лазер') },
  { cat: 'ПО',          items: software },
]

const projects: { title: string; tags: string[]; desc: string; images: string[] }[] = [
  { title: 'Изготовление ортезов и протезов', tags: ['MedTech','FDM/DLP'], desc: 'Индивидуальные ортезы и протезы: от скана до готового изделия.', images: [svgPh('Ортез · фото 1'), svgPh('Ортез · фото 2'), svgPh('Ортез · фото 3')] },
  { title: 'Оцифровка объектов культурного наследия', tags: ['Scan','CAD'], desc: 'Сканирование и восстановление геометрии, подготовка экспозиционных макетов.', images: [svgPh('ОКН · фото 1'), svgPh('ОКН · фото 2')] },
  { title: 'Реверс и модернизация бытовых изделий', tags: ['Reverse','CAD'], desc: 'Реверс‑аналитика, улучшение эргономики и технологичности.', images: [svgPh('Реверс · 1'), svgPh('Реверс · 2')] },
  { title: 'Боевые роботы (до 1.5 кг)', tags: ['Robotics','CNC/3D'], desc: 'Концепция, CAD, печать/ЧПУ‑детали, сборка, тесты.', images: [svgPh('Робот · 1'), svgPh('Робот · 2')] },
]

const courses = [
  { id: 'indeng',  title: 'Промышленный дизайн и инжиниринг',                summary: 'CAD, прототипирование, аддитивные технологии',              hours: '72 ч',    audience: '7–11 класс, студенты',       href: '/courses/indeng' },
  { id: 'reverse', title: 'Реверсивный инжиниринг и аддитивное производство', summary: '3D‑сканирование, обработка сканов, CAD, 3D‑печать',        hours: '48–72 ч', audience: 'Студенты и специалисты', href: '/courses/reverse' },
]

// === Адрес: оставили один «Беговая, 12», заголовок «Адрес» + интерактивная карта
const addresses = [ { campus: 'Беговая', address: 'ул. Беговая, 12' } ] as const

const team = [
  { name: 'Владимир Ганьшин',   role: 'руководитель лаборатории',       skills: 'CAD/AM, реверс, методология ДПО' },
  { name: 'Анна Понкратова',    role: 'ведущий инженер‑преподаватель',  skills: '3D‑сканирование, обработка сеток' },
  { name: 'Алексей Рекут',      role: 'инженер‑конструктор',            skills: 'CAD, ЧПУ, прототипы' },
]

const faq = [
  { q: 'Какие материалы печати доступны?', a: 'PLA, PETG, ABS, нейлон; смолы DLP/SLA (стандартные и инженерные). Доступна постобработка и окраска.' },
  { q: 'Сколько занимает цикл «скан‑CAD‑печать»?', a: 'От 2 до 10 рабочих дней в зависимости от размера, точности и загрузки оборудования.' },
  { q: 'Можно ли обучаться дистанционно?', a: 'Да, теорию и разбор кейсов проводим онлайн. Практику и сканирование — очно в технопарке.' },
  { q: 'Вы выдаёте документы о повышении квалификации?', a: 'Да, по итогам программ ДПО (48–72 ч) — удостоверение установленного образца.' },
  { q: 'Берёте проекты под НИР/НИОКР?', a: 'Да, оформляем задачи как исследовательские проекты с публикациями и отчётными материалами.' },
  { q: 'Как оставить заявку?', a: 'Нажмите «Оставить заявку» и заполните форму — ответим в ближайшее время.' },
]

// === ICS utils (оставили — на будущее)
const pad = (n: number) => String(n).padStart(2, '0')
const toICSTime = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
function buildICS({ title, start, end, description, location }: { title: string; start: Date; end: Date; description?: string; location?: string }) {
  const safeDesc = (description || '').replace(/\r?\n/g, '\\n')
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//RGSU TechnoPark//Lab//RU\nBEGIN:VEVENT\nUID:${Date.now()}@rgsu-techno\nDTSTAMP:${toICSTime(new Date())}\nDTSTART:${toICSTime(start)}\nDTEND:${toICSTime(end)}\nSUMMARY:${title}\nDESCRIPTION:${safeDesc}\nLOCATION:${location || ''}\nEND:VEVENT\nEND:VCALENDAR`
}
function downloadICS(args: { title: string; start: Date; end: Date; description?: string; location?: string }) {
  const ics = buildICS(args)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${args.title}.ics`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
}

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    console.group('[Lab] dev‑tests')
    const start = new Date('2025-10-12T09:00:00Z'), end = new Date('2025-10-12T11:00:00Z')
    const s = buildICS({ title: 'Test', start, end, description: 'Line1\nLine2', location: 'Москва' })
    console.assert(s.startsWith('BEGIN:VCALENDAR\nVERSION:2.0'), 'ICS header')
    console.assert(s.includes('DTSTART:20251012T090000Z') && s.includes('DTEND:20251012T110000Z'), 'DT times ok')
    console.assert(s.includes('DESCRIPTION:Line1\\nLine2'), 'Escaped newlines')
    console.assert(/UID:\\d+@rgsu-techno/.test(s), 'UID present')
    const allBrandsCovered = [...equipment, ...software].every(e => BRAND_LABELS[e.brand] !== undefined)
    console.assert(allBrandsCovered, 'Every brand has a label mapping')
    console.groupEnd()
  } catch (e) { console.error('[Lab] Dev tests failed', e) }
}

// === Page
export default function LabIndustrialDesign() {
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.15 })

  const [modalOpen, setModalOpen] = React.useState(false)
  const [requestType, setRequestType] = React.useState<'course'|'service'|'partner'>('course')
  const [active, setActive] = React.useState<'services'|'equipment'|'projects'|'courses'|'team'|'faq'|'contacts'|'top'>('top')
  const [aboutOpen, setAboutOpen] = React.useState(false)

  const lastFocusRef = React.useRef<HTMLElement | null>(null)
  const firstInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    const ids = ['services','equipment','projects','courses','team','faq','contacts']
    const obs = new IntersectionObserver((es) => {
      const v = es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]
      if (v?.target?.id) setActive(v.target.id as any)
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0,0.25,0.5,0.75,1] })
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  React.useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key==='Escape') setModalOpen(false)
      if (e.key==='Tab'){
        const dlg = document.getElementById('modal-request'); if(!dlg) return
        const f = dlg.querySelectorAll<HTMLElement>('button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')
        if(!f.length) return
        const first=f[0], last=f[f.length-1]
        if(e.shiftKey && document.activeElement===first){ last.focus(); e.preventDefault() }
        else if(!e.shiftKey && document.activeElement===last){ first.focus(); e.preventDefault() }
      }
    }
    document.addEventListener('keydown', onKey)
    firstInputRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen])

  return (
    <div>
      {/* SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context':'https://schema.org', '@type':'EducationalOrganization',
        name:'Step3D.Lab — Лаборатория промдизайна и инжиниринга',
        department:[{'@type':'Organization',name:'Дополнительное профессиональное образование'}],
        address:addresses.map(a=>({'@type':'PostalAddress',streetAddress:a.address,addressLocality:'Москва',addressCountry:'RU'})),
        sameAs:['https://technopark-rgsu.ru']
      }) }} />

      <div id="top" className="min-h-screen text-slate-800 bg-gradient-to-b from-white to-slate-50">
        <motion.div style={{ scaleX: progress }} className="fixed top-0 left-0 right-0 h-1 origin-left bg-slate-900/90 z-50 will-change-transform" />

        <header className="relative overflow-hidden">
          <div className={`${container} pt-20 pb-16 md:pt-28 md:pb-18 relative z-10`}>
            <NavBar active={active} />
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              <Hero onOpen={() => { lastFocusRef.current = document.activeElement as HTMLElement; setModalOpen(true) }} onAboutToggle={() => setAboutOpen(o=>!o)} />
              <motion.div initial={{ opacity: 0, y: prefersReduced ? 0 : 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative aspect-square">
                <Abstract3D />
              </motion.div>
            </div>
            {aboutOpen && <AboutText />}
          </div>
          <BgShapes />
        </header>

        {/* Services */}
        <section id="services" className="py-16 md:py-24">
          <div className={container}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Возможности лаборатории</h2>
            <p className="text-slate-600 max-w-3xl">Полный цикл: от скана и CAD до печати, постобработки и презентации. Параллельно обучаем и сопровождаем проекты.</p>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((s) => (
                <article key={s.id} className={`${card} group`}>
                  <div className="flex items-start gap-4">
                    <HexIcon className="h-10 w-10" />
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">{s.title}</h3>
                      <p className="mt-1 text-slate-600 text-sm">{s.descr}</p>
                      <span className="mt-3 inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{s.badge}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Equipment (категории) */}
        <section id="equipment" className="py-16 md:py-24 bg-white">
          <div className={container}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Оборудование и ПО</h2>
            <p className="text-slate-600 max-w-3xl">Профессиональные 3D‑сканеры, принтеры FDM/DLP, лазерная резка, ЧПУ; Geomagic, GOM Inspect, Inventor, Fusion 360 и др.</p>

            <div className="mt-6 grid lg:grid-cols-2 gap-8">
              {equipmentCatalog.map(group => (
                <div key={group.cat} className="rounded-3xl border border-slate-200 p-4">
                  <h3 className="text-lg font-semibold mb-3">{group.cat}</h3>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {group.items.map((e, i) => (
                      <li key={`${group.cat}-${i}`} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                        <span className="font-medium flex items-center gap-3"><BrandMark code={e.brand} /> {e.name}</span>
                        <span className="text-sm text-slate-500">{e.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="py-16 md:py-24">
          <div className={container}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Проекты и направления НИР</h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {projects.map((p, idx) => (
                <ProjectCard key={idx} project={p} />
              ))}
            </div>
          </div>
        </section>

        {/* Courses */}
        <section id="courses" className="py-16 md:py-24 bg-white">
          <div className={container}>
            {/* Ряд «космических захватчиков» до заголовка */}
            <InvadersRow />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Курсы ДПО и проектные школы</h2>
            <p className="text-slate-600 max-w-3xl">Учебные планы на 48–72 часа с индивидуальными проектами, подготовка к чемпионатам «Профессионалы», WorldSkills, HI‑TECH.</p>
            <details className="mt-4 rounded-2xl border border-slate-200 p-4 open:shadow-sm">
              <summary className="cursor-pointer font-medium">Образовательные проекты совместно с ФГБОУ ВО РГСУ</summary>
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                <li>Знакомство со сканерами, подготовка объекта</li>
                <li>Обработка сеток: чистка, выравнивание, ремешинг</li>
                <li>Восстановление поверхностей/NURBS</li>
                <li>CAD‑проектирование и контроль</li>
                <li>Подготовка к печати, постобработка</li>
              </ul>
            </details>
            <div className="mt-8 grid sm:grid-cols-2 gap-6 md:gap-8">
              {courses.map((c) => (
                <a key={c.id} href={c.href} className={`${card} group block focus:outline-none focus:ring-4 focus:ring-slate-200`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <Logo3D className="h-10 w-10" />
                        <h3 className="text-xl font-semibold leading-tight group-hover:underline underline-offset-4">{c.title}</h3>
                      </div>
                      <p className="mt-2 text-slate-600">{c.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500"><Chip>{c.hours}</Chip><Chip>{c.audience}</Chip></div>
                    </div>
                    <ArrowRIcon className="mt-1 h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="py-16 md:py-24">
          <div className={container}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Команда</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {team.map((m) => (
                <div key={m.name} className={`${card} flex items-center gap-4`}>
                  <Avatar name={m.name} size={80} />
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-sm text-slate-500">{m.role}</div>
                    <div className="mt-1 text-sm text-slate-600">{m.skills}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 md:py-24 bg-white">
          <div className={container}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">FAQ</h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {faq.map((f, i) => (
                <details key={i} className={`${card} open:shadow-md`}>
                  <summary className="cursor-pointer font-medium">{f.q}</summary>
                  <p className="mt-2 text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contacts */}
        <footer id="contacts" className="py-16 md:py-24 border-t border-slate-200 bg-white">
          <div className={container}>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Контакты</h2>
                <p className="mt-3 text-slate-600 max-w-prose">Задайте вопрос или оставьте заявку — поможем выбрать формат: учебный модуль, проект, НИОКР или услуга.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button ref={lastFocusRef as any} type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white font-medium shadow hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300" aria-label="Оставить заявку — открыть форму" data-analytics="open-modal">Оставить заявку</button>
                  <a href="https://t.me/DTRSSU" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 border border-slate-200 font-medium shadow-sm hover:shadow focus:outline-none focus:ring-4 focus:ring-slate-200">Telegram‑канал</a>
                </div>
              </div>
              <div className={`${card}`}>
                <h3 className="font-semibold mb-2">Адрес</h3>
                <div className="text-sm text-slate-700">
                  <div className="font-medium">Беговая</div>
                  <div>Москва, {addresses[0].address}</div>
                </div>
                <LeafletMap />
                <div className="mt-4 text-sm text-slate-500">© {new Date().getFullYear()} Технопарк РГСУ</div>
              </div>
            </div>
          </div>
        </footer>

        <SiteFooter />

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
            <div id="modal-request" role="dialog" aria-modal="true" aria-labelledby="request-title" className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <h3 id="request-title" className="text-xl font-semibold">Оставить заявку</h3>
              <p className="text-slate-600 mt-1">Заполните контакты — мы свяжемся и обсудим задачу.</p>
              <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget as HTMLFormElement; const fd = new FormData(form); const payload = Object.fromEntries(fd.entries()); console.log('[Request]', payload); setModalOpen(false) }}>
                {/* honeypot */}
                <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

                <label className="grid gap-1 text-sm">
                  <span>Цель обращения</span>
                  <select name="type" required defaultValue={requestType} onChange={(ev)=> setRequestType(ev.target.value as 'course'|'service'|'partner')} className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-slate-200">
                    <option value="course">Запись на курс</option>
                    <option value="service">Заказ услуги</option>
                    <option value="partner">Сотрудничество</option>
                  </select>
                </label>

                <label className="grid gap-1 text-sm"><span>Имя</span><input ref={firstInputRef} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-slate-200" name="name" /></label>
                <label className="grid gap-1 text-sm"><span>Телефон</span><input required className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-slate-200" name="phone" /></label>
                <label className="grid gap-1 text-sm"><span>Email</span><input type="email" className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-slate-200" name="email" /></label>

                {requestType==='course' && (
                  <label className="grid gap-1 text-sm">
                    <span>Курс</span>
                    <select name="course" className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-slate-200">
                      {courses.map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}
                    </select>
                  </label>
                )}

                {requestType==='service' && (
                  <label className="grid gap-1 text-sm">
                    <span>Услуга</span>
                    <select name="service" className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-slate-200">
                      {services.map(s => (<option key={s.id} value={s.id}>{s.title}</option>))}
                    </select>
                  </label>
                )}

                {requestType==='partner' && (
                  <>
                    <label className="grid gap-1 text-sm"><span>Организация</span><input name="org" className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-slate-200" /></label>
                    <label className="grid gap-1 text-sm"><span>Должность / роль</span><input name="role" className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-slate-200" /></label>
                  </>
                )}

                <label className="grid gap-1 text-sm">
                  <span>Комментарий</span>
                  <textarea rows={3} className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-slate-200" name="comment" placeholder="Опишите задачу, желаемые сроки, ссылки" />
                </label>

                <div className="flex items-center gap-2 text-sm"><input id="agree" required type="checkbox" className="h-4 w-4" /><label htmlFor="agree">Согласен(а) на обработку персональных данных</label></div>
                <div className="mt-2 flex gap-3">
                  <button className="rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800" type="submit" data-analytics="submit-form">Отправить</button>
                  <button className="rounded-xl border border-slate-300 px-4 py-2" type="button" onClick={() => setModalOpen(false)}>Отмена</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// === UI components
function NavBar({ active }: { active: string }) {
  const [open, setOpen] = React.useState(false)
  const links = [
    { id:'services', label:'Возможности' },
    { id:'equipment',label:'Оборудование' },
    { id:'projects', label:'Проекты' },
    { id:'courses',  label:'Курсы' },
    { id:'team',     label:'Команда' },
    { id:'faq',      label:'FAQ' },
    { id:'contacts', label:'Контакты' },
  ]
  return (
    <nav className="mb-10" aria-label="Главная навигация">
      <div className="flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3 font-semibold">
          <Logo3D className="h-8 w-8" /> Step3D.Lab
        </a>
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.id} href={`#${l.id}`} className={`px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 ${active===l.id?'bg-slate-900 text-white':''}`} aria-current={active===l.id?'page':undefined}>{l.label}</a>
          ))}
        </div>
        <div className="md:hidden flex items-center gap-2">
          <button onClick={() => setOpen(o=>!o)} aria-expanded={open} aria-label="Меню" className="rounded-xl border p-2">
            <BurgerIcon />
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-3 grid gap-2 md:hidden">
          {links.map(l => (
            <a key={l.id} href={`#${l.id}`} onClick={()=>setOpen(false)} className={`px-3 py-2 rounded-xl text-sm font-medium border ${active===l.id?'bg-slate-900 text-white':'bg-white border-slate-200'}`}>{l.label}</a>
          ))}
        </div>
      )}
    </nav>
  )
}

function Hero({ onOpen, onAboutToggle }: { onOpen: () => void; onAboutToggle: () => void }) {
  return (
    <div>
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">Лаборатория промдизайна и инжиниринга</h1>
      <p className="mt-4 text-lg text-slate-600 max-w-prose">CAD/CAE, реверсивный инжиниринг, 3D‑сканирование, аддитивное производство. Учим и делаем продукты на базе технопарка РГСУ совместно с ООО «СТЕП 3Д».</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={onOpen} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white font-medium shadow hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300">Оставить заявку</button>
        <button onClick={onAboutToggle} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-medium">О лаборатории</button>
      </div>
    </div>
  )
}

function Abstract3D() {
  const prefersReduced = useReducedMotion()
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative size-72 md:size-96">
        {/* Pixel/Invader frame */}
        <div className="absolute inset-0 grid grid-cols-9 grid-rows-9 gap-1 opacity-25">
          {Array.from({length:81}).map((_,i)=> (
            <div key={i} className={`rounded-sm ${[0,1,2,3,5,6,7,8,9,17,27,35,45,53,63,71,72,73,74,75,76,77,78,79,80].includes(i)?'bg-slate-400/70':''}`} />
          ))}
        </div>
        {/* Floating cubes */}
        {[0,1,2].map((i)=> (
          <motion.div key={i} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: prefersReduced ? 0 : [ -8, 8, -8 ] }} transition={{ duration: 4 + i, repeat: prefersReduced ? 0 : Infinity }}>
            <div className="size-24 md:size-28 rotate-45 bg-gradient-to-br from-slate-200 to-slate-400 rounded-[1.25rem] shadow-lg" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function BgShapes(){
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-br from-sky-300/30 to-violet-300/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-300/30 to-cyan-300/30 blur-3xl" />
    </div>
  )
}

function InvadersRow(){
  const prefersReduced = useReducedMotion()
  const [alive, setAlive] = React.useState(() => Array.from({length: 14}, () => true))
  return (
    <div className="mb-6" aria-hidden>
      <div className="relative h-16 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-center gap-3 px-3">
        {alive.map((isAlive, idx) => (
          <motion.button
            key={idx}
            onClick={()=> setAlive(a => a.map((v,i)=> i===idx ? false : v))}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: isAlive?1:0, y: isAlive?0:-12, scale: isAlive?1:0.6, rotate: isAlive?0:15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-1"
            aria-label="Захватчик"
          >
            <InvaderSvg />
          </motion.button>
        ))}
      </div>
      <div className="sr-only">Нажмите на пиксельных «космических захватчиков», чтобы они исчезли.</div>
    </div>
  )
}

function InvaderSvg(){
  return (
    <svg viewBox="0 0 16 12" width="22" height="16" aria-hidden>
      <rect x="0" y="4" width="2" height="2" fill="#475569"/>
      <rect x="14" y="4" width="2" height="2" fill="#475569"/>
      <rect x="2" y="2" width="12" height="8" fill="#64748b"/>
      <rect x="4" y="0" width="8" height="4" fill="#64748b"/>
      <rect x="4" y="4" width="2" height="2" fill="#0f172a"/>
      <rect x="10" y="4" width="2" height="2" fill="#0f172a"/>
      <rect x="0" y="10" width="4" height="2" fill="#64748b"/>
      <rect x="12" y="10" width="4" height="2" fill="#64748b"/>
    </svg>
  )
}

function ProjectCard({ project }: { project: { title: string; tags: string[]; desc: string; images: string[] } }){
  const [i, setI] = React.useState(0)
  const len = project.images.length
  return (
    <article className={`${card}`}>
      <h3 className="text-lg font-semibold">{project.title}</h3>
      <p className="mt-1 text-slate-600 text-sm">{project.desc}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
        {project.tags.map(t => (<span key={t} className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1">{t}</span>))}
      </div>
      <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200">
        <img src={project.images[i]} alt={`${project.title} — изображение ${i+1}`} className="w-full h-56 object-cover" />
        <div className="flex items-center justify-between p-2">
          <button className="rounded-lg border px-3 py-1 text-sm" onClick={()=> setI((i-1+len)%len)} aria-label="Предыдущее фото">◀</button>
          <div className="flex gap-1">
            {project.images.map((_,idx)=> (
              <span key={idx} className={`inline-block size-2 rounded-full ${idx===i?'bg-slate-900':'bg-slate-300'}`} />
            ))}
          </div>
          <button className="rounded-lg border px-3 py-1 text-sm" onClick={()=> setI((i+1)%len)} aria-label="Следующее фото">▶</button>
        </div>
      </div>
    </article>
  )
}

// Simple Leaflet map (OSM tiles) — минимальная зависимость, без ключей
function LeafletMap(){
  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    if (!ref.current) return
    // Подключим CSS Leaflet по CDN (один раз)
    if (!document.getElementById('leaflet-css')){
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    ;(async () => {
      const L = await import('leaflet')
      const map = L.map(ref.current!, { zoomControl: false, attributionControl: false }).setView([55.775, 37.56], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
      L.marker([55.775, 37.56]).addTo(map).bindPopup('Москва, ул. Беговая, 12')
    })()
  }, [])
  return <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden aspect-video"><div ref={ref} className="w-full h-full" /></div>
}

// Microsoft‑style multi‑column footer
function SiteFooter(){
  const cols = [
    { title:'Продукты', links:[
      {label:'CAD/CAE‑моделирование',href:'#services'},
      {label:'Реверсивный инжиниринг',href:'#services'},
      {label:'Аддитивное производство',href:'#services'},
      {label:'Прототипирование',href:'#services'},
    ]},
    { title:'Образование', links:[
      {label:'Курсы ДПО',href:'#courses'},
      {label:'Проектные школы',href:'#courses'},
      {label:'Силлабусы',href:'#courses'},
      {label:'Заявка на обучение',href:'#contacts'},
    ]},
    { title:'Проекты', links:[
      {label:'MedTech',href:'#projects'},
      {label:'Robotics',href:'#projects'},
      {label:'Reverse engineering',href:'#projects'},
      {label:'Design & Render',href:'#projects'},
    ]},
    { title:'Ресурсы', links:[
      {label:'Методические материалы',href:'#'},
      {label:'3D‑модели (STP)',href:'#'},
      {label:'Политика данных',href:'#'},
      {label:'Блог',href:'#'},
    ]},
  ] as const

  return (
    <div className="border-t border-slate-200 bg-white">
      <div className={`${container} py-12`}>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {cols.map(c => (
            <div key={c.title}>
              <div className="text-sm font-semibold text-slate-900 mb-3">{c.title}</div>
              <ul className="space-y-2 text-sm">
                {c.links.map(l => (
                  <li key={l.label}><a href={l.href} className="text-slate-600 hover:underline">{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap gap-3">
            <a href="#" className="hover:underline">Конфиденциальность</a>
            <a href="#" className="hover:underline">Условия использования</a>
            <a href="#" className="hover:underline">Cookies</a>
            <a href="#" className="hover:underline">Контакты</a>
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden>🌐</span>
            <select className="rounded-lg border border-slate-200 bg-white px-2 py-1"><option>Русский (RU)</option><option>English (EN)</option></select>
          </div>
        </div>
        <div className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} Step3D.Lab · Все права защищены</div>
      </div>
    </div>
  )
}

function BurgerIcon(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function BrandMark({ code }: { code: string }){
  const url = BRAND_LOGOS[code]
  const label = BRAND_LABELS[code] || code
  const [errored, setErrored] = React.useState(false)
  if (url && !errored) return (
    <>
      <img src={url} alt={label} className="h-5 w-auto object-contain" onError={()=> setErrored(true)} referrerPolicy="no-referrer" />
    </>
  )
  return <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{label}</span>
}

function AboutText(){
  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6">
      <h3 className="text-xl font-semibold mb-2">О лаборатории</h3>
      <p className="text-slate-700">Лаборатория промдизайна и инжиниринга Step3D.Lab — это команда инженеров, дизайнеров и преподавателей. Мы работаем на базе технопарка РГСУ совместно с ООО «СТЕП 3Д»: выполняем R&D‑проекты, проводим курсы ДПО (48–72 ч), сопровождаем производственные задачи и студенческие инициативы. В фокусе — CAD/CAE, реверсивный инжиниринг, 3D‑сканирование, прототипирование и аддитивное производство.</p>
    </div>
  )
}

function HexIcon({ className = 'h-6 w-6' }: { className?: string }){
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M7 3h10l5 9-5 9H7L2 12l5-9z" fill="currentColor" className="text-slate-300" />
    </svg>
  )
}

function ArrowRIcon({ className = 'h-4 w-4' }: { className?: string }){
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Logo3D({ className = 'h-6 w-6' }: { className?: string }){
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="g3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0ea5e9"/><stop offset="1" stopColor="#22c55e"/>
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="12" fill="url(#g3d)"/>
      <path d="M20 44V20l12-6 12 6v24l-12 6-12-6z M32 14v36" stroke="#fff" strokeWidth="2" fill="none"/>
    </svg>
  )
}

function Avatar({ name, size=48 }: { name: string; size?: number }){
  const initials = name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()
  return (
    <div className="grid place-items-center rounded-2xl bg-slate-200 text-slate-700" style={{ width:size, height:size }} aria-hidden>{initials}</div>
  )
}

function Chip({ children }: { children: React.ReactNode }){
  return <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{children}</span>
}

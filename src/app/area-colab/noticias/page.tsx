import { Heart, Mail, Search, UserRound } from 'lucide-react';
import { PomodoroTimer } from '@/components/area-colab/PomodoroTimer';
import { news, readingMaterials } from '@/lib/prototype-data';

export default function NoticiasPage() {
  const featured = news[0];
  const rest = news.slice(1);

  return (
    <div className="rounded-[32px] bg-white p-4 font-editorial text-[#111827] md:p-8">
      <header className="sticky top-[89px] z-20 mb-10 flex items-center gap-5 border-b border-gray-100 bg-white/95 py-4 backdrop-blur">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b80001] font-extrabold text-white">EF</div>
        <div className="relative hidden max-w-[600px] flex-1 md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="h-11 w-full rounded-full bg-[#f3f4f6] pl-11 pr-4 text-sm outline-none placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300"
            placeholder="Buscar noticias, podcasts e documentos"
          />
        </div>
        <div className="ml-auto flex gap-2">
          {[Heart, UserRound].map((Icon, index) => (
            <button key={index} className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100">
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-12">
        <div className="group overflow-hidden rounded-3xl lg:col-span-7">
          <img src={featured.image} alt={featured.title} className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="flex flex-col justify-center lg:col-span-5">
          <span className="w-fit rounded-full bg-[#b800011a] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#b80001]">{featured.category}</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">{featured.title}</h1>
          <p className="mt-5 text-lg font-light leading-8 text-gray-600">{featured.summary}</p>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">LM</div>
            <div>
              <p className="m-0 text-sm font-bold">{featured.author}</p>
              <p className="m-0 text-xs font-light text-gray-500">{featured.credential}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="rounded-[3rem] bg-[#f9fafb] p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#b80001]">Pomodoro editorial</p>
          <h2 className="mt-2 text-2xl font-extrabold">Tempo para leitura e materiais do dia</h2>
          <p className="mt-3 text-sm font-light leading-6 text-gray-600">
            Ajuste o tempo para ler noticias, ouvir podcasts e revisar documentos sem sair da sessao.
          </p>
          <div className="mt-6">
            <PomodoroTimer workMinutes={30} breakMinutes={5} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {readingMaterials.map((material) => (
            <details key={material.title} className="group rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm transition-all open:bg-[#f9fafb]">
              <summary className="cursor-pointer list-none">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">{material.type}</span>
                <h3 className="mt-4 text-xl font-extrabold">{material.title}</h3>
                <p className="mt-2 text-sm font-light text-gray-500">{material.minutes} minutos</p>
              </summary>
              <p className="mt-4 text-sm font-light leading-6 text-gray-600">
                Conteudo preparado para apoiar decisoes de caixa, mercado e comunicacao com o contador.
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-10 md:grid-cols-3">
        {rest.map((item) => (
          <article key={item.id} className="group">
            <div className="overflow-hidden rounded-2xl">
              <img src={item.image} alt={item.title} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <span className="mt-5 inline-flex rounded-full bg-[#b800011a] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#b80001]">{item.category}</span>
            <h2 className="mt-3 text-xl font-extrabold transition-colors group-hover:text-[#b80001]">{item.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm font-light leading-6 text-gray-600">{item.summary}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-[3rem] bg-[#f9fafb] px-6 py-12 text-center">
        <Mail className="mx-auto h-10 w-10 text-[#b80001]" />
        <h2 className="mt-4 text-4xl font-extrabold">Receba o briefing operacional</h2>
        <p className="mx-auto mt-3 max-w-xl font-light leading-7 text-gray-600">
          Noticias do mercado, materiais de leitura e prioridades do dia em um unico resumo.
        </p>
        <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 md:flex-row">
          <input className="h-12 flex-1 rounded-full bg-white px-5 text-sm outline-none ring-1 ring-gray-100" placeholder="email@empresa.com" />
          <button className="rounded-full bg-[#b80001] px-7 py-3 font-bold text-white shadow-lg shadow-[#b80001]/20 transition-transform hover:scale-[1.02]">
            Assinar
          </button>
        </form>
      </section>
    </div>
  );
}

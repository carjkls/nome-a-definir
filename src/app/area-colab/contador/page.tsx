import { accountingMessages, notifications } from '@/lib/prototype-data';
import { Bell, CirclePlus, Paperclip, Send, Sparkles } from 'lucide-react';

const members = [
  { name: 'Helena', role: 'Contadora', initials: 'HC' },
  { name: 'Rafael', role: 'Financeiro', initials: 'RF' },
  { name: 'Joao', role: 'Empresario', initials: 'JV' },
];

export default function ContadorPage() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] overflow-hidden rounded-[24px] bg-[#0e0e0e] font-satoshi text-white">
      <div className="fixed left-[22rem] top-24 -z-10 h-[520px] w-[520px] rounded-full bg-[#6a48f2] opacity-30 blur-[100px] animate-float" />
      <div className="fixed bottom-[-8rem] right-[-4rem] -z-10 h-[600px] w-[600px] rounded-full bg-[#d946ef] opacity-30 blur-[100px] animate-float" />

      <header className="glass-panel sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 px-6">
        <div>
          <p className="font-cabinet text-2xl font-black italic leading-none">Contabilidade alinhada</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">mensagens · lembretes · prioridades</p>
        </div>
        <div className="-space-x-2">
          {members.map((member) => (
            <span key={member.initials} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-bold">
              {member.initials}
            </span>
          ))}
        </div>
      </header>

      <div className="grid min-h-[720px] grid-cols-1 lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-white/5 p-5">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Notifications</p>
              <Bell className="h-4 w-4 text-[#bef264]" />
            </div>
            <div className="space-y-3">
              {notifications.map((item) => (
                <div key={item} className="rounded-2xl border border-white/5 bg-white/[0.05] p-3 text-sm text-white/75">
                  {item}
                </div>
              ))}
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 p-3 text-sm font-bold text-white/50 transition-colors hover:text-white">
                <CirclePlus className="h-4 w-4" /> adicionar lembrete
              </button>
            </div>
          </section>

          <section className="mt-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/45">Online members</p>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.initials} className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                    {member.initials}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0e0e0e] bg-emerald-500" />
                  </div>
                  <div>
                    <p className="m-0 text-sm font-bold text-white">{member.name}</p>
                    <p className="m-0 text-xs text-white/40">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <main className="flex flex-col">
          <div className="thin-dark-scrollbar flex-1 space-y-8 overflow-y-auto p-6">
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
              <div className="mb-2 flex items-center gap-2 text-[#bef264]">
                <Sparkles className="h-4 w-4" />
                <p className="m-0 text-[10px] font-bold uppercase tracking-widest">prioridade automatica</p>
              </div>
              <p className="text-sm leading-6 text-white/70">
                Concentrar a conversa em comprovantes, despesas recorrentes e observacoes para a pre-apuracao do contador.
              </p>
            </div>

            {accountingMessages.map((message) => (
              <div key={`${message.author}-${message.time}`} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[72%] ${message.mine ? 'text-right' : 'text-left'}`}>
                  <p className="mb-2 text-xs text-white/35">{message.author} · {message.role} · {message.time}</p>
                  <div
                    className={
                      message.mine
                        ? 'rounded-[20px_4px_20px_20px] bg-[#bef264] p-4 font-medium text-[#1a2e05] shadow-[0_10px_30px_rgba(190,242,100,0.2)] transition-transform hover:scale-[1.02]'
                        : 'rounded-[4px_20px_20px_20px] bg-white/[0.06] p-4 text-white/80'
                    }
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 p-6">
            <textarea
              className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
              placeholder="Escreva uma observacao, prioridade ou lembrete para o contador..."
              defaultValue="Separar notas dos contratos fechados e confirmar economia em assinaturas duplicadas."
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <button className="inline-flex items-center gap-2 text-sm font-bold text-white/45 transition-colors hover:text-white">
                <Paperclip className="h-4 w-4" /> anexar documento
              </button>
              <button className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#6a48f2,#d946ef)] px-8 font-cabinet font-black italic uppercase text-white shadow-[0_20px_40px_rgba(106,72,242,0.3)] transition-all hover:-translate-y-1">
                Enviar <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

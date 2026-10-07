import { Fragment, useRef } from "react";
import Field from "./ui/Field";
import { PhoneIcon, MailIcon, PinIcon, ClockIcon, CheckIcon } from "./ui/Icons";
import { COMPANY } from "../data/site";
import useForm from "../hooks/useForm";
import { validateText, validateEmail } from "../utils/validators";
import { sendContactForm, getEmailErrorMessage } from "../services/email";

const EMPTY = { nome: "", email: "", assunto: "", mensagem: "" };
const RULES = { nome: validateText(3), email: validateEmail };

export default function Contato() {
  const honeypot = useRef(null);

  const form = useForm(EMPTY, RULES, "contato", {
    getErrorMessage: getEmailErrorMessage,
    onSubmit: async (v) => {
      const result = { name: v.nome.trim().split(" ")[0] };
      /* Anti-spam: robôs preenchem o campo oculto; finge sucesso sem enviar */
      if (honeypot.current && honeypot.current.value) return result;
      await sendContactForm(v);
      return result;
    },
  });
  const { fieldProps, sending, success, result } = form;

  return (
    <section className="contact" id="contato">
      <div className="container contact-inner">
        <div>
          <p className="eyebrow eyebrow--dark"><span className="eyebrow__bar" />Contato</p>
          <h2 className="section-title">Fale com<br />a Fulltech</h2>
          <p className="section-lead" style={{ marginTop: 18, marginBottom: 28 }}>
            Orçamentos, dúvidas comerciais, parcerias ou licitações — escreva para a gente
            e responderemos com a agilidade que o seu projeto precisa.
          </p>
          <div className="info-block"><PhoneIcon size={18} /><span><b>Telefone / Whatsapp</b><span>{COMPANY.phone}</span></span></div>
          <div className="info-block"><MailIcon size={18} /><span><b>E-mail</b><span>{COMPANY.email}</span></span></div>
          <div className="info-block">
            <PinIcon size={18} />
            <span>
              <b>Endereço</b>
              <span>{COMPANY.address.map((l, i) => <Fragment key={i}>{l}<br /></Fragment>)}</span>
            </span>
          </div>
          <div className="info-block"><ClockIcon size={18} /><span><b>Horário de atendimento (vendas)</b><span>{COMPANY.hoursSales}</span></span></div>
        </div>

        <div className="contact-form form-panel">
          {success ? (
            <div className="success-box" style={{ borderColor: "var(--line)" }} role="status">
              <div className="success-box__badge" style={{ borderColor: "var(--line-strong)", color: "var(--accent-dark)" }}>
                <CheckIcon size={22} />
              </div>
              <h3 style={{ color: "var(--text)" }}>Mensagem enviada com sucesso!</h3>
              <p>Obrigado pelo contato, {result?.name}. Nossa equipe responderá em breve pelo e-mail informado.</p>
              <div>
                <button type="button" className="btn btn--outline" onClick={form.dismissSuccess}>
                  Enviar outra mensagem
                </button>
              </div>
            </div>
          ) : (
            <form className="form-grid" onSubmit={form.handleSubmit} noValidate>
              <h3 className="field--full" style={{ margin: 0, color: "var(--text)" }}>Envie sua mensagem</h3>
              <Field label="Nome completo" required autoComplete="name" placeholder="Seu nome" {...fieldProps("nome")} />
              <Field label="E-mail" required type="email" autoComplete="email" placeholder="nome@empresa.com.br" {...fieldProps("email")} />
              <Field label="Assunto" full placeholder="Sobre o que deseja falar?" {...fieldProps("assunto")} />
              <Field label="Mensagem" textarea full placeholder="Escreva sua mensagem..." {...fieldProps("mensagem")} />
              <input
                ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />
              <div className="form-actions">
                <button type="submit" className="btn btn--solid" disabled={sending}>
                  {sending ? "A enviar..." : "Enviar mensagem"}
                </button>
                <span className="form-note" style={{ color: "var(--text-faint)" }}>* Campos obrigatórios</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

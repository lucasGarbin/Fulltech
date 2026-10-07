import { useState } from "react";
import Field from "./ui/Field";
import FileField from "./ui/FileField";
import { PhoneIcon, MailIcon, ClockIcon, CheckIcon } from "./ui/Icons";
import { COMPANY } from "../data/site";
import useForm from "../hooks/useForm";
import { validateText, validateEmail, validatePhone, formatPhone } from "../utils/validators";
import { sendSupportForm, getEmailErrorMessage } from "../services/email";

const EMPTY = { empresa: "", responsavel: "", email: "", telefone: "", equipamento: "", serial: "", descricao: "" };
const RULES = {
  empresa: validateText(2),
  responsavel: validateText(3),
  email: validateEmail,
  telefone: validatePhone,
  equipamento: validateText(2),
  descricao: validateText(10),
};

export default function ChamadoTecnico() {
  const [file, setFile] = useState(null);
  const [fileErr, setFileErr] = useState(null);

  const form = useForm(EMPTY, RULES, "chamado", {
    getErrorMessage: getEmailErrorMessage,
    onSubmit: async (v, formEl) => {
      /* Envia os campos + o ficheiro (input name="nota") em multipart/form-data.
         O protocolo é gerado pelo backend e também vai no e-mail. */
      const data = await sendSupportForm(v, formEl);
      return { protocol: data.protocolo, email: v.email.trim() };
    },
    onSuccess: () => { setFile(null); setFileErr(null); },
  });
  const { fieldProps, sending, success, result: ticket } = form;

  return (
    <section className="support dark-zone" id="suporte">
      <div className="container">
        <div className="support-head">
          <div>
            <p className="eyebrow"><span className="eyebrow__bar" />Suporte técnico</p>
            <h2 className="section-title">Abra seus<br />chamados</h2>
          </div>
          <p className="support-lead">
            Conte com nosso suporte técnico especializado para garantir o pleno
            funcionamento dos seus equipamentos. Preencha o formulário e receba
            um número de protocolo.
          </p>
        </div>

        <div className="support-grid">
          <div className="support-info">
            <h3>Canais de atendimento</h3>
            <p>Prefere falar diretamente com a equipe? Estamos disponíveis pelos canais abaixo, no horário comercial.</p>
            <div className="info-block"><PhoneIcon size={18} /><span><b>Telefone / Whatsapp</b><span>{COMPANY.phone}</span></span></div>
            <div className="info-block"><MailIcon size={18} /><span><b>E-mail</b><span>{COMPANY.email}</span></span></div>
            <div className="info-block"><ClockIcon size={18} /><span><b>Horário do suporte</b><span>{COMPANY.hoursSupport}</span></span></div>
          </div>

          <div className="form-panel">
            {success ? (
              <div className="success-box" role="status">
                <div className="success-box__badge"><CheckIcon size={22} /></div>
                <h3>Chamado registrado</h3>
                <p>Recebemos sua solicitação. Nossa equipe técnica entrará em contato pelo e-mail {ticket.email} com as próximas instruções.</p>
                <span className="protocol">Protocolo: {ticket.protocol}</span>
                <div>
                  <button type="button" className="btn btn--ghost" onClick={form.dismissSuccess}>Abrir novo chamado</button>
                </div>
              </div>
            ) : (
              <form className="form-grid" onSubmit={form.handleSubmit} noValidate>
                <h3 className="field--full" style={{ margin: 0 }}>Novo chamado técnico</h3>
                <Field label="Nome da empresa" required autoComplete="organization" placeholder="Razão social ou nome fantasia" {...fieldProps("empresa")} />
                <Field label="Responsável" required autoComplete="name" placeholder="Nome do contato" {...fieldProps("responsavel")} />
                <Field label="E-mail" required type="email" autoComplete="email" placeholder="nome@empresa.com.br" {...fieldProps("email")} />
                <Field label="Telefone" required type="tel" autoComplete="tel" placeholder="(49) 00000-0000" maxLength={16} {...fieldProps("telefone", formatPhone)} />
                <Field label="Equipamento" required placeholder="Modelo / tipo do equipamento" {...fieldProps("equipamento")} />
                <Field label="Número de série" placeholder="Serial indicado no equipamento" {...fieldProps("serial")} />
                <Field label="Descrição do problema" required textarea full placeholder="Descreva o que acontece, quando começou e eventuais mensagens de erro..." {...fieldProps("descricao")} />
                <FileField label="Anexar cópia da nota" file={file} error={fileErr} onFile={(f, e) => { setFile(f); setFileErr(e); }} />
                <div className="form-actions">
                  <button type="submit" className="btn btn--accent" disabled={sending}>
                    {sending ? "A enviar..." : "Registrar chamado"}
                  </button>
                  <span className="form-note">* Campos obrigatórios</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

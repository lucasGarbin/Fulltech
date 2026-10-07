/* Validação no servidor (espelha as regras do frontend; nunca confie só no cliente) */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUIRED = "Campo obrigatório.";

/* Mantém só os campos esperados, como string aparada e com tamanho limitado */
export function pick(body = {}, fields) {
  const out = {};
  for (const [name, max] of Object.entries(fields)) {
    out[name] = String(body[name] ?? "").trim().slice(0, max);
  }
  return out;
}

const text = (v, min) => (!v ? REQUIRED : v.length < min ? `Informe pelo menos ${min} caracteres.` : null);
const email = (v) => (!v ? REQUIRED : !EMAIL_RE.test(v) ? "Informe um e-mail válido." : null);
const phone = (v) => {
  const d = v.replace(/\D/g, "");
  return !d ? REQUIRED : d.length < 10 || d.length > 11 ? "Informe um telefone válido com DDD." : null;
};

function run(rules, data) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const msg = rule(data[field]);
    if (msg) errors[field] = msg;
  }
  return errors;
}

export const CONTATO_FIELDS = { nome: 120, email: 160, assunto: 150, mensagem: 5000, website: 200 };
export const CHAMADO_FIELDS = {
  empresa: 150, responsavel: 120, email: 160, telefone: 20,
  equipamento: 150, serial: 100, descricao: 5000,
};

export const validateContato = (d) => run({ nome: (v) => text(v, 3), email }, d);
export const validateChamado = (d) =>
  run(
    {
      empresa: (v) => text(v, 2),
      responsavel: (v) => text(v, 3),
      email,
      telefone: phone,
      equipamento: (v) => text(v, 2),
      descricao: (v) => text(v, 10),
    },
    d
  );

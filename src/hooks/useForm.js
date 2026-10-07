import { useState } from "react";
import { showToast } from "../utils/toast";

/* Estado, validação e ciclo de envio de um formulário.
   rules:   { campo: (valor, todosValores) => mensagem | null }  (na ordem dos campos)
   options: { onSubmit(values, formEl) → resultado,  onSuccess(resultado),  getErrorMessage(err) }
   status:  "idle" | "sending" | "success" | "error" */
export default function useForm(initial, rules, idPrefix, options = {}) {
  const { onSubmit, onSuccess, getErrorMessage } = options;
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const setValue = (name, value) => {
    setValues((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: undefined }));
  };

  const validateField = (name) => {
    const rule = rules[name];
    const msg = rule ? rule(values[name], values) : null;
    setErrors((s) => ({ ...s, [name]: msg || undefined }));
    return !msg;
  };

  /* Valida tudo, foca o primeiro campo inválido e devolve true se válido */
  const validateAll = () => {
    const next = {};
    Object.keys(rules).forEach((name) => {
      const msg = rules[name](values[name], values);
      if (msg) next[name] = msg;
    });
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) document.getElementById(`${idPrefix}-${first}`)?.focus();
    return !first;
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!validateAll()) { showToast("Verifique os campos destacados."); return; }

    const formEl = e.currentTarget;
    setStatus("sending");
    try {
      const res = await onSubmit(values, formEl);
      setResult(res ?? null);
      reset(); /* limpa todos os campos após o sucesso */
      if (onSuccess) onSuccess(res);
      setStatus("success");
    } catch (err) {
      console.error("Erro no envio do formulário:", err);
      setStatus("error"); /* os dados preenchidos são mantidos */
      if (err && err.fieldErrors) {
        /* erros de validação devolvidos pelo servidor → avisos nos campos */
        setErrors((s) => ({ ...s, ...err.fieldErrors }));
        const first = Object.keys(err.fieldErrors)[0];
        if (first) document.getElementById(`${idPrefix}-${first}`)?.focus();
      }
      showToast(getErrorMessage ? getErrorMessage(err) : "Não foi possível enviar agora. Tente novamente.");
    }
  };

  /* Volta ao formulário vazio depois do aviso de sucesso */
  const dismissSuccess = () => {
    setStatus("idle");
    setResult(null);
  };

  /* Props prontas para o componente <Field /> */
  const fieldProps = (name, transform) => ({
    id: `${idPrefix}-${name}`,
    name,
    value: values[name],
    error: errors[name],
    onChange: (v) => setValue(name, transform ? transform(v) : v),
    onBlur: () => validateField(name),
  });

  return {
    values, errors, status, result,
    sending: status === "sending",
    success: status === "success",
    handleSubmit, dismissSuccess, fieldProps,
  };
}

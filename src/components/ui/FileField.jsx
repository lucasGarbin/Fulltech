import { useEffect, useRef } from "react";
import { PaperclipIcon, CheckIcon, CloseIcon } from "./Icons";
import { MAX_ATTACHMENT_BYTES } from "../../services/email";

const ACCEPT = ["png", "jpg", "jpeg", "pdf", "zip", "rar", "txt"];
const fmt = (n) => (n < 1048576 ? Math.round(n / 1024) + " KB" : (n / 1048576).toFixed(1) + " MB");

/* O <input type="file" name="nota"> mantém o ficheiro real no formulário,
   para o envio multipart ao backend (ver services/email.js). */
export default function FileField({ label, file, error, onFile }) {
  const inputRef = useRef(null);

  /* Quando o ficheiro é removido ou o formulário é limpo, esvazia o input */
  useEffect(() => {
    if (!file && inputRef.current) inputRef.current.value = "";
  }, [file]);

  const handle = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!ACCEPT.includes(ext)) {
      e.target.value = "";
      onFile(null, `Formato .${ext} não permitido (use: ${ACCEPT.join(", ")})`);
      return;
    }
    if (f.size > MAX_ATTACHMENT_BYTES) {
      e.target.value = "";
      onFile(null, `Ficheiro excede ${fmt(MAX_ATTACHMENT_BYTES)}.`);
      return;
    }
    onFile({ name: f.name, size: f.size }, null);
  };

  return (
    <div className="field field--full">
      <label>{label}</label>
      <input ref={inputRef} type="file" name="nota" hidden accept={ACCEPT.map((x) => "." + x).join(",")} onChange={handle} />
      <button type="button" className="file-drop" onClick={() => inputRef.current.click()}>
        <PaperclipIcon size={20} />
        <span>
          <b>{file ? file.name : "Anexar cópia da nota"}</b>
        </span>
      </button>
      {file && (
        <div className="file-chip">
          <CheckIcon size={15} />
          {file.name}
          <small>{fmt(file.size)}</small>
          <button type="button" aria-label="Remover anexo" onClick={() => onFile(null, null)}>
            <CloseIcon size={14} />
          </button>
        </div>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

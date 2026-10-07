/* Se a imagem ainda não existir em /public/assets, esconde-a
   e o fundo/placeholder do contentor permanece visível. */
export function hideOnError(e) {
  e.currentTarget.style.display = "none";
}

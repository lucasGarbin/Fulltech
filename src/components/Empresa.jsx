import QuemSomos from "./QuemSomos";
import Valores from "./Valores";
import { IMAGES } from "../data/site";
import { hideOnError } from "../utils/helpers";

/* Foto de fundo única cobrindo Quem somos + Missão/Visão/Valores */
export default function Empresa() {
  return (
    <div className="company-wrap" id="empresa">
      <div className="bg-layer" aria-hidden="true">
        <img src={IMAGES.sede} alt="" loading="lazy" onError={hideOnError} />
        <div className="bg-overlay-light" />
      </div>
      <QuemSomos />
      <Valores />
    </div>
  );
}

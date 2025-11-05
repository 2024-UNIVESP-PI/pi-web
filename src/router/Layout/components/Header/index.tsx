import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa6";

import Menu from "../Menu";
import Button from "../../../../components/Button";

import "./styles.scss";

export default function Header() {
  const [optionsVisible, setOptionsVisible] = useState(false);
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const closeTimeoutRef = useRef<number | null>(null);

  // Fecha o menu quando a rota muda, mas com um pequeno delay para feedback visual
  useEffect(() => {
    // Se a rota mudou e o menu está visível
    if (previousPathname.current !== location.pathname && optionsVisible) {
      // Limpa qualquer timeout anterior
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }

      // Fecha o menu após um pequeno delay (300ms) para dar feedback visual
      closeTimeoutRef.current = window.setTimeout(() => {
        setOptionsVisible(false);
      }, 300);
    }

    // Atualiza a referência do pathname anterior
    previousPathname.current = location.pathname;

    // Cleanup do timeout quando o componente desmonta ou o menu é fechado
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [location.pathname, optionsVisible]);

  // Limpa o timeout quando o menu é fechado manualmente
  const handleCloseMenu = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    setOptionsVisible(false);
  };

  return (
    <header>
      <Link to="/">
        <h1 className="arraia-tech">
          <strong>Arraiá</strong>Tech
        </h1>
      </Link>

      <button className="open-options" onClick={() => setOptionsVisible(true)}>
        <FaBars />
      </button>
      <div className={"options" + (optionsVisible ? " visible" : "")}>
        <Menu />

        <Button
          className="close-options"
          color="var(--color-red)"
          onClick={handleCloseMenu}
        >
          Fechar
        </Button>
      </div>
    </header>
  );
}

import { useContext, useEffect } from "react";
import useLocalStorage from "../../../../hooks/useLocalStorage";

import CaixaContext from "../../../../contexts/CaixaContext";

import Select from "../../../../components/Select";

import compare from "../../../../functions/compare";
import useCaixas from "../../../../hooks/useCaixas";

import "./styles.scss";

export default function CaixaSelector() {
  const caixaContext = useContext(CaixaContext.Context);

  const { caixas } = useCaixas();

  const [selectedCaixa, setSelectedCaixa] = useLocalStorage<number>("caixa", 0);

  useEffect(() => {
    // Só define caixaData se o caixa estiver realmente logado
    // Se não estiver logado, limpa os dados mesmo que haja um caixa selecionado
    if (caixas && caixaContext?.setCaixa) {
      // IMPORTANTE: Se não estiver logado, SEMPRE limpa os dados primeiro
      if (caixaContext.isLoggedIn !== true) {
        caixaContext.setCaixa(undefined);
        caixaContext.setCaixaData(undefined);
        caixaContext.setHasChecked(true);
        return; // Para aqui, não processa mais nada
      }

      // Só continua se estiver logado
      const caixaIndex = caixas.findIndex((caixa) => caixa.id == selectedCaixa);
      if (caixaIndex != -1) {
        caixaContext.setCaixa(Number(selectedCaixa));
        caixaContext.setCaixaData(caixas[caixaIndex]);
      } else {
        caixaContext.setCaixa(undefined);
        caixaContext.setCaixaData(undefined);
        setSelectedCaixa(0);
      }

      caixaContext.setHasChecked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaixa, caixas, caixaContext?.setCaixa, caixaContext?.isLoggedIn]);

  return (
    <div id="caixa-selector">
      <p className="title">CAIXA</p>

      <Select
        className={"caixa-select" + (!selectedCaixa ? " off" : "")}
        disabled="Escolha um caixa"
        disabledValue={0}
        options={caixas
          ?.map((caixa) => ({ value: caixa.id, content: caixa.nome }))
          .sort((a, b) =>
            compare(a.content.toLowerCase(), b.content.toLowerCase())
          )}
        value={selectedCaixa}
        onChange={(e) => setSelectedCaixa(Number(e.target.value))}
      />
    </div>
  );
}

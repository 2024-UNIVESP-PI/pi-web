import {
  Dispatch,
  SetStateAction,
  useContext,
  useState,
  FormEvent,
} from "react";
import { FaBoxOpen } from "react-icons/fa6";
import CaixaContext from "../../../contexts/CaixaContext";

import Popup from "..";
import Input from "../../Input";
import Button from "../../Button";

import { Errors } from "../../../services";
import { NovoProduto, Produto } from "../../../services/produtoService";
import cleanDecimal from "../../../functions/cleanDecimal";
import useProduto from "../../../hooks/useProduto";

export type PopupNovoProdutoProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onCreate: (produto: Produto) => void;
};

export default function PopupNovoProduto(props: PopupNovoProdutoProps) {
  const MEDIDA_CHOICES = [
    ["UN", "Unidade"],
    ["PCT", "Pacote"],
    ["L", "Litro"],
    ["KG", "Quilograma"],
  ];

  const CATEGORIA_CHOICES = [
    ["doces", "Doces"],
    ["salgados", "Salgados"],
    ["bebidas", "Bebidas"],
    ["jogos", "Jogos"],
  ];

  const caixaContext = useContext(CaixaContext.Context);

  const { createProduto, fetchingCreate } = useProduto();

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState<string>("");
  const [medida, setMedida] = useState(MEDIDA_CHOICES[0][0]);
  const [categoria, setCategoria] = useState(CATEGORIA_CHOICES[0][0]);
  const [estoqueInicial, setEstoqueInicial] = useState<string>("");

  const [formErrors, setFormErrors] = useState<Errors>();

  function setupForm() {
    setNome("");
    setPreco("");
    setMedida(MEDIDA_CHOICES[0][0]);
    setCategoria(CATEGORIA_CHOICES[0][0]);
    setEstoqueInicial("");
  }

  async function handleCreateProduto(e: FormEvent) {
    e.preventDefault();
    setFormErrors(undefined);
    if (caixaContext?.caixa) {
      // Validações
      if (!nome.trim()) {
        setFormErrors({ nome: ["Nome é obrigatório"] });
        return;
      }

      const precoNum = Number(preco);
      if (!preco || precoNum <= 0) {
        setFormErrors({ preco: ["Preço deve ser maior que zero"] });
        return;
      }

      // Estoque inicial é obrigatório (mesmo que seja 0)
      if (estoqueInicial === "") {
        setFormErrors({ estoque: ["Estoque inicial é obrigatório"] });
        return;
      }
      const estoqueNum = Number(estoqueInicial);
      if (isNaN(estoqueNum) || estoqueNum < 0) {
        setFormErrors({
          estoque: ["Estoque inicial deve ser um número válido (≥ 0)"],
        });
        return;
      }

      const nP: NovoProduto = {
        nome: nome.trim(),
        preco: precoNum,
        medida,
        categoria,
        estoque: estoqueNum,
        caixa: caixaContext.caixa,
      };
      const response = await createProduto(nP);
      if (response && response.status === 201) {
        setupForm();
        props.onCreate(response.data);
      } else if (response) {
        setFormErrors(response.data);
      }
    }
  }

  return (
    <Popup
      visible={props.visible}
      setVisible={props.setVisible}
      id="popup-novo-produto"
      icon={<FaBoxOpen />}
      title="Novo produto"
    >
      <form onSubmit={handleCreateProduto}>
        <Input
          id="nome"
          label="Nome"
          placeholder="Ex.: Bolo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          errors={formErrors?.nome}
        />
        <Input
          id="medida"
          type="select"
          options={MEDIDA_CHOICES.map(([value, content]) => ({
            value,
            content,
          }))}
          label="Medida"
          placeholder="Selecione a medida"
          value={medida}
          onChange={(e) => setMedida(e.target.value)}
          required
          errors={formErrors?.medida}
        />
        <Input
          id="categoria"
          type="select"
          options={CATEGORIA_CHOICES.map(([value, content]) => ({
            value,
            content,
          }))}
          label="Categoria"
          placeholder="Selecione a categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
          errors={formErrors?.categoria}
        />
        <div className="line">
          <Input
            id="preco"
            type="number"
            inputMode="decimal"
            label="Preço"
            placeholder="Insira o preço"
            value={preco}
            onChange={(e) => {
              // Permite campo vazio ou valor numérico válido
              const value = e.target.value;
              if (value === "" || value === ".") {
                setPreco(value);
              } else {
                const cleaned = cleanDecimal(value);
                setPreco(cleaned === 0 ? "" : String(cleaned));
              }
            }}
            required
            min={0}
            step={0.01}
            errors={formErrors?.preco}
          />
          <Input
            id="estoque-inicial"
            type="intenger"
            inputMode="numeric"
            label="Estoque inicial"
            placeholder="Ex: 0"
            value={estoqueInicial}
            onChange={(e) => {
              // Permite campo vazio e apenas números
              const value = e.target.value.replace(/\D/g, "");
              setEstoqueInicial(value);
            }}
            required
            min={0}
            errors={formErrors?.estoque}
          />
        </div>

        <Button
          type="submit"
          color="var(--color-green)"
          loading={fetchingCreate}
        >
          <p>Criar</p>
        </Button>
      </form>
    </Popup>
  );
}

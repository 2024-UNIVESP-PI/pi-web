import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useContext,
  useState,
  useEffect,
} from "react";
import { FaBoxOpen, FaTrash, FaPen, FaCheck, FaXmark } from "react-icons/fa6";

import CaixaContext from "../../../contexts/CaixaContext";

import Popup from "..";
import Notice from "../../Notice";
import Tag from "../../Tag";
import Estoque from "../../Estoque";
import Input from "../../Input";
import Button from "../../Button";

import { Produto } from "../../../services/produtoService";
import { NovaMovimentacaoEstoque } from "../../../services/estoqueService";
import useProduto from "../../../hooks/useProduto";

import "./styles.scss";

export type PopupProdutoProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  produto?: Produto;
  onEntradaEstoque: (produto: Produto, quantidade: number) => void;
  onDelete: (id: number) => void;
  onUpdate?: (produtoAtualizado: Produto) => void;
};

export default function PopupProduto(props: PopupProdutoProps) {
  const caixaContext = useContext(CaixaContext.Context);

  const [entradaEstoque, setEntradaEstoque] = useState<string>("");
  const [editando, setEditando] = useState(false);

  // Estados para edição
  const [nomeEdit, setNomeEdit] = useState("");
  const [precoEdit, setPrecoEdit] = useState("");
  const [medidaEdit, setMedidaEdit] = useState("");
  const [estoqueEdit, setEstoqueEdit] = useState<string>("");

  const estoqueColor = (estoque: number) => {
    if (estoque >= 10) return "var(--color-green)";
    if (estoque > 0) return "var(--color-yellow)";
    return "var(--color-red)";
  };

  const {
    deleteProduto,
    fetchingDelete,
    createMovimentacaoEstoque,
    fetchingMovimentacaoEstoque,
    patchProduto,
  } = useProduto();

  // Quando o produto mudar, resetar os campos editáveis
  useEffect(() => {
    if (props.produto) {
      setEntradaEstoque("");
      setNomeEdit(props.produto.nome);
      setPrecoEdit(String(props.produto.preco));
      setMedidaEdit(props.produto.medida);
      setEstoqueEdit(String(props.produto.estoque));
      setEditando(false);
    }
  }, [props.produto]);

  async function handlePostEntradaEstoque(e: FormEvent) {
    e.preventDefault();
    if (!caixaContext?.caixa || !props.produto?.id) return;

    // Valida entrada de estoque
    if (!entradaEstoque || entradaEstoque === "") {
      alert("Por favor, informe a quantidade a adicionar");
      return;
    }

    const quantidadeNum = Number(entradaEstoque);
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      alert("Quantidade deve ser maior que zero");
      return;
    }

    const mE: NovaMovimentacaoEstoque = {
      quantidade: quantidadeNum,
      tipo: "E",
      caixa: caixaContext.caixa,
      produto: props.produto.id,
    };

    try {
      const response = await createMovimentacaoEstoque(mE);
      if (response && response.status === 201) {
        props.onEntradaEstoque(props.produto, quantidadeNum);
        setEntradaEstoque("");
      }
    } catch (error) {
      console.error("Erro ao adicionar estoque:", error);
      alert("Erro ao adicionar estoque");
    }
  }

  async function handleDeleteProduto(id: number) {
    const response = await deleteProduto(id);
    if (response && response.status === 204) {
      props.onDelete(id);
    }
  }

  async function handleSaveEdicao() {
    if (!props.produto) return;

    // Validações
    if (!nomeEdit.trim()) {
      alert("Nome não pode ser vazio");
      return;
    }

    const precoNumber = Number(precoEdit);
    if (!precoEdit || isNaN(precoNumber) || precoNumber < 0) {
      alert("Preço inválido");
      return;
    }

    if (!medidaEdit.trim()) {
      alert("Medida não pode ser vazia");
      return;
    }

    // Valida estoque
    if (estoqueEdit === "") {
      alert("Estoque não pode ser vazio");
      return;
    }
    const estoqueNumber = Number(estoqueEdit);
    if (isNaN(estoqueNumber) || estoqueNumber < 0) {
      alert("Estoque deve ser um número válido (≥ 0)");
      return;
    }

    try {
      const dadosParciais: Partial<Produto> = {
        nome: nomeEdit.trim(),
        preco: precoNumber,
        medida: medidaEdit.trim(),
        estoque: estoqueNumber,
      };

      const response = await patchProduto(props.produto.id, dadosParciais);
      if (response && response.status === 200 && response.data) {
        setEditando(false);
        // Atualiza localmente (callback opcional)
        if (props.onUpdate) {
          props.onUpdate(response.data);
        }
      } else {
        alert("Erro ao salvar edição");
      }
    } catch (error) {
      alert("Erro ao salvar edição");
      console.error(error);
    }
  }

  return (
    <Popup
      visible={props.visible}
      setVisible={props.setVisible}
      id="popup-produto"
      icon={<FaBoxOpen />}
      title="Produto"
    >
      {!props.produto ? (
        <Notice>
          <p>Selecione um produto para visualizar</p>
        </Notice>
      ) : (
        <>
          <div className="produto-infos">
            {editando ? (
              <>
                <Input
                  id="nome-produto-edit"
                  label="Nome"
                  value={nomeEdit}
                  onChange={(e) => setNomeEdit(e.target.value)}
                  required
                />
                <Input
                  id="preco-produto-edit"
                  label="Preço"
                  type="number"
                  step={0.01}
                  min={0}
                  value={precoEdit}
                  onChange={(e) => setPrecoEdit(e.target.value)}
                  required
                />
                <Input
                  id="medida-produto-edit"
                  label="Medida"
                  value={medidaEdit}
                  onChange={(e) => setMedidaEdit(e.target.value)}
                  required
                />
                <Input
                  id="estoque-produto-edit"
                  label="Estoque"
                  type="intenger"
                  inputMode="numeric"
                  value={estoqueEdit}
                  onChange={(e) => {
                    // Permite campo vazio e apenas números
                    const value = e.target.value.replace(/\D/g, "");
                    setEstoqueEdit(value);
                  }}
                  placeholder="Ex: 0"
                  required
                  min={0}
                />
              </>
            ) : (
              <>
                <p className="nome">{props.produto.nome}</p>
                <div className="line close">
                  <Tag color="var(--color-blue)">
                    <p>R${Number(props.produto.preco).toFixed(2)}</p>
                  </Tag>
                  <Tag color={estoqueColor(props.produto.estoque)}>
                    <Estoque number={props.produto.estoque} />
                  </Tag>
                  <Tag>
                    <p>{props.produto.medida}</p>
                  </Tag>
                </div>
              </>
            )}
          </div>

          <div className="line">
            {editando ? (
              <div className="edit-actions">
                <Button color="var(--color-green)" onClick={handleSaveEdicao}>
                  <FaCheck />
                  <span>Salvar</span>
                </Button>
                <Button
                  color="var(--color-gray)"
                  onClick={() => setEditando(false)}
                >
                  <FaXmark />
                  <span>Cancelar</span>
                </Button>
              </div>
            ) : (
              <>
                <form
                  className="stock-panel"
                  onSubmit={handlePostEntradaEstoque}
                >
                  <div className="panel-header">
                    <h4>Entrada de estoque</h4>
                    <p>Registre unidades recebidas neste caixa.</p>
                  </div>
                  <Input
                    type="intenger"
                    inputMode="numeric"
                    id={"entrada-estoque"}
                    label="Quantidade"
                    value={entradaEstoque}
                    onChange={(e) => {
                      // Permite campo vazio e apenas números
                      const value = e.target.value.replace(/\D/g, "");
                      setEntradaEstoque(value);
                    }}
                    placeholder="Ex: 10"
                    required
                    min={1}
                  />
                  <Button
                    className="flex-2"
                    color="var(--color-green)"
                    type="submit"
                    loading={fetchingMovimentacaoEstoque}
                  >
                    <p>Adicionar estoque</p>
                  </Button>
                </form>
                <div className="management-actions">
                  <Button
                    color="var(--color-blue)"
                    onClick={() => setEditando(true)}
                  >
                    <FaPen /> Editar produto
                  </Button>
                  <Button
                    color="var(--color-red)"
                    loading={fetchingDelete}
                    onClick={() => {
                      if (
                        props.produto?.id &&
                        confirm(
                          "Essa operação irá deletar também as movimentações de estoque e vendas desse produto. Deletar produto?"
                        )
                      )
                        handleDeleteProduto(props.produto.id);
                    }}
                  >
                    <FaTrash /> Excluir produto
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </Popup>
  );
}

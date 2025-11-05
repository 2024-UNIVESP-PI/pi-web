import {
  Dispatch,
  SetStateAction,
  useState,
  FormEvent,
  useEffect,
} from "react";
import { FaQrcode } from "react-icons/fa6";
import Popup from "..";
import Input from "../../Input";
import Button from "../../Button";
import { Produto } from "../../../services/produtoService";
import produtoService from "../../../services/produtoService";
import "./styles.scss";

export type PopupReservasProdutoProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  produto: Produto | null;
  onUpdate: () => void;
};

export default function PopupReservasProduto(props: PopupReservasProdutoProps) {
  const [formData, setFormData] = useState<{
    disponivel_reserva: boolean;
    limite_reserva: number;
    quantidade_reserva_disponivel: number;
  }>({
    disponivel_reserva: false,
    limite_reserva: 2,
    quantidade_reserva_disponivel: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.produto) {
      setFormData({
        disponivel_reserva: props.produto.disponivel_reserva || false,
        limite_reserva: props.produto.limite_reserva || 2,
        quantidade_reserva_disponivel:
          props.produto.quantidade_reserva_disponivel || 0,
      });
    }
  }, [props.produto, props.visible]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!props.produto) return;

    if (formData.disponivel_reserva) {
      if (formData.limite_reserva <= 0) {
        alert("Limite de reserva deve ser maior que zero");
        return;
      }
      if (formData.quantidade_reserva_disponivel < 0) {
        alert("Quantidade disponível não pode ser negativa");
        return;
      }
    }

    try {
      setLoading(true);
      const updateData: Partial<Produto> = {
        disponivel_reserva: formData.disponivel_reserva,
        limite_reserva: formData.disponivel_reserva
          ? formData.limite_reserva
          : undefined,
        quantidade_reserva_disponivel: formData.disponivel_reserva
          ? formData.quantidade_reserva_disponivel
          : undefined,
      };
      await produtoService.patchProduto(props.produto.id, updateData);
      props.onUpdate();
      props.setVisible(false);
    } catch (error: unknown) {
      console.error("Erro ao atualizar reservas:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      alert(errorMessage || "Erro ao atualizar configurações de reserva");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Popup
      visible={props.visible}
      setVisible={props.setVisible}
      id="popup-reservas-produto"
      icon={<FaQrcode />}
      title="Configurar Reservas Antecipadas"
    >
      {!props.produto ? (
        <p>Selecione um produto para configurar reservas</p>
      ) : (
        <form onSubmit={handleSubmit} className="reservas-form">
          <div className="produto-info">
            <h4>{props.produto.nome}</h4>
            <p>R$ {props.produto.preco.toFixed(2)}</p>
          </div>

          <div className="reserva-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.disponivel_reserva}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    disponivel_reserva: e.target.checked,
                  })
                }
              />
              <span>Disponível para reserva antecipada</span>
            </label>

            {formData.disponivel_reserva && (
              <div className="reserva-fields">
                <Input
                  id="limite-reserva"
                  label="Limite de reserva por item"
                  type="number"
                  min={1}
                  value={String(formData.limite_reserva)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limite_reserva: Number(e.target.value) || 2,
                    })
                  }
                  required={formData.disponivel_reserva}
                />
                <Input
                  id="quantidade-reserva-disponivel"
                  label="Quantidade disponível para reserva"
                  type="number"
                  min={0}
                  value={String(formData.quantidade_reserva_disponivel)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantidade_reserva_disponivel:
                        Number(e.target.value) || 0,
                    })
                  }
                  required={formData.disponivel_reserva}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <Button
              type="button"
              onClick={() => props.setVisible(false)}
              color="var(--color-gray)"
            >
              Cancelar
            </Button>
            <Button type="submit" color="var(--color-green)" loading={loading}>
              Salvar
            </Button>
          </div>
        </form>
      )}
    </Popup>
  );
}

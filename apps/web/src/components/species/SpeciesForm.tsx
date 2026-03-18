import { createSignal } from "solid-js";
import type { Species } from "~/lib/queries";
import { apiFetch } from "~/lib/api";
import { Modal } from "~/components/ui/Modal";
import { Input, Textarea } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";

interface SpeciesFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: Species;
}

export function SpeciesForm(props: SpeciesFormProps) {
  const isEdit = () => !!props.initial;
  const [name, setName] = createSignal(props.initial?.name ?? "");
  const [description, setDescription] = createSignal(props.initial?.description ?? "");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!name().trim()) {
      setError("名前を入力してください");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isEdit()) {
        await apiFetch(`/api/species/${props.initial!.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: name().trim(), description: description().trim() || null }),
        });
      } else {
        await apiFetch("/api/species", {
          method: "POST",
          body: JSON.stringify({ name: name().trim(), description: description().trim() || null }),
        });
      }
      props.onSaved();
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={props.open} onClose={props.onClose} title={isEdit() ? "種を編集" : "種を追加"}>
      <form onSubmit={handleSubmit} class="flex flex-col gap-4">
        <Input
          id="species-name"
          label="名前 *"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder="例: ヒヨドリ"
        />
        <Textarea
          id="species-desc"
          label="説明"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder="特徴など（省略可）"
          rows="3"
        />
        {error() && <p class="text-sm text-red-600">{error()}</p>}
        <div class="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={props.onClose}>
            キャンセル
          </Button>
          <Button type="submit" disabled={loading()}>
            {loading() ? "保存中…" : "保存"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

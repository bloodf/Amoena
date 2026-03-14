import { useState } from "react";
import { ScreenHeader, ScreenHeaderCopy, ScreenMain, ScreenRoot, ScreenSidebarLayout, ScreenSubtitle, ScreenTitle } from "@/components/screen";
import type { Opinion } from "@/composites/opinions/data";
import { initialOpinionCategories } from "@/composites/opinions/data";
import { OpinionsSidebar } from "@/composites/opinions/OpinionsSidebar";
import { OpinionList } from "@/composites/opinions/OpinionList";

export function OpinionsScreen() {
  const [categories, setCategories] = useState<{ name: string; opinions: Opinion[] }[]>(() =>
    initialOpinionCategories.map((category) => ({
      ...category,
      opinions: category.opinions.map((opinion) => ({ ...opinion })),
    })),
  );
  const [editingOpinion, setEditingOpinion] = useState<{ catIndex: number; opIndex: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newValue, setNewValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  const startEdit = (catIndex: number, opIndex: number) => {
    setEditingOpinion({ catIndex, opIndex });
    setEditValue(categories[catIndex].opinions[opIndex].value);
  };

  const saveEdit = () => {
    if (!editingOpinion) return;
    const { catIndex, opIndex } = editingOpinion;
    setCategories(prev => prev.map((cat, ci) =>
      ci === catIndex ? {
        ...cat,
        opinions: cat.opinions.map((o, oi) =>
          oi === opIndex ? { ...o, value: editValue } : o
        )
      } : cat
    ));
    setEditingOpinion(null);
  };

  const deleteOpinion = (catIndex: number, opIndex: number) => {
    setCategories(prev => prev.map((cat, ci) =>
      ci === catIndex ? {
        ...cat,
        opinions: cat.opinions.filter((_, oi) => oi !== opIndex)
      } : cat
    ));
  };

  const addOpinion = (catIndex: number) => {
    if (!newTitle.trim() || !newValue.trim()) return;
    setCategories(prev => prev.map((cat, ci) =>
      ci === catIndex ? {
        ...cat,
        opinions: [...cat.opinions, {
          title: newTitle,
          desc: newDesc || "Custom opinion",
          value: newValue,
          scope: "workspace" as const,
          editable: false,
        }]
      } : cat
    ));
    setAddingTo(null);
    setNewTitle("");
    setNewDesc("");
    setNewValue("");
  };

  return (
    <ScreenRoot className="overflow-hidden">
      <ScreenSidebarLayout>
        <OpinionsSidebar categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        <ScreenMain className="overflow-y-auto">
          <div className="mx-auto max-w-[800px] px-6 py-8">
            <ScreenHeader className="mb-2">
              <ScreenHeaderCopy>
                <ScreenTitle>{categories[selectedCategory].name}</ScreenTitle>
                <ScreenSubtitle className="mt-1 text-[13px]">Coding preferences that guide AI behavior across sessions.</ScreenSubtitle>
              </ScreenHeaderCopy>
            </ScreenHeader>

            <OpinionList
              opinions={categories[selectedCategory].opinions}
              categoryIndex={selectedCategory}
              editingOpinion={editingOpinion}
              editValue={editValue}
              adding={addingTo === selectedCategory}
              selectedCategory={selectedCategory}
              newTitle={newTitle}
              newDescription={newDesc}
              newValue={newValue}
              onStartEdit={startEdit}
              onEditValueChange={setEditValue}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingOpinion(null)}
              onDelete={deleteOpinion}
              onStartAdd={() => {
                setAddingTo(selectedCategory);
                setNewTitle("");
                setNewDesc("");
                setNewValue("");
              }}
              onNewTitleChange={setNewTitle}
              onNewDescriptionChange={setNewDesc}
              onNewValueChange={setNewValue}
              onAdd={() => addOpinion(selectedCategory)}
              onCancelAdd={() => setAddingTo(null)}
            />
          </div>
        </ScreenMain>
      </ScreenSidebarLayout>
    </ScreenRoot>
  );
}

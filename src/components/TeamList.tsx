"use client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { chipStyle } from "@/lib/branding";

export type Team = { id: number; name: string; abbr: string; logoUrl?: string | null };

export default function TeamList({ items, setItems }: { items: Team[]; setItems: (v: Team[]) => void }) {
  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const updated = Array.from(items);
    const [removed] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, removed);
    setItems(updated);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="teams">
        {(provided) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="rounded-xl border bg-white divide-y"
          >
            {items.map((t, index) => (
              <Draggable key={t.id} draggableId={String(t.id)} index={index}>
                {(prov, snapshot) => (
                  <li
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    className={`flex items-center gap-3 p-3 ${
                      snapshot.isDragging ? "bg-gray-50" : ""
                    }`}
                  >
                    <span className="w-6 text-right font-semibold tabular-nums">
                      {index + 1}
                    </span>
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-md text-white text-sm font-bold"
                      style={chipStyle(t.abbr)}
                    >
                      {t.abbr}
                    </span>
                    <span className="truncate">
                      {t.name} ({t.abbr})
                    </span>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}

import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import { MiroConnector } from "..";

export function MiroUI(components: OBC.Components) {
  const miroConnector = components.get(MiroConnector);

  const boardIdInput = document.createElement("bim-text-input");
  boardIdInput.label = "Board Id";
  boardIdInput.style.flex = "1";

  const categoryToCount = document.createElement("bim-dropdown");
  categoryToCount.label = "Category To Count";
  categoryToCount.style.flex = "1";

  categoryToCount.addEventListener("change", () => {
    BUI.ContextMenu.removeMenus();
  });

  miroConnector.categories.onItemAdded.add((category: string) => {
    const option = document.createElement("bim-option");

    option.label = category;
    option.value = category;

    categoryToCount.append(option);
  });

  const createStickyNote = async () => {
    if (boardIdInput.value === "" || categoryToCount.value[0].length === 0)
      return;
    await miroConnector.createStickyNote(
      boardIdInput.value,
      categoryToCount.value[0],
    );
  };

  return BUI.Component.create(() => {
    return BUI.html`
    <bim-toolbar-section style="display: flex;flex-direction: column;" label="Miro">
          <div style="flex: 1;">${boardIdInput}</div>
          <div style="flex: 1;">${categoryToCount}</div>
        <bim-button style="flex: 0;" label="Create Sticky Note" @click=${createStickyNote}></bim-button>
        <bim-button style="flex: 0;" label="Get Sticky Notes" @click=${() => {
          miroConnector.getData(boardIdInput.value);
        }}></bim-button>
    </bim-toolbar-section>
   `;
  });
}

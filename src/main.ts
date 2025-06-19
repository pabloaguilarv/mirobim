import * as OBC from "@thatopen/components";
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as FRAGS from "@thatopen/fragments";
import { AppManager, MiroConnector, MiroUI } from "./bim-components";

BUI.Manager.init();

const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);

const world = worlds.create<
  OBC.SimpleScene,
  OBC.OrthoPerspectiveCamera,
  OBC.SimpleRenderer
>();
world.name = "Main";

world.scene = new OBC.SimpleScene(components);
world.scene.setup();
world.scene.three.background = null;

const viewport = BUI.Component.create<BUI.Viewport>(() => {
  return BUI.html`
    <bim-viewport>
      <bim-grid floating></bim-grid>
    </bim-viewport>
    `;
});

world.renderer = new OBC.SimpleRenderer(components, viewport);
world.camera = new OBC.OrthoPerspectiveCamera(components);
world.camera.controls.setLookAt(183, 11, -102, 27, -52, -11);

const worldGrid = components.get(OBC.Grids).create(world);
worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
worldGrid.material.uniforms.uSize1.value = 2;
worldGrid.material.uniforms.uSize2.value = 8;

const appManager = components.get(AppManager);
const viewportGrid = viewport.querySelector<BUI.Grid>("bim-grid[floating]")!;
appManager.grids.set("viewport", viewportGrid);

components.init();

const workerUrl = "/node_modules/@thatopen/fragments/dist/Worker/worker.mjs";
const fragments = new FRAGS.FragmentsModels(workerUrl);
world.camera.controls.addEventListener("update", () => fragments.update(true));

fragments.models.list.onItemSet.add(({ value: model }) => {
  model.useCamera(world.camera.three);
  world.scene.three.add(model.object);
  fragments.update(true);
});

const input = document.createElement("input");
const askForFile = async (extension: string) => {
  const file = await new Promise<File | null>((resolve) => {
    input.type = "file";
    input.accept = extension;
    input.multiple = false;
    input.onchange = () => {
      const filesList = input.files;
      if (!(filesList && filesList[0])) {
        resolve(null);
        return;
      }
      const file = filesList[0];
      resolve(file);
    };
    input.click();
  });

  if (!file) return;

  const ifcBufferOne = await file.arrayBuffer();
  await fragments.load(ifcBufferOne, { modelId: file.name });
};

const miroConnector = components.get(MiroConnector);
miroConnector.fragments = fragments;
await miroConnector.init();

const toolbar = BUI.Component.create(() => {
  return BUI.html`
    <bim-tabs floating style="justify-self: center; border-radius: 0.5rem;">
      <bim-tab label="Load File">
        <bim-toolbar>
        <bim-toolbar-section>
          <bim-button label="Load Frags" @click=${() => {
            askForFile("frag");
          }}></bim-button>
        </bim-toolbar-section>
      </bim-toolbar>
      </bim-tab>
      <bim-tab label="DXF Planes" icon="">
        <bim-toolbar>
          ${MiroUI(components)}
        </bim-toolbar> 
      </bim-tab>
    </bim-tabs>
  `;
});

const app = document.getElementById("app") as BUI.Grid;

app.layouts = {
  main: {
    template: `
    "viewport" auto
    `,
    elements: {
      viewport,
    },
  },
};

app.layout = "main";

viewportGrid.layouts = {
  main: {
    template: `
      "empty" 1fr
      "toolbar" auto
      /1fr
    `,
    elements: { toolbar },
  },
};

viewportGrid.layout = "main";

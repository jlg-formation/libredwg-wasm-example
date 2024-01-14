import { dwgread } from "./dwgread.mjs";
import { dwgwrite } from "./dwgwrite.mjs";
import { $ } from "./utils.mjs";

// @ts-ignore
var saveAs = window.saveAs;
console.log("saveAs: ", saveAs);

/** @type {HTMLInputElement} */
// @ts-ignore
const input = $("input[type=file]");
input.addEventListener("change", async () => {
  if (input.files === null) {
    throw new Error("It is not a input[type=file]");
  }
  const selectedFile = input.files.item(0);
  if (selectedFile === null) {
    throw new Error("No selected file.");
  }
  const dwgFileContent = await selectedFile.arrayBuffer();
  await dwgread(dwgFileContent);
});

const saveAsDWGBtn = $("button.saveDWG");
saveAsDWGBtn.addEventListener("click", async () => {
  console.log("save as DWG");

  // take the JSON and put it in the WASM file system.
  // @ts-ignore
  const json = JSON.stringify(JSON.parse($("textarea").value));
  console.log("json: ", json);

  const dwgBuffer = await dwgwrite(json);
  const dwgContentBlob = new Blob([dwgBuffer]);
  saveAs(dwgContentBlob, "truc.dwg");
});

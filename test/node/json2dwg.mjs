import fs from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import createModule from "../../dist/libredwgwrite.mjs";

console.log("start to convert");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JSON_FILENAME = __dirname + "/../data/example.json";
const DWG_FILENAME = __dirname + "/../../tmp/new_example.dwg";
const WASM_JSON_FILENAME = "tmp.json";
const WASM_DWG_FILENAME = "tmp.dwg";

const jsonFileContent = await fs.readFile(JSON_FILENAME);
console.log("jsonFileContent: ", jsonFileContent);

const instance = await createModule({
  noInitialRun: true,
  printErr: () => {},
});

instance.FS.writeFile(WASM_JSON_FILENAME, new Uint8Array(jsonFileContent));

const main = instance.cwrap("main", "number", ["number", "number"]);

const makeMainArgs = (instance, array) => {
  // ASSUMPTION: pointer size is 4 bytes
  const ptr = instance._malloc(array.length * 4);
  for (let i = 0; i < array.length; i++) {
    const cstr = instance.stringToNewUTF8(array[i]);
    instance.setValue(ptr + i * 4, cstr, "i32");
  }
  return { argv: ptr, argc: array.length };
};

const args = [
  "dwgwrite",
  "-v0",
  "-y",
  "-I",
  "JSON",
  "-o",
  WASM_DWG_FILENAME,
  WASM_JSON_FILENAME,
];
const { argv, argc } = makeMainArgs(instance, args);

console.log("about to execute main");
main(argc, argv);
console.log("main executed.");

const buffer = instance.FS.readFile(WASM_DWG_FILENAME);
await fs.writeFile(DWG_FILENAME, buffer);

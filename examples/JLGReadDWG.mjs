import fs from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import createModule from "../dist/libredwg.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dwgFileContent = await fs.readFile(__dirname + "/data/example.dwg");

const instance = await createModule({
  noInitialRun: true,
  printErr: () => {},
});

const FILENAME = "tmp.dwg";

instance.FS.writeFile(FILENAME, new Uint8Array(dwgFileContent));

const main = instance.cwrap("main", "number", ["number", "number"]);

const makeArgv = (instance, array) => {
  // ASSUMPTION: a pointer is 4 bytes
  const ptr = instance._malloc(array.length * 4);
  for (let i = 0; i < array.length; i++) {
    const cstr = instance.stringToNewUTF8(array[i]);
    instance.setValue(ptr + i * 4, cstr, "i32");
  }
  return ptr;
};

const argv = makeArgv(instance, ["dwgread", "-v0", "-O", "JSON", FILENAME]);

main(5, argv);

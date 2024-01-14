import Module from "../../../dist/libredwgread.mjs";
import { $texterea } from "./utils.mjs";

export const dwgread = async (/** @type ArrayBuffer */ dwgFileContent) => {
  const textArea = $texterea("textarea");
  textArea.value = "";
  const jsonArray = [];
  const instance = await Module({
    noInitialRun: true,
    printErr: () => {},
    print: (str) => {
      jsonArray.push(str);
    },
  });

  const FILENAME = "tmp.dwg";
  instance.FS.writeFile(FILENAME, new Uint8Array(dwgFileContent));
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

  const args = ["dwgread", "-v0", "-O", "JSON", FILENAME];
  const { argv, argc } = makeMainArgs(instance, args);
  main(argc, argv);
  textArea.value = jsonArray.join("\n");
};

import createModuleInstance from "../../../dist/libredwgwrite.mjs";

export const dwgwrite = async (/** @type {string} */ json) => {
  console.log("json: ", json);

  const WASM_JSON_FILENAME = "tmp.json";
  const WASM_DWG_FILENAME = "tmp.dwg";

  const instance = await createModuleInstance({
    noInitialRun: true,
    printErr: () => {},
  });
  console.log("instance created");

  instance.FS.writeFile(WASM_JSON_FILENAME, json);
  console.log("json wasm file created");

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
  console.log("buffer: ", buffer);

  return buffer;
};

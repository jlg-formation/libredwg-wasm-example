var Module = Module;

const $ = (cssSelector) => {
  const elt = document.querySelector(cssSelector);
  if (elt === null) {
    throw new Error(`Cannot access element ${cssSelector}`);
  }
  return elt;
};

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

const dwgread = async (/** @type ArrayBuffer */ dwgFileContent) => {
  console.log("dwgread: start");
  const parentElt = $(".json");
  console.log("parentElt: ", parentElt);
  parentElt.innerHTML = "";

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

  parentElt.innerHTML = jsonArray.join("\n");
};

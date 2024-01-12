var Module = Module;
console.log("Module: ", Module);

const input = document.querySelector("input[type=file]");
if (!(input instanceof HTMLInputElement)) {
  throw new Error("bad input");
}

console.log("input: %O", input);
input.addEventListener("change", async () => {
  if (input.files === null) {
    throw new Error("bad input");
  }
  const selectedFile = input.files.item(0);
  if (selectedFile === null) {
    throw new Error("bad selected file");
  }
  console.log("selectedFile: ", selectedFile);

  const dwgFileContent = await selectedFile.arrayBuffer();
  await dwgread(dwgFileContent);
});

const dwgread = async (/** @type ArrayBuffer */ dwgFileContent) => {
  console.log("start dwgread");
  const parentElt = document.querySelector(".json");
  if (parentElt === null) {
    throw new Error("bad elt");
  }
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

  parentElt.innerHTML = jsonArray.join("\n");
};

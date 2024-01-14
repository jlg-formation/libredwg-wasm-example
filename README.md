# LibreDWG with WASM

## Install

Prerequisites:

- OS: Linux or Mac or Linux under Windows (WSL)
- GNU build essentials (gcc, make, etc.)
- Emscripten (https://emscripten.org/)
- curl

```
git clone https://github.com/jlg-formation/libredwg-wasm-example.git
make
```

## Use

```
make test
```

## License

MIT Licence

LibreDWG (GNU GPLv3) is used and a very little bit modified so it can compile properly with emscripten.
Modification are indicated in each modified files.

## DWG Specification

This document is the most interesting for DWG documentation:
https://www.opendesign.com/files/guestdownloads/OpenDesign_Specification_for_.dwg_files.pdf

## Author

Jean-Louis GUENEGO <jlguenego@gmail.com>

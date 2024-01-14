TMP_DIR=./tmp
OUTPUT_DIR=./dist

LIBREDWG_NAME=libredwg-0.12.5
LIBREDWG_ARCHIVE=$(LIBREDWG_NAME).tar.xz
LIBREDWG_EXTRACTED=$(TMP_DIR)/$(LIBREDWG_NAME).extracted
LIBREDWG_URL=https://ftp.gnu.org/gnu/libredwg/$(LIBREDWG_ARCHIVE)

OBJECT_LIST=$(TMP_DIR)/object_list.txt

READ_EMSCRIPTEN_JS=$(OUTPUT_DIR)/libredwgread.mjs
WRITE_EMSCRIPTEN_JS=$(OUTPUT_DIR)/libredwgwrite.mjs

build: wasm_build

$(LIBREDWG_ARCHIVE):
	curl $(LIBREDWG_URL) --output $(LIBREDWG_ARCHIVE)

$(LIBREDWG_EXTRACTED): $(LIBREDWG_ARCHIVE)
	tar -xf $(LIBREDWG_ARCHIVE)
	mkdir -p $(TMP_DIR)
	echo done > $(LIBREDWG_EXTRACTED)

$(LIBREDWG_NAME)/Makefile: $(LIBREDWG_EXTRACTED) correction/dwg2SVG.c correction/dwggrep.c
# applying correctif
	cp ./correction/dwg2SVG.c ./$(LIBREDWG_NAME)/programs
	cp ./correction/dwggrep.c ./$(LIBREDWG_NAME)/programs
# building the libredwg library with emscripten (this take time)
	cd $(LIBREDWG_NAME) && emconfigure ./configure --disable-python --disable-bindings

$(OBJECT_LIST): $(LIBREDWG_NAME)/Makefile
	cd $(LIBREDWG_NAME) && emmake make
# Create a file for proof that we have compiled with success everything.
	mkdir -p $(TMP_DIR)
	find ./$(LIBREDWG_NAME)/src -name "*.o" | grep -v '/.libs/' > $(OBJECT_LIST)


wasm_build: $(OBJECT_LIST)
	mkdir -p $(OUTPUT_DIR)
	emcc `cat $(OBJECT_LIST)` \
	./$(LIBREDWG_NAME)/programs/dwgread.o -o $(READ_EMSCRIPTEN_JS) \
	-sEXPORTED_FUNCTIONS=_free,_malloc,_memset,_main \
	-sMODULARIZE \
	-sEXPORT_ES6 \
	-sEXPORTED_RUNTIME_METHODS=FS,ENV,ccall,cwrap,UTF8ToString,stringToNewUTF8,setValue
	emcc `cat $(OBJECT_LIST)` \
	./$(LIBREDWG_NAME)/programs/dwgwrite.o -o $(WRITE_EMSCRIPTEN_JS) \
	-sEXPORTED_FUNCTIONS=_free,_malloc,_memset,_main \
	-sMODULARIZE \
	-sEXPORT_ES6 \
	-sEXPORTED_RUNTIME_METHODS=FS,ENV,ccall,cwrap,UTF8ToString,stringToNewUTF8,setValue


.PHONY: clean softclean test

test: dwg2json json2dwg
	
	

dwg2json:
	node test/node/dwg2json.mjs | tee tmp/example.json

json2dwg:
	node test/node/json2dwg.mjs

test-web:
	npx serve
	
verysoftclean:
	rm -rf dist 

softclean: verysoftclean
	rm -rf $(LIBREDWG_NAME) tmp

clean: softclean
	rm -rf $(LIBREDWG_ARCHIVE)

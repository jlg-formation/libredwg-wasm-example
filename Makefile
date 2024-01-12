LIBREDWG_NAME=libredwg-0.12.5
LIBREDWG_ARCHIVE=$(LIBREDWG_NAME).tar.xz
LIBREDWG_URL=https://ftp.gnu.org/gnu/libredwg/$(LIBREDWG_ARCHIVE)
TMP_DIR=./tmp
OBJECT_LIST=$(TMP_DIR)/object_list.txt
OUTPUT_DIR=./dist
EMSCRIPTEN_JS_OUTPUT_FILE=$(OUTPUT_DIR)/libredwg.js

build: wasm_build

$(LIBREDWG_ARCHIVE):
	curl $(LIBREDWG_URL) --output $(LIBREDWG_ARCHIVE)

$(LIBREDWG_NAME): $(LIBREDWG_ARCHIVE)
	tar -xf $(LIBREDWG_ARCHIVE)

$(OBJECT_LIST): $(LIBREDWG_NAME) ./correction/dwg2SVG.c ./correction/dwggrep.c
# applying correctif
	cp ./correction/dwg2SVG.c ./$(LIBREDWG_NAME)/programs
	cp ./correction/dwggrep.c ./$(LIBREDWG_NAME)/programs
# building the libredwg library with emscripten (this take time)
	cd $(LIBREDWG_NAME) && emconfigure ./configure 
	cd $(LIBREDWG_NAME) && emmake make
# Create a file for proof that we have compiled with success everything.
	mkdir -p $(TMP_DIR)
	find ./$(LIBREDWG_NAME)/src -name "*.o" | grep -v '/.libs/' > $(OBJECT_LIST)


wasm_build: $(OBJECT_LIST)
	mkdir -p $(OUTPUT_DIR)
	emcc `cat $(OBJECT_LIST)` \
	./$(LIBREDWG_NAME)/programs/dwgread.o -o $(EMSCRIPTEN_JS_OUTPUT_FILE) \
	-sEXPORTED_FUNCTIONS=_free,_malloc,_memset,_main \
	-sMODULARIZE \
	-sEXPORTED_RUNTIME_METHODS=FS,ENV,ccall,cwrap,UTF8ToString,stringToNewUTF8,setValue

.PHONY: clean softclean test

test:
	node test/node/dwg2json.mjs | tee tmp/example.json

test-web:
	npx serve
	
verysoftclean:
	rm -rf dist tmp

softclean: verysoftclean
	rm -rf $(LIBREDWG_NAME) 

clean: softclean
	rm -rf $(LIBREDWG_ARCHIVE)

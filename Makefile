LIBREDWG_NAME=libredwg-0.12.5
LIBREDWG_ARCHIVE=$(LIBREDWG_NAME).tar.xz
LIBREDWG_URL=https://ftp.gnu.org/gnu/libredwg/$(LIBREDWG_ARCHIVE)

build: $(LIBREDWG_NAME)

$(LIBREDWG_ARCHIVE):
	curl $(LIBREDWG_URL) --output $(LIBREDWG_ARCHIVE)

$(LIBREDWG_NAME): $(LIBREDWG_ARCHIVE)
	tar -xf $(LIBREDWG_ARCHIVE)

.PHONY: clean


softclean:
	rm -rf $(LIBREDWG_NAME)

clean: softclean
	rm -rf $(LIBREDWG_ARCHIVE)

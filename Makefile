LIBREDWG_URL=https://ftp.gnu.org/gnu/libredwg/libredwg-0.12.5.tar.xz

libredwg-0.12.5.tar.xz:
	curl $(LIBREDWG_URL) --output libredwg-0.12.5.tar.xz

.PHONY: clean

clean:
	rm -rf libredwg-0.12.5.tar.xz

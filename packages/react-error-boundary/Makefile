.PHONY: build build-es build-cjs clean
default: clean build

INSTALL_DIR=./../../node_modules/typescript/bin/
TSC=$(INSTALL_DIR)tsc

build: build-cjs build-es
	
build-es:
	$(TSC) -p tsconfig.es.json

build-cjs:
	$(TSC) -p tsconfig.cjs.json

clean:
	rm -rf ./lib
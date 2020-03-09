.PHONY: build clean
default: build

build: 
	./node_modules/.bin/lerna run build --concurrency 8

clean: 
	rm -rf packages/*/lib
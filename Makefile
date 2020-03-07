.PHONY: build 
default: build

build: 
	./node_modules/.bin/lerna run build --concurrency 8
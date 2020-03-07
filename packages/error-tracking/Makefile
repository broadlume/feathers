.PHONY: build clean
default: build

TSC=./node_modules/.bin/tsc
ROLLUP=./node_modules/.bin/rollup

build: 
	$(TSC) -b tsconfig.*.json
	$(ROLLUP) -c rollup.config.js

clean:
	rm -rf ./lib
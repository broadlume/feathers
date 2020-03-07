.PHONY: build clean
default: build

TSC=./node_modules/.bin/tsc

build: 
	$(TSC) -b tsconfig.*.json

clean:
	rm -rf ./lib
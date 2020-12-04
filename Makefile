.PHONY: setup build test clean publish

# Binaries folder
NODE_BIN=./node_modules/.bin

# Print help 
help: 
	@echo "Available commands"
	@echo ""
	@echo "  make build               Build bundles" 
	@echo "  make clean               Clean the bundles of this package"
	@echo "  make install             Install all dependencies"
	@echo "  make test                Run tests"
	@echo ""

# Install all dependencies of the repository
install:
	npm install

# Build bundles 
build:
	${MAKE} clean
	./node_modules/.bin/rollup -c rollup.config.js 

# Clean a package
clean: 
	rm -rf dist

# Publish the package 
publish: 
	${MAKE} build
	cp README.md ./dist/
	cp package.json ./dist/
	cd ./dist && npm publish

# Run tests
test: 
	${MAKE} build 
	./node_modules/.bin/mocha --reporter spec 


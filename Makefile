all: langbundle.js

langbundle.js: internals/*.js
	cd internals && \
	node node_modules/browserify/bin/cmd.js \
		-r ./lang \
		-r ./builtins \
		-r ./typesystem \
		-r ./arith \
		-o ../langbundle.js

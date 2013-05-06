all: langbundle.js

langbundle.js: internals/*.js
	cd internals && \
	node node_modules/browserify/bin/cmd.js \
		-r ./lang.js \
		-r ./builtins.js \
		-r ./typesystem.js \
		-r ./arith.js \
		-o ../langbundle.js

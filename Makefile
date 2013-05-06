LATEXMK := latexmk -pdf -pdflatex="pdflatex -interaction=nonstopmode"



all: langbundle.js report/report.pdf

langbundle.js: internals/*.js
	cd internals && \
	node node_modules/browserify/bin/cmd.js \
		-r ./lang \
		-r ./builtins \
		-r ./typesystem \
		-r ./arith \
		-o ../langbundle.js

report/report.pdf: report/report.tex
	cd report && $(LATEXMK) -use-make report.tex > /dev/null

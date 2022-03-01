default:
	rm -f bibtexify.xpi
	zip -1 -r bibtexify.xpi * -x@xpi.ignore

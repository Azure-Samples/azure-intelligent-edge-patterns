import linecache
import sys
import logging

def PrintGetExceptionDetails():
    exType, exValue, exTraceback = sys.exc_info()

    tbFrame = exTraceback.tb_frame
    lineNo = exTraceback.tb_lineno
    fileName = tbFrame.f_code.co_filename

    linecache.checkcache(fileName)
    line = linecache.getline(fileName, lineNo, tbFrame.f_globals)

    exMessage = 'Exception:\n\tFile name: {0}\n\tLine number: {1}\n\tLine: {2}\n\tValue: {3}'.format(fileName, lineNo, line.strip(), exValue)

    logging.info(exMessage)

    return exType, exValue, exTraceback
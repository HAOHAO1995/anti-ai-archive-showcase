"""Shared deterministic JSON/CSV codec. Arrays are JSON; CSV formula prefixes are escaped."""
import json

def flatten(row, prefix=''):
    out={}
    for k,v in row.items():
        key=prefix+k
        if isinstance(v,dict):out.update(flatten(v,key+'.'))
        else:out[key]=v
    return out

def csv_cell(value):
    text=(json.dumps(value,ensure_ascii=False,separators=(',',':')) if isinstance(value,(list,bool)) or value is None else str(value))
    # Spreadsheet import can evaluate formulas after whitespace/control characters.
    return "'"+text if text.lstrip(' \t\r\n').startswith(('=','+','-','@')) or text.startswith(('\t','\r','\n',"'")) else text

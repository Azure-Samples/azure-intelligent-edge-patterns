import os
import subprocess

# Example usage : 
# command = 'ls -l'.split()
# res = run_command(command)
# for line in res:
#    print(line)
def run_command(cmd, workingdir='/workspace', envvars=None):
    "return comm tuple containing stdout and stderr - is piped to STDOUT"
    rval = subprocess.Popen(cmd, cwd=workingdir, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, stdin=subprocess.PIPE, env=envvars)
    return iter(rval.stdout.readline, b'')

# Example usage : 
# command = 'ls -l'
# res = run_cmd_with_tmp_file(command)
# for line in res:
#    print(line)
def run_command_with_tmp_file(cmd):
    "uses a tmp file to store output of command"
    fname = 'tmp.txt'
    cmd_with_redirect = cmd + ' > ' + fname
    os.system(cmd_with_redirect)
    return open(fname, 'r').read()

# Merge 2 Python Dictionaries
def merge_dict(dict1, dict2):
    return(dict2.update(dict1))
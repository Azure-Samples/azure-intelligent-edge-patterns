import argparse
import pathlib

parser = argparse.ArgumentParser("compare")
parser.add_argument("--input01", type=str, help="Input #1")
parser.add_argument("--input02", type=str, help="Input #2")
parser.add_argument("--input03", type=str, help="Input #3")
parser.add_argument("--input04", type=str, help="Input #4")
parser.add_argument("--input05", type=str, help="Input #5")
parser.add_argument("--input06", type=str, help="Input #6")
parser.add_argument("--input07", type=str, help="Input #7")
parser.add_argument("--input08", type=str, help="Input #8")
parser.add_argument("--input09", type=str, help="Input #9")
parser.add_argument("--input10", type=str, help="Input #10")
parser.add_argument("--compare_output", type=str, help="Path of output comparison result")

args = parser.parse_args()

lines = [f'Input #1: {args.input01}', f'Evaluation output path: {args.compare_output}']

pathlib.Path(args.compare_output).parent.absolute().mkdir(parents=True, exist_ok=True)
with open(args.compare_output, 'w') as file:
    for line in lines:
        print(line)
        file.write(line + "\n")
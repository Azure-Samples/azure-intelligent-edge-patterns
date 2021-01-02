import argparse
import pathlib

parser = argparse.ArgumentParser("score")
parser.add_argument("--scoring_result", type=str, help="Path of scoring result")
parser.add_argument("--eval_output", type=str, help="Path of output evaluation result")

args = parser.parse_args()

lines = [f'Scoring result path: {args.scoring_result}', f'Evaluation output path: {args.eval_output}']

pathlib.Path(args.eval_output).parent.absolute().mkdir(parents=True, exist_ok=True)
with open(args.eval_output, 'w') as file:
    for line in lines:
        print(line)
        file.write(line + "\n")
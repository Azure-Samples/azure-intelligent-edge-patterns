import argparse
import pathlib

parser = argparse.ArgumentParser("score")
parser.add_argument("--model_input", type=str, help="Path of input model")
parser.add_argument("--test_data", type=str, help="Path to test data")
parser.add_argument("--score_output", type=str, help="Path of scoring output")

args = parser.parse_args()

lines = [f'Model path: {args.model_input}', f'Test data path: {args.test_data}', f'Scoring output path: {args.score_output}']

pathlib.Path(args.score_output).parent.absolute().mkdir(parents=True, exist_ok=True)
with open(args.score_output, 'w') as file:
    for line in lines:
        print(line)
        file.write(line + "\n")
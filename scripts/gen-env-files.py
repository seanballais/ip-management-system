# Helps us create the environment file variables used in our services.
import argparse
import tomllib
import typing

from pathlib import Path


def main():
    # Set up argparse.
    parser: argparse.ArgumentParser = argparse.ArgumentParser()
    parser.add_argument('src_file', help='source file to generate into environment files')
    args: argparse.Namespace = parser.parse_args()

    src_file_path: Path = Path(args.src_file)
    print(f'Reading from: {src_file_path}...')

    target_env_file_path: str = ''
    target_env_file_docker_path: str = ''
    env_file_data: dict[str, typing.Any] = {}
    env_file_docker_data: dict[str, typing.Any] = {}
    with open(src_file_path, 'rb') as f:
        src_data = tomllib.load(f)
        for k, v in src_data.items():
            if k == 'target_path':
                target_env_file_path = str(v)
            elif k == 'target_path_docker':
                target_env_file_docker_path = str(v)
            else:
                key: str = k
                value: typing.Any = v['value']

                env_file_data[key] = value

                if 'docker_var_name' in v:
                    docker_var_name: str = v['docker_var_name']
                    env_file_docker_data[docker_var_name] = value

    print('env_file_data:', env_file_data)
    print('env_file_docker_data:', env_file_docker_data)


if __name__ == '__main__':
    main()

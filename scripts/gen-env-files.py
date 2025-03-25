# Helps us create the environment file variables used in our services.
import os
from pathlib import Path

def main():
    base_url = Path(__file__).parent.parent

    # Set the working directory to the project root.
    os.chdir(base_url)

    # Auth DB Environment File


if __name__ == '__main__':
    main()

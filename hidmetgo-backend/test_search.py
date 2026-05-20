import os
import sys

this_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(this_dir, 'app'))

from hidmetgo_agent.agent import search_providers

def run():
    print("Testing search_providers...")
    result = search_providers(service="electrician", location="G-13")
    print(result)

if __name__ == "__main__":
    run()

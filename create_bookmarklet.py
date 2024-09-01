#! /usr/bin/python3
import re
import sys

def create_bookmarklet(js_file_path):
    with open(js_file_path, 'r') as file:
        js_code = file.read()

    # Remove single-line comments
    js_code = re.sub(r'//.*', '', js_code)
    # Remove multi-line comments
    js_code = re.sub(r'/\*[\s\S]*?\*/', '', js_code)
    # Remove whitespace
    # js_code = re.sub(r'\s+', ' ', js_code).strip()

    # Create the bookmarklet
    bookmarklet = f"javascript:{js_code}"

    return bookmarklet

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <path_to_js_file>")
        sys.exit(1)

    js_file_path = sys.argv[1]
    bookmarklet = create_bookmarklet(js_file_path)
    sys.stdout.write(bookmarklet)

import argparse
import sys
import os

# Ensure we can import originality.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from originality import TextOriginalityRequest

def main():
    parser = argparse.ArgumentParser(description="Text Originality Engine CLI")
    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # Register Command
    register_parser = subparsers.add_parser('register', help='Register a text asset')
    register_parser.add_argument('file_path', type=str, help='Path to the text file (.txt, .pdf, .docx)')
    register_parser.add_argument('--id', type=str, required=True, help='Unique Asset ID')

    # Check Command
    check_parser = subparsers.add_parser('check', help='Check document originality')
    check_parser.add_argument('file_path', type=str, help='Path to the text file to check')

    args = parser.parse_args()
    
    engine = TextOriginalityRequest()

    if args.command == 'register':
        if not os.path.exists(args.file_path):
            print(f"Error: File '{args.file_path}' not found.")
            return

        success, msg = engine.register_text(args.file_path, args.id)
        if success:
            print(f"[SUCCESS] {msg}")
        else:
            print(f"[ERROR] {msg}")

    elif args.command == 'check':
        if not os.path.exists(args.file_path):
            print(f"Error: File '{args.file_path}' not found.")
            return

        classification, match_id, similarity = engine.check_originality(args.file_path)
        
        print("-" * 30)
        print(f"CLASSIFICATION: {classification}")
        if match_id:
            print(f"CLOSEST MATCH : {match_id} (Similarity: {similarity:.2f})")
        else:
            print(f"SIMILARITY    : {similarity:.2f}")
        print("-" * 30)

    else:
        parser.print_help()

if __name__ == "__main__":
    main()

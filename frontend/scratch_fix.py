import os

src_dir = r"d:\SaliqBanday\frontend\src"
for root, dirs, files in os.walk(src_dir):
    for filename in files:
        if filename.endswith(".tsx") or filename.endswith(".jsx"):
            # skip the BorderGlow file itself
            if filename == "BorderGlow.jsx": continue
            
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if '<BorderGlow' in content and 'import BorderGlow' not in content:
                import_statement = "import BorderGlow from '@/components/ReactBits/BorderGlow';"
                
                # Try to inject immediately after the last import
                lines = content.split('\n')
                last_import_idx = -1
                for idx, line in enumerate(lines):
                    if line.startswith('import '):
                        last_import_idx = idx
                
                if last_import_idx != -1:
                    lines.insert(last_import_idx + 1, import_statement)
                    new_content = '\n'.join(lines)
                else:
                    # just stick it after 'use client' if there is one
                    if len(lines) > 0 and "use client" in lines[0]:
                         lines.insert(1, import_statement)
                         new_content = '\n'.join(lines)
                    else:
                         new_content = import_statement + "\n" + content
            
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Injected import into {filepath}")

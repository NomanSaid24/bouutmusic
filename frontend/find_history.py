import os
import json
import time

history_dir = r"C:\Users\Noman\AppData\Roaming\Code\User\History"

def search_history():
    # April 13, 2026 approx
    cutoff = time.time() - (7 * 86400)
    
    found = []
    
    for folder_name in os.listdir(history_dir):
        folder_path = os.path.join(history_dir, folder_name)
        if not os.path.isdir(folder_path):
            continue
            
        entries_path = os.path.join(folder_path, "entries.json")
        if not os.path.exists(entries_path):
            continue
            
        try:
            with open(entries_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                resource = data.get("resource", "")
                entries = data.get("entries", [])
                
                if not entries: continue
                
                recent = [e for e in entries if (e.get("timestamp", 0) / 1000.0) > cutoff]
                if recent:
                    found.append((recent[-1].get("timestamp"), resource, folder_path, recent))
        except:
            pass
            
    found.sort(key=lambda x: x[0], reverse=True)
    
    for ts, res, folder, ents in found[:100]:
        print(f"{time.ctime(ts/1000.0)} | {res} | {len(ents)} entries | {folder}")

search_history()

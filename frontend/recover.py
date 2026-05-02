import os
import json
import time

history_dir = r"C:\Users\Noman\AppData\Roaming\Code\User\History"
project_root_lower = r"d:\saliqbanday".lower()

def search_history():
    recent_files = []
    
    # Approx 7 days ago
    cutoff = time.time() - (7 * 86400)
    
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
        except:
            continue
                
        resource = data.get("resource", "")
        # Normalize path
        resource_path_lower = resource.lower().replace("file:///", "").replace("%3a", ":").replace("/", "\\")
        
        if project_root_lower in resource_path_lower:
            entries = data.get("entries", [])
            recent_entries = [e for e in entries if (e.get("timestamp", 0) / 1000.0) > cutoff]
            
            if recent_entries:
                recent_files.append({
                    "resource": resource,
                    "folder": folder_path,
                    "entries": recent_entries
                })
                
    recent_files.sort(key=lambda x: x["entries"][-1]["timestamp"], reverse=True)
    
    print(f"Found {len(recent_files)} project files modified in the last 7 days.")
    for f in recent_files:
        print(f"File: {f['resource']}")
        print(f"  Folder: {f['folder']}")
        # Show all entry times to find the right one
        for e in f['entries']:
            print(f"    - {time.ctime(e['timestamp']/1000.0)} (id: {e.get('id')})")
        print()

search_history()

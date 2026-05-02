import subprocess

def find_lost_code():
    try:
        out = subprocess.check_output(['git', 'fsck', '--lost-found'], stderr=subprocess.STDOUT).decode()
    except Exception as e:
        print(f"Error running git fsck: {e}")
        return

    blobs = []
    for line in out.splitlines():
        if 'blob' in line:
            parts = line.split()
            if len(parts) >= 3:
                blobs.append(parts[2])

    print(f"Found {len(blobs)} dangling blobs. Checking for project code...")
    
    for b in blobs:
        try:
            content = subprocess.check_output(['git', 'show', b], stderr=subprocess.DEVNULL).decode(errors='ignore')
            # Look for markers of the missing work
            markers = ['AdminDashboardPage', 'ServicePrice', 'PromotionService', 'Pricing', 'Artist Support']
            for m in markers:
                if m in content:
                    print(f"\nPotential match in blob {b} (contains '{m}'):")
                    print("-" * 60)
                    # Print first 500 characters
                    print(content[:500])
                    print("-" * 60)
                    break
        except:
            pass

if __name__ == "__main__":
    find_lost_code()

import re

file_path = '/home/maxreim/Dokumente/GitHub/altepostsils/index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace .jpg, .JPG, .jpeg
content = re.sub(r'\.jpe?g', '.webp', content, flags=re.IGNORECASE)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Replaced index.html')

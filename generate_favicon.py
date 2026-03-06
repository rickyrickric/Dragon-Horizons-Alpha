from PIL import Image

# Colors
NAVY = (26, 26, 46)           # #1A1A2E
CRIMSON = (233, 69, 96)       # #E94560
DARK_RED = (180, 40, 60)      # Darker red for depth
GOLD = (218, 165, 32)         # Gold for eye
DARK_NAVY = (15, 15, 30)      # Very dark for depth

# Create 32x32 image
size = 32
img = Image.new('RGBA', (size, size), NAVY + (255,))
pixels = img.load()

# Dragon head pixel art design (Minecraft style)
# Using coordinates (x, y) where (0, 0) is top-left
dragon_pixels = {
    # Head shape - main dragon head
    (12, 8): CRIMSON, (13, 8): CRIMSON, (14, 8): CRIMSON, (15, 8): CRIMSON,
    (16, 8): CRIMSON, (17, 8): CRIMSON, (18, 8): CRIMSON, (19, 8): CRIMSON,
    
    # Head row 2
    (11, 9): CRIMSON, (12, 9): GOLD, (13, 9): GOLD, (14, 9): CRIMSON,
    (15, 9): CRIMSON, (16, 9): CRIMSON, (17, 9): GOLD, (18, 9): GOLD, (19, 9): CRIMSON, (20, 9): CRIMSON,
    
    # Head row 3 - eyes
    (10, 10): CRIMSON, (11, 10): CRIMSON, (12, 10): GOLD, (13, 10): DARK_NAVY, (14, 10): GOLD, (15, 10): CRIMSON,
    (16, 10): CRIMSON, (17, 10): GOLD, (18, 10): DARK_NAVY, (19, 10): GOLD, (20, 10): CRIMSON, (21, 10): CRIMSON,
    
    # Head row 4
    (10, 11): CRIMSON, (11, 11): GOLD, (12, 11): GOLD, (13, 11): GOLD, (14, 11): CRIMSON,
    (15, 11): CRIMSON, (16, 11): GOLD, (17, 11): GOLD, (18, 11): GOLD, (19, 11): CRIMSON, (20, 11): CRIMSON,
    
    # Head row 5
    (11, 12): CRIMSON, (12, 12): CRIMSON, (13, 12): CRIMSON, (14, 12): CRIMSON,
    (15, 12): CRIMSON, (16, 12): CRIMSON, (17, 12): CRIMSON, (18, 12): CRIMSON, (19, 12): CRIMSON,
    
    # Left horn - back
    (8, 6): DARK_RED, (8, 7): DARK_RED, (9, 7): CRIMSON,
    (8, 8): CRIMSON, (9, 8): CRIMSON,
    
    # Right horn - back
    (23, 6): DARK_RED, (23, 7): DARK_RED, (22, 7): CRIMSON,
    (23, 8): CRIMSON, (22, 8): CRIMSON,
    
    # Left horn - front
    (7, 5): DARK_RED, (7, 6): CRIMSON,
    (6, 5): DARK_RED,
    
    # Right horn - front
    (24, 5): DARK_RED, (24, 6): CRIMSON,
    (25, 5): DARK_RED,
    
    # Jaw/snout
    (13, 13): CRIMSON, (14, 13): CRIMSON, (15, 13): CRIMSON, (16, 13): CRIMSON, (17, 13): CRIMSON, (18, 13): CRIMSON,
    
    (13, 14): CRIMSON, (14, 14): GOLD, (15, 14): GOLD, (16, 14): GOLD, (17, 14): GOLD, (18, 14): CRIMSON,
    
    (14, 15): CRIMSON, (15, 15): CRIMSON, (16, 15): CRIMSON, (17, 15): CRIMSON,
    
    # Neck/body below head
    (12, 16): DARK_RED, (13, 16): CRIMSON, (14, 16): CRIMSON, (15, 16): CRIMSON, (16, 16): CRIMSON, (17, 16): CRIMSON, (18, 16): CRIMSON, (19, 16): DARK_RED,
    
    (12, 17): CRIMSON, (13, 17): CRIMSON, (14, 17): GOLD, (15, 17): GOLD, (16, 17): GOLD, (17, 17): GOLD, (18, 17): CRIMSON, (19, 17): CRIMSON,
    
    (12, 18): CRIMSON, (13, 18): GOLD, (14, 18): GOLD, (15, 18): GOLD, (16, 18): GOLD, (17, 18): GOLD, (18, 18): GOLD, (19, 18): CRIMSON,
    
    (12, 19): DARK_RED, (13, 19): CRIMSON, (14, 19): CRIMSON, (15, 19): CRIMSON, (16, 19): CRIMSON, (17, 19): CRIMSON, (18, 19): CRIMSON, (19, 19): DARK_RED,
}

# Apply dragon pixels
for (x, y), color in dragon_pixels.items():
    if 0 <= x < size and 0 <= y < size:
        pixels[x, y] = color + (255,)

# Save as PNG
img.save('public/favicon.png')
print("✓ Created favicon.png (32x32 PNG)")

# Also save as ICO
img.save('public/favicon.ico')
print("✓ Created favicon.ico (32x32 ICO)")

# Show pixel dimensions confirmation
print(f"\nFavicon details:")
print(f"  Size: {img.size[0]}x{img.size[1]} pixels")
print(f"  Colors: Navy (#1A1A2E), Crimson (#E94560), Gold accents")
print(f"  Files: favicon.png, favicon.ico")

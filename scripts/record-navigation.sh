#!/usr/bin/env bash
set -e

mkdir -p .aistudio/artifacts/computer_use public/assets/navigation

trap 'playwright-cli close 2>/dev/null || true' EXIT

echo "Opening browser at 390x844..."
playwright-cli open --browser=chromium http://localhost:3000
playwright-cli resize 390 844
sleep 1.5

echo "Starting video recording..."
playwright-cli video-start .aistudio/artifacts/computer_use/navigation_motion_showcase.webm
sleep 1

# Step 1: Home active state
echo "1. On Home page"
sleep 1

# Step 2: Tap Order
echo "2. Tap Order"
playwright-cli click "button:has-text('Order')"
sleep 1.5

# Step 3: Tap Home
echo "3. Tap Home"
playwright-cli click "button:has-text('Home')"
sleep 1.5

# Step 4: Tap Profile
echo "4. Tap Profile"
playwright-cli click "button:has-text('Profile')"
sleep 1.8

# Step 5: Tap floating Home
echo "5. Tap floating coral Home pill"
playwright-cli click "button[aria-label='Back to Home']"
sleep 1.5

# Step 6: Tap Profile again
echo "6. Tap Profile again"
playwright-cli click "button:has-text('Profile')"
sleep 1.8

# Step 7: Android/browser Back
echo "7. Android/Browser Back"
playwright-cli eval "window.history.back()"
sleep 1.8

echo "Stopping video..."
playwright-cli video-stop
sleep 1

# Convert webm to mp4 using ffmpeg for best compatibility
if command -v ffmpeg >/dev/null 2>&1; then
  echo "Converting to MP4..."
  ffmpeg -y -i .aistudio/artifacts/computer_use/navigation_motion_showcase.webm \
    -c:v libx264 -pix_fmt yuv420p -movflags faststart \
    .aistudio/artifacts/computer_use/navigation_motion_showcase.mp4
  # Also copy to public/assets/navigation/ for download or viewing
  cp .aistudio/artifacts/computer_use/navigation_motion_showcase.mp4 public/assets/navigation/
fi

echo "Done!"
ls -lh .aistudio/artifacts/computer_use/

#!/usr/bin/env bash
mkdir -p public/assets/menu public/assets/categories public/assets/services

SRC="public/assets/aistudio/Campora_Caf__Food_Ordering_App_4__3da8220b.png"

# Food items photo area (width=416, height=188)
# Row 1
ffmpeg -y -i "$SRC" -filter:v "crop=416:188:36:755" public/assets/menu/dark-chocolate-cake.png
ffmpeg -y -i "$SRC" -filter:v "crop=416:188:480:755" public/assets/menu/chicken-burger.png

# Row 2
ffmpeg -y -i "$SRC" -filter:v "crop=416:188:36:1030" public/assets/menu/paneer-paratha.png
ffmpeg -y -i "$SRC" -filter:v "crop=416:188:480:1030" public/assets/menu/masala-dosa.png

# Row 3
ffmpeg -y -i "$SRC" -filter:v "crop=416:188:36:1305" public/assets/menu/jalebi.png
ffmpeg -y -i "$SRC" -filter:v "crop=416:188:480:1305" public/assets/menu/idli-sambar.png

# Categories (circular icons ~ 102x102)
ffmpeg -y -i "$SRC" -filter:v "crop=102:102:30:510" public/assets/categories/all.png
ffmpeg -y -i "$SRC" -filter:v "crop=102:102:160:510" public/assets/categories/sweets.png
ffmpeg -y -i "$SRC" -filter:v "crop=102:102:290:510" public/assets/categories/paratha.png
ffmpeg -y -i "$SRC" -filter:v "crop=102:102:425:510" public/assets/categories/north_indian.png
ffmpeg -y -i "$SRC" -filter:v "crop=102:102:565:510" public/assets/categories/idli.png
ffmpeg -y -i "$SRC" -filter:v "crop=102:102:695:510" public/assets/categories/chinese.png
ffmpeg -y -i "$SRC" -filter:v "crop=102:102:825:510" public/assets/categories/beverages.png

echo "Crop completed."

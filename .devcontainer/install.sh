#!/usr/bin/env bash
set -e

echo "🔧 Updating APT..."
sudo apt-get update

echo "🔧 Installing GNU build essentials and curl..."
sudo apt-get install -y \
  build-essential \
  curl \
  git

echo "🔧 Installing Emscripten SDK (emsdk)..."
if [ ! -d /opt/emsdk ]; then
  sudo git clone https://github.com/emscripten-core/emsdk.git /opt/emsdk
fi

sudo chown -R "$(id -u)":"$(id -g)" /opt/emsdk

cd /opt/emsdk
./emsdk install latest
./emsdk activate latest

# Add Emscripten env to future terminals
if ! grep -q 'emsdk_env.sh' "$HOME/.bashrc" 2>/dev/null; then
  echo "source /opt/emsdk/emsdk_env.sh" >> ~/.bashrc
fi

echo "🎉 Installation complete!"

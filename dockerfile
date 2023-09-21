# Start with the Gitpod image
FROM gitpod/workspace-full:latest AS gitpod

# Switch to the gitpod user
USER gitpod


# Install Node.js via nvm (Node Version Manager)
RUN bash -c ". .nvm/nvm.sh \
    && nvm install 18 \
    && nvm use 18 \
    && nvm alias default 18"

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

WORKDIR /workspace/appflow

# Install dependencies
RUN sudo apt-get update \
    && sudo apt-get install -y --no-install-recommends \
        xvfb x11vnc fluxbox dbus-x11 x11-utils x11-xserver-utils xdg-utils \
        fbautostart xterm eterm gnome-terminal gnome-keyring seahorse nautilus \
        libx11-dev libxkbfile-dev libsecret-1-dev libnotify4 libnss3 libxss1 \
        libasound2 libgbm1 xfonts-base xfonts-terminus fonts-noto fonts-wqy-microhei \
        fonts-droid-fallback vim-tiny nano libgconf2-dev libgtk-3-dev twm \
    && sudo apt-get clean && sudo rm -rf /var/cache/apt/* && sudo rm -rf /var/lib/apt/lists/* && sudo rm -rf /tmp/*


# Copy package.json and yarn.lock files
COPY package*.json ./

# RUN yarn run installation && yarn run-app
RUN yarn run installation

# Copy all other project files
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Define the command to run your application
CMD [ "yarn", "run", "run-app" ]

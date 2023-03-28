FROM node 
# copy  'package.json'  (if available)
WORKDIR /frontend
COPY package.json .

# update to correct version of npm and fix peer deps
RUN npm install -g npm@8.19.3

# install project dependencies
RUN npm install --legacy-peer-deps

# copy project files and folders to the current working directory (i.e. 'client' folder)
COPY . .

# build client for production with minification
RUN npm run build

# copy project files and folders to the current working directory (i.e. 'client' folder)
# COPY . .

EXPOSE 3000

#ENTRYPOINT ["tail", "-f", "/dev/null"]
CMD ["npm", "run", "start"]


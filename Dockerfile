FROM jgoerzen/debian-base-minimal
WORKDIR /usr/app
COPY package*.json ./
RUN apt-get update && \
    apt-get -y install zip && \
    apt-get -y install curl && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash && \
    apt-get install -y nodejs && \
    apt-get -y install fontforge 
COPY . .
CMD [ "npm", "start" ]

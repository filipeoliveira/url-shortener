FROM node:8
MAINTAINER filipe.jtoliveira@gmail.com

# Create an app directory
RUN mkdir -p /usr/src/url-shortener
WORKDIR /usr/src/url-shortener

# Copy project ().npm settings and package.json) into container
COPY . /usr/src/url-shortener

#Install dependencies
RUN npm install --silent

# Default door to adonisJS
EXPOSE 3333
CMD ["npm", "start"]

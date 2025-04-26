FROM node:20

WORKDIR /app

COPY Project/package*.json ./
RUN npm ci

COPY Project ./

EXPOSE 8080
CMD ["sh", "-c", "if [ \"$MODE\" = \"prod\" ]; then npm run build; else npm start; fi"]
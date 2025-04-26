FROM node:23

WORKDIR /app

COPY Project ./

CMD ["sh", "-c", "if [ \"$MODE\" = \"prod\" ]; then npm run build; else npm start; fi"]
FROM node:19-alpine3.16
WORKDIR /app
COPY . .
# RUN npm install

RUN npm install @babel/cli
RUN npm install @babel/core
RUN npm install @babel/node
RUN npm install @babel/preset-env
RUN npm install axios
RUN npm install bcryptjs
RUN npm install body-parser
RUN npm install cors
RUN npm install dotenv
RUN npm install express
RUN npm install express-fileupload
RUN npm install helmet
RUN npm install jsonwebtoken
RUN npm install moment
RUN npm install mongoose
RUN npm install morgan
RUN npm install mysql
RUN npm install nodemailer
RUN npm install pg
RUN npm install read-excel-file
RUN npm install sprintf
RUN npm install xlsx



ENTRYPOINT ["node", "src/antoback.js"]



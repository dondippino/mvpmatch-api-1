# MVPMAtch Product API

## Installation

- Setup PostgreSQL database (version 12 and above).
- Create a new database with a name of your choosing.
- Generate RSA key pair (2048 bit), needed for JWT signing and verification.
- Run npm install to install all dependencies.
- Create a .env file in the root of the project .
- Add a variable name of the database connection string, e.g. `DATABASE_URL="postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]"` to the .env file.
- Add variable `AUTH_PRIVATE_KEY= "< RSA private key >" `to the .env file.
- Add variable `AUTH_PUBLIC_KEY= "< RSA public key >" `to the .env file.
- (Optional) Add variable ``PORT=`< port number>` to listen on your chosen port number.
- Run `npx prisma db push` to push schema to the database, (Also use this command to push changes in the schema to the database).

## Testing

- Run Unit Tests with `npm run test`

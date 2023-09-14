# Doink! #
Stay closer, spend smarter, and make memories effortlessly with Doink – the all-in-one app for friend groups!

## Description ##
Doink is the ultimate app for friend groups looking to strengthen their bonds and stay seamlessly connected. With a versatile set of features, Doink simplifies your life in various ways. Manage your finances effortlessly with an integrated IOUs system and bill-splitting tool. Plan unforgettable events with ease using our RSVP system and a nifty carpooling feature. Stay socially engaged with your friends by sharing quotes and updates reminiscent of X(formally known as Twitter). Keep the conversation flowing through our intuitive chat feature. And when it's time to shop or budget for a shared goal, Doink offers shopping lists and a GoFundMe-style budgeting system. With Doink, cohesion, and organization have never been smoother with your friend group.

## Config ##

### Environment Variables
- `DATABASE_URL`: The URL of the database to connect to.
- `REDIS_URL`: The URL of the Redis server to connect to.
- `SESSION_SECRET`: The secret used to sign the session cookie.
- `PORT`: The port to listen on (Optional).
- `NODE_ENV`: **production** by default, set to **development** when working locally.

### Installation ###
```
npm install
```

### Migrate Database
Before running the app make sure that the DB is up to date
```
npx prisma generate
npx prisma migrate deploy
```

### Run Server
```
npm start
```

### Using Docker-Compose
```
docker-compose up
```
 
# External Links
- Frontend [Repo](https://github.com/noname-friend-app/friend-app-client)
- Live API: [doink.otterlabs.co/login](https://doink.otterlabs.co)
- Live Dev API: [dev.doink.otterlabs.co/](https://dev.doink.otterlabs.co/)

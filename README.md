# Doink! #
Stay closer, spend smarter, and make memories effortlessly with Doink – the all-in-one app for friend groups!

## Description ##
Doink is the ultimate app for friend groups looking to strengthen their bonds and stay seamlessly connected. With a versatile set of features, Doink simplifies your life in various ways. Manage your finances effortlessly with an integrated IOUs system and bill-splitting tool. Plan unforgettable events with ease using our RSVP system and a nifty carpooling feature. Stay socially engaged with your friends by sharing quotes and updates reminiscent of X(formally known as Twitter). Keep the conversation flowing through our intuitive chat feature. And when it's time to shop or budget for a shared goal, Doink offers shopping lists and a GoFundMe-style budgeting system. With Doink, cohesion, and organization have never been smoother with your friend group.

## Config ##

### Environment Variables ###
> **DATABASE_URL**: URL to Postgres database  
> **REDIS_URL**: URL to redis database  
> **SESSION_SECRET**: random session string for session encryption  
> **PORT**: port to be served on

### Run Server
```
npm install
npm start
```
 
# External Links
- Frontend [Repo](https://github.com/noname-friend-app/friend-app-client)

## Environment Variables
- `DATABASE_URL`: The URL of the database to connect to.
- `REDIS_URL`: The URL of the redis server to connect to.
- `SECRET_SESSION`: The secret used to sign the session cookie.
- `PORT`: The port to listen on (Optional).

# unfollowed.lol Google Extension and Server

## Server

We have a `User` model with `followers`, `following`, `unfollowers`, and `fans` (people who you don't follow back). This means that each one of these is basically lists of `Users` inside of them. 

For example, if Bob followed Alice, Bob's Following Model would comprise the Alice `User` **Object**.

There are some other changes that were made in this PR as well:
- changing the name from unfollowers to fans
- connecting the extension to the backend

### If you have trouble setting this up on your end, here might be some helpful scripts:

**Be sure to run your docker server first and to reload your Google Extension**
```
docker-compose up # or through docker desktop
```

**You need to run the server first by running this, it should open up in localhost**
```
python3 manage.py runserver
```

**If you made changes to the database or if this is the first time you set up the server,
migrate the database changes to the docker PostgreSQL database**

```py
python3 manage.py makemigrations server
python3 manage.py migrate server
```


